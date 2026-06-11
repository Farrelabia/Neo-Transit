// [struct] Ekuivalen struct C++ menggunakan class
class StackNode {
  constructor(data) {
    this.data = data;
    // [Pointer] Simulasi pointer via referensi objek
    this.next = null;
  }
}

class Stack {
  constructor() {
    this.top = null;
    this.size = 0;
  }

  push(data) {
    const node = new StackNode(data);
    node.next = this.top;
    this.top = node;
    this.size++;
    return this.size;
  }

  pop() {
    if (this.isEmpty()) return null;
    const node = this.top;
    this.top = this.top.next;
    this.size--;
    // [References] Objek JS di-pass by reference, data tetap bisa diakses caller
    return node.data;
  }

  peek() {
    if (this.isEmpty()) return null;
    return this.top.data;
  }

  isEmpty() {
    return this.size === 0;
  }

  clear() {
    this.top = null;
    this.size = 0;
  }

  toArray() {
    const arr = [];
    let current = this.top;
    while (current) {
      arr.push(current.data);
      current = current.next;
    }
    return arr;
  }
}

module.exports = { Stack, StackNode };
