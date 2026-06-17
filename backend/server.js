const express = require('express');
const cors = require('cors');
const crypto = require('crypto');
const fs = require('fs');
const path = require('path');

// [File Handling] Baca/tulis file via fs module
const { Stack } = require('./data-structures/Stack');
const { DoublyLinkedList } = require('./data-structures/DoublyLinkedList');
const { CircularLinkedList } = require('./data-structures/CircularLinkedList');
const { PriorityQueue } = require('./data-structures/PriorityQueue');
const { BinarySearchTree } = require('./data-structures/BinarySearchTree');
const { HashTable } = require('./data-structures/HashTable');
const { Graph } = require('./data-structures/Graph');
const { Sorter } = require('./data-structures/Sorter');

const app = express();
app.use(cors());
app.use(express.json());

// ─── Data Store ─────────────────────────────────────────
const DB_PATH = path.join(__dirname, 'data', 'database.json');

let db = {};
let graph = new Graph();
let schedules = new DoublyLinkedList();
let officers = new CircularLinkedList();
let ticketTree = new BinarySearchTree();
let userTable = new HashTable();
let bookingStacks = {}; // keyed by userId
let waitingLists = {};  // keyed by scheduleId

function loadDatabase() {
  const raw = fs.readFileSync(DB_PATH, 'utf-8');
  db = JSON.parse(raw);

  // Rebuild Graph
  graph = new Graph();
  for (const st of db.stations) graph.addStation(st);
  for (const r of db.routes) graph.addRoute(r.from, r.to, r.distance);

  // Rebuild DLL (schedules)
  schedules = new DoublyLinkedList();
  for (const sc of db.schedules) schedules.insert(sc);

  // Rebuild CLL (officers)
  officers = new CircularLinkedList();
  for (const of_ of db.officers) officers.addOfficer(of_);

  // Rebuild BST (tickets)
  ticketTree = new BinarySearchTree();
  for (const tk of db.tickets) ticketTree.insert(tk);

  // Rebuild HashTable (users)
  userTable = new HashTable();
  for (const u of db.users) userTable.set(u.email, u);

  // Rebuild PriorityQueues (waiting lists)
  waitingLists = {};
  for (const wl of db.waitingList) {
    if (!waitingLists[wl.scheduleId]) waitingLists[wl.scheduleId] = new PriorityQueue();
    waitingLists[wl.scheduleId].enqueue(wl, wl.priority);
  }

  bookingStacks = {};
}

function saveDatabase() {
  // [File Handling] Tulis data ke file via fs module
  db.tickets = ticketTree.inOrder();
  db.waitingList = [];
  for (const [scheduleId, pq] of Object.entries(waitingLists)) {
    const entries = [];
    const temp = [];
    while (!pq.isEmpty()) temp.push(pq.dequeue());
    for (const entry of temp) {
      db.waitingList.push(entry);
      entries.push(entry);
    }
    waitingLists[scheduleId] = new PriorityQueue();
    for (const e of entries) waitingLists[scheduleId].enqueue(e, e.priority);
  }
  fs.writeFileSync(DB_PATH, JSON.stringify(db, null, 2), 'utf-8');
}

function generateId(prefix) {
  return prefix + '-' + Math.random().toString(36).substring(2, 8).toUpperCase();
}

function hashPassword(password) {
  return crypto.createHash('sha256').update(password).digest('hex');
}

loadDatabase();

// ─── Auth Routes ────────────────────────────────────────

