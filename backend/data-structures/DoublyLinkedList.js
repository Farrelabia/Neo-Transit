// [struct] Ekuivalen struct C++ menggunakan class
class DLLNode {
  constructor(data) {
    this.data = data;
    // [Pointer] Simulasi pointer via referensi objek
    this.prev = null;
    this.next = null;
  }
}

class DoublyLinkedList {
  constructor() {
    this.head = null;
    this.tail = null;
    this.size = 0;
  }

  insert(data) {
    const node = new DLLNode(data);
    if (!this.head) {
      this.head = node;
      this.tail = node;
    } else {
      // Insert sorted by departure time
      let current = this.head;
      while (current && current.data.departure < data.departure) {
        current = current.next;
      }
      if (!current) {
        // Append to tail
        node.prev = this.tail;
        this.tail.next = node;
        this.tail = node;
      } else if (current === this.head) {
        // Insert before head
        node.next = this.head;
        this.head.prev = node;
        this.head = node;
      } else {
        // Insert before current
        node.prev = current.prev;
        node.next = current;
        current.prev.next = node;
        current.prev = node;
      }
    }
    this.size++;
  }

  delete(id) {
    let current = this.head;
    while (current) {
      if (current.data.id === id) {
        if (current.prev) current.prev.next = current.next;
        else this.head = current.next;
        if (current.next) current.next.prev = current.prev;
        else this.tail = current.prev;
        this.size--;
        return current.data;
      }
      current = current.next;
    }
    return null;
  }

  search(id) {
    let current = this.head;
    while (current) {
      if (current.data.id === id) return current.data;
      current = current.next;
    }
    return null;
  }

  // [Default Argument] sortKey default ke departure
  toArray(sortKey = 'departure') {
    const arr = [];
    let current = this.head;
    while (current) {
      arr.push(current.data);
      current = current.next;
    }
    return arr;
  }

  display() {
    return this.toArray();
  }

  // [STL Iterator] Ekuivalen iterator C++ menggunakan Symbol.iterator
  *[Symbol.iterator]() {
    let current = this.head;
    while (current) {
      yield current.data;
      current = current.next;
    }
  }
}

module.exports = { DoublyLinkedList, DLLNode };
