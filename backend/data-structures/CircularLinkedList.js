// [struct] Ekuivalen struct C++ menggunakan class
class CLLNode {
  constructor(data) {
    this.data = data;
    // [Pointer] Simulasi pointer via referensi objek
    this.next = null;
  }
}

class CircularLinkedList {
  constructor() {
    this.head = null;
    this.current = null;
    this.size = 0;
  }

  addOfficer(officer) {
    const node = new CLLNode(officer);
    if (!this.head) {
      this.head = node;
      node.next = node; // circular: points to itself
      this.current = node;
    } else {
      // Insert at end
      let tail = this.head;
      while (tail.next !== this.head) {
        tail = tail.next;
      }
      tail.next = node;
      node.next = this.head;
    }
    this.size++;
  }

  removeOfficer(id) {
    if (!this.head) return null;

    let prev = null;
    let curr = this.head;

    for (let i = 0; i < this.size; i++) {
      if (curr.data.id === id) {
        if (this.size === 1) {
          this.head = null;
          this.current = null;
        } else {
          if (curr === this.head) this.head = curr.next;
          // Find the node before curr
          let before = curr;
          while (before.next !== curr) before = before.next;
          before.next = curr.next;
          if (this.current === curr) this.current = curr.next;
        }
        this.size--;
        return curr.data;
      }
      curr = curr.next;
    }
    return null;
  }

  rotate() {
    if (!this.current) return null;
    this.current = this.current.next;
    return this.current.data;
  }

  getCurrent() {
    if (!this.current) return null;
    return this.current.data;
  }

  display() {
    const arr = [];
    if (!this.head) return arr;
    let curr = this.head;
    for (let i = 0; i < this.size; i++) {
      arr.push(curr.data);
      curr = curr.next;
    }
    return arr;
  }
}

module.exports = { CircularLinkedList, CLLNode };