app.post('/api/auth/register', (req, res) => {
  // [Exception Handling] try...catch untuk menangani error
  try {
    const { email, password, name } = req.body;
    if (!email || !password || !name) {
      return res.status(400).json({ error: 'Email, password, and name are required' });
    }
    if (userTable.has(email)) {
      return res.status(409).json({ error: 'Email already registered' });
    }
    const user = {
      id: generateId('US'),
      email,
      password: hashPassword(password),
      name,
      role: 'user'
    };
    db.users.push(user);
    userTable.set(email, user);
    saveDatabase();
    const { password: _, ...safe } = user;
    res.status(201).json(safe);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.post('/api/auth/login', (req, res) => {
  try {
    const { email, password } = req.body;
    const user = userTable.get(email);
    if (!user || user.password !== hashPassword(password)) {
      return res.status(401).json({ error: 'Invalid email or password' });
    }
    const { password: _, ...safe } = user;
    res.json(safe);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.get('/api/auth/profile/:id', (req, res) => {
  try {
    const entries = userTable.display();
    const user = entries.find(e => e.value.id === req.params.id);
    if (!user) return res.status(404).json({ error: 'User not found' });
    const { password: _, ...safe } = user.value;
    res.json(safe);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ─── Route & Search (Graph) ─────────────────────────────

app.get('/api/routes/stations', (req, res) => {
  res.json(graph.getAllStations());
});

app.get('/api/routes/shortest', (req, res) => {
  try {
    const { from, to } = req.query;
    if (!from || !to) return res.status(400).json({ error: 'from and to query params required' });
    const result = graph.findShortestPath(from, to);
    if (!result) return res.status(404).json({ error: 'No route found' });

    // [STL Find] Ekuivalen std::find — cari jadwal di rute tersebut
    const scheduleList = schedules.display();
    const routeSchedules = [];
    for (let i = 0; i < result.path.length - 1; i++) {
      const fromId = result.path[i].id;
      const toId = result.path[i + 1].id;
      // [Lambda Expression] Arrow function sebagai predicate
      const matches = scheduleList.filter(s =>
        (s.from === fromId && s.to === toId) || (s.from === toId && s.to === fromId)
      );
      routeSchedules.push(...matches);
    }

    // [Lambda Expression] Sort by price
    const sorted = Sorter.quickSort(routeSchedules, (a, b) => a.price - b.price);
    res.json({ path: result, schedules: sorted });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.get('/api/routes/alternatives', (req, res) => {
  try {
    const { from, to } = req.query;
    if (!from || !to) return res.status(400).json({ error: 'from and to query params required' });
    const paths = graph.findAllPaths(from, to);
    if (paths.length === 0) return res.status(404).json({ error: 'No routes found' });
    res.json(paths);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ─── Schedules (DLL + Sorter) ───────────────────────────

app.get('/api/schedules', (req, res) => {
  try {
    let result = schedules.display();
    const { from, to, sortBy } = req.query;
    if (from) result = result.filter(s => s.from === from);
    if (to) result = result.filter(s => s.to === to);

    // [Lambda Expression] Sort comparator
    if (sortBy === 'price') {
      result = Sorter.quickSort(result, (a, b) => a.price - b.price);
    } else if (sortBy === 'departure') {
      result = Sorter.mergeSort(result, (a, b) => a.departure.localeCompare(b.departure));
    }

    // [STL Count] Ekuivalen std::count
    const total = result.length;
    res.json({ total, schedules: result });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.post('/api/schedules', (req, res) => {
  try {
    const { trainId, from, to, departure, arrival, price, availableSeats } = req.body;
    if (!trainId || !from || !to || !departure || !arrival || !price) {
      return res.status(400).json({ error: 'All schedule fields are required' });
    }
    const schedule = {
      id: generateId('SC'),
      trainId, from, to, departure, arrival, price,
      availableSeats: availableSeats || 80
    };
    db.schedules.push(schedule);
    schedules.insert(schedule);
    saveDatabase();
    res.status(201).json(schedule);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.put('/api/schedules/:id', (req, res) => {
  try {
    const existing = schedules.search(req.params.id);
    if (!existing) return res.status(404).json({ error: 'Schedule not found' });
    schedules.delete(req.params.id);
    const updated = { ...existing, ...req.body, id: req.params.id };
    db.schedules = db.schedules.filter(s => s.id !== req.params.id);
    db.schedules.push(updated);
    schedules.insert(updated);
    saveDatabase();
    res.json(updated);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.delete('/api/schedules/:id', (req, res) => {
  try {
    const deleted = schedules.delete(req.params.id);
    if (!deleted) return res.status(404).json({ error: 'Schedule not found' });
    db.schedules = db.schedules.filter(s => s.id !== req.params.id);
    saveDatabase();
    res.json({ message: 'Schedule deleted', id: req.params.id });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ─── Booking (Stack + PriorityQueue + BST) ──────────────

app.post('/api/booking/start', (req, res) => {
  try {
    const { userId } = req.body;
    if (!userId) return res.status(400).json({ error: 'userId required' });
    bookingStacks[userId] = new Stack();
    bookingStacks[userId].push({ step: 0, action: 'init' });
    res.json({ message: 'Booking started', step: 0 });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.post('/api/booking/select-train', (req, res) => {
  try {
    const { userId, scheduleId } = req.body;
    const stack = bookingStacks[userId];
    if (!stack) return res.status(400).json({ error: 'No active booking session' });
    const schedule = schedules.search(scheduleId);
    if (!schedule) return res.status(404).json({ error: 'Schedule not found' });
    stack.push({ step: 1, action: 'select-train', scheduleId, schedule });
    res.json({ step: 1, schedule });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.post('/api/booking/passenger-info', (req, res) => {
  try {
    const { userId, passengerName, priority, priorityReason } = req.body;
    const stack = bookingStacks[userId];
    if (!stack) return res.status(400).json({ error: 'No active booking session' });
    stack.push({ step: 2, action: 'passenger-info', passengerName, priority, priorityReason });
    res.json({ step: 2, passengerName, priority });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.post('/api/booking/confirm', (req, res) => {
  try {
    const { userId } = req.body;
    const stack = bookingStacks[userId];
    if (!stack) return res.status(400).json({ error: 'No active booking session' });

    const steps = stack.toArray();
    const step1 = steps.find(s => s.step === 1);
    const step2 = steps.find(s => s.step === 2);
    if (!step1 || !step2) return res.status(400).json({ error: 'Incomplete booking steps' });

    const schedule = step1.schedule;
    if (schedule.availableSeats <= 0) {
      return res.status(400).json({ error: 'No seats available. Join waiting list instead.' });
    }

    const ticket = {
      bookingCode: generateId('BK'),
      userId,
      scheduleId: step1.scheduleId,
      passengerName: step2.passengerName,
      priority: step2.priority || 'regular',
      priorityReason: step2.priorityReason || '',
      bookedAt: new Date().toISOString(),
      status: 'confirmed'
    };

    // Update available seats
    const scIdx = db.schedules.findIndex(s => s.id === step1.scheduleId);
    if (scIdx !== -1) {
      db.schedules[scIdx].availableSeats--;
      schedules.delete(step1.scheduleId);
      schedules.insert(db.schedules[scIdx]);
    }

    db.tickets.push(ticket);
    ticketTree.insert(ticket);
    stack.push({ step: 3, action: 'confirm', ticket });
    saveDatabase();
    delete bookingStacks[userId];

    res.status(201).json({ message: 'Booking confirmed', ticket });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.post('/api/booking/undo', (req, res) => {
  try {
    const { userId } = req.body;
    const stack = bookingStacks[userId];
    if (!stack || stack.isEmpty()) return res.status(400).json({ error: 'Nothing to undo' });
    const popped = stack.pop();
    res.json({ message: 'Undo successful', removed: popped, currentStep: stack.peek() });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.delete('/api/booking/cancel/:code', (req, res) => {
  try {
    const ticket = ticketTree.search(req.params.code);
    if (!ticket) return res.status(404).json({ error: 'Ticket not found' });

    if (ticket.status === 'cancelled') {
      return res.status(400).json({ error: 'Ticket already cancelled' });
    }

    // Restore seat
    const scIdx = db.schedules.findIndex(s => s.id === ticket.scheduleId);
    if (scIdx !== -1) {
      db.schedules[scIdx].availableSeats++;
      schedules.delete(ticket.scheduleId);
      schedules.insert(db.schedules[scIdx]);
    }

    // Process waiting list
    if (waitingLists[ticket.scheduleId] && !waitingLists[ticket.scheduleId].isEmpty()) {
      const next = waitingLists[ticket.scheduleId].dequeue();
      next.status = 'confirmed';
      ticketTree.insert(next);
      db.tickets = db.tickets.filter(t => t.bookingCode !== next.bookingCode);
      db.tickets.push(next);
    }

    // Soft-delete: tandai cancelled, simpan cancelledAt
    ticket.status = 'cancelled';
    ticket.cancelledAt = new Date().toISOString();
    ticketTree.delete(req.params.code);
    ticketTree.insert(ticket);
    const tIdx = db.tickets.findIndex(t => t.bookingCode === req.params.code);
    if (tIdx !== -1) db.tickets[tIdx] = ticket;
    saveDatabase();
    res.json({ message: 'Ticket cancelled', bookingCode: req.params.code });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ─── Waiting List (PriorityQueue) ───────────────────────

app.post('/api/waiting-list/join', (req, res) => {
  try {
    const { scheduleId, passengerName, priority, priorityReason, userId } = req.body;
    if (!scheduleId || !passengerName) {
      return res.status(400).json({ error: 'scheduleId and passengerName required' });
    }
    if (!waitingLists[scheduleId]) waitingLists[scheduleId] = new PriorityQueue();

    const entry = {
      id: generateId('WL'),
      scheduleId,
      passengerName,
      priority: priority || 1,
      priorityReason: priorityReason || 'regular',
      bookedAt: new Date().toISOString(),
      userId: userId || '',
      bookingCode: generateId('BK'),
      status: 'waiting'
    };
    waitingLists[scheduleId].enqueue(entry, entry.priority);
    db.waitingList.push(entry);
    saveDatabase();
    res.status(201).json(entry);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.get('/api/waiting-list', (req, res) => {
  try {
    const result = [];
    for (const [scheduleId, pq] of Object.entries(waitingLists)) {
      const entries = [];
      const temp = [];
      while (!pq.isEmpty()) temp.push(pq.dequeue());
      for (const e of temp) {
        entries.push(e);
        result.push(e);
      }
      waitingLists[scheduleId] = new PriorityQueue();
      for (const e of entries) waitingLists[scheduleId].enqueue(e, e.priority);
    }
    res.json(result);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ─── Check-in (BST) ─────────────────────────────────────

app.get('/api/checkin/:code', (req, res) => {
  try {
    const ticket = ticketTree.search(req.params.code);
    if (!ticket) return res.status(404).json({ error: 'Booking code not found' });
    const schedule = schedules.search(ticket.scheduleId);
    const train = db.trains.find(t => t.id === (schedule ? schedule.trainId : ''));
    res.json({ ticket, schedule, train });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ─── Shift Management (CLL) ─────────────────────────────

app.get('/api/shifts', (req, res) => {
  res.json({
    current: officers.getCurrent(),
    all: officers.display()
  });
});

app.post('/api/shifts/rotate', (req, res) => {
  officers.rotate();
  res.json({
    message: 'Shift rotated',
    current: officers.getCurrent(),
    all: officers.display()
  });
});

// ─── Health ──────────────────────────────────────────────

app.get('/api/health', (req, res) => {
  res.json({
    status: 'ok',
    stations: graph.getAllStations().length,
    schedules: schedules.size,
    tickets: ticketTree.inOrder().length,
    users: userTable.size
  });
});

const PORT = 3001;
app.listen(PORT, () => {
  console.log(`NeoTransit backend running on port ${PORT}`);
});
