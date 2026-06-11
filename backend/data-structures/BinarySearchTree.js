// [struct] Ekuivalen struct C++ menggunakan class
class BSTNode {
  constructor(data) {
    this.data = data;
    // [Pointer] Simulasi pointer via referensi objek
    this.left = null;
    this.right = null;
  }
}

class BinarySearchTree {
  constructor() {
    this.root = null;
  }

  insert(data) {
    const node = new BSTNode(data);
    if (!this.root) {
      this.root = node;
      return;
    }
    this._insertNode(this.root, node);
  }

  _insertNode(current, node) {
    if (node.data.bookingCode < current.data.bookingCode) {
      if (!current.left) current.left = node;
      else this._insertNode(current.left, node);
    } else {
      if (!current.right) current.right = node;
      else this._insertNode(current.right, node);
    }
  }

  // [Function Overloading] Disiasati via pengecekan tipe
  search(key) {
    if (typeof key === 'string') {
      return this._searchByCode(this.root, key);
    }
    // [STL Find] Ekuivalen std::find — cari berdasarkan objek
    if (typeof key === 'object' && key.bookingCode) {
      return this._searchByCode(this.root, key.bookingCode);
    }
    return null;
  }

  _searchByCode(node, code) {
    if (!node) return null;
    if (code === node.data.bookingCode) return node.data;
    if (code < node.data.bookingCode) return this._searchByCode(node.left, code);
    return this._searchByCode(node.right, code);
  }

  delete(key) {
    const code = typeof key === 'string' ? key : key.bookingCode;
    this.root = this._deleteNode(this.root, code);
  }

  _deleteNode(node, code) {
    if (!node) return null;
    if (code < node.data.bookingCode) {
      node.left = this._deleteNode(node.left, code);
    } else if (code > node.data.bookingCode) {
      node.right = this._deleteNode(node.right, code);
    } else {
      if (!node.left && !node.right) return null;
      if (!node.left) return node.right;
      if (!node.right) return node.left;
      // Find inorder successor
      let successor = node.right;
      while (successor.left) successor = successor.left;
      node.data = successor.data;
      node.right = this._deleteNode(node.right, successor.data.bookingCode);
    }
    return node;
  }

  inOrder() {
    const result = [];
    this._inOrder(this.root, result);
    return result;
  }

  _inOrder(node, result) {
    if (!node) return;
    this._inOrder(node.left, result);
    result.push(node.data);
    this._inOrder(node.right, result);
  }

  display() {
    return this.inOrder();
  }
}

module.exports = { BinarySearchTree, BSTNode };
