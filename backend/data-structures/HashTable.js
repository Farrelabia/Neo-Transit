class HashTable {
  constructor(bucketCount = 50) {
    this.buckets = new Array(bucketCount).fill(null).map(() => []);
    this.bucketCount = bucketCount;
    this.size = 0;
  }

  _hash(key) {
    let hash = 0;
    for (let i = 0; i < key.length; i++) {
      hash = (hash * 31 + key.charCodeAt(i)) % this.bucketCount;
    }
    return hash;
  }

  // [References] Objek user di-pass by reference, tidak disalin
  set(key, value) {
    const index = this._hash(key);
    const bucket = this.buckets[index];
    // Check if key already exists (update)
    for (let i = 0; i < bucket.length; i++) {
      if (bucket[i].key === key) {
        bucket[i].value = value;
        return;
      }
    }
    // Collision handling: chaining
    bucket.push({ key, value });
    this.size++;
  }

  get(key) {
    const index = this._hash(key);
    const bucket = this.buckets[index];
    for (const entry of bucket) {
      if (entry.key === key) return entry.value;
    }
    return null;
  }

  delete(key) {
    const index = this._hash(key);
    const bucket = this.buckets[index];
    for (let i = 0; i < bucket.length; i++) {
      if (bucket[i].key === key) {
        bucket.splice(i, 1);
        this.size--;
        return true;
      }
    }
    return false;
  }

  has(key) {
    return this.get(key) !== null;
  }

  display() {
    const entries = [];
    for (const bucket of this.buckets) {
      for (const entry of bucket) {
        entries.push({ key: entry.key, value: entry.value });
      }
    }
    return entries;
  }
}

module.exports = { HashTable };
