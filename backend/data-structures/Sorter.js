// [namespace] Pengelompokan fungsi sorting dalam object
const Sorter = {
  // [Lambda Expression] compareFn menggunakan arrow function
  // [Callback Function] compareFn adalah callback yang menentukan urutan
  quickSort(arr, compareFn = (a, b) => a - b) {
    if (arr.length <= 1) return arr;

    const pivot = arr[arr.length - 1];
    const left = [];
    const right = [];

    for (let i = 0; i < arr.length - 1; i++) {
      if (compareFn(arr[i], pivot) <= 0) {
        left.push(arr[i]);
      } else {
        right.push(arr[i]);
      }
    }

    return [
      ...this.quickSort(left, compareFn),
      pivot,
      ...this.quickSort(right, compareFn)
    ];
  },

  mergeSort(arr, compareFn = (a, b) => a - b) {
    if (arr.length <= 1) return arr;

    const mid = Math.floor(arr.length / 2);
    const left = this.mergeSort(arr.slice(0, mid), compareFn);
    const right = this.mergeSort(arr.slice(mid), compareFn);

    return this._merge(left, right, compareFn);
  },

  _merge(left, right, compareFn) {
    const result = [];
    let i = 0;
    let j = 0;

    while (i < left.length && j < right.length) {
      if (compareFn(left[i], right[j]) <= 0) {
        result.push(left[i]);
        i++;
      } else {
        result.push(right[j]);
        j++;
      }
    }

    // [STL Sort] Ekuivalen std::sort dengan custom comparator
    return [...result, ...left.slice(i), ...right.slice(j)];
  }
};

module.exports = { Sorter };
