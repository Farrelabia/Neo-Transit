const { Stack } = require('../data-structures/Stack');

let passed = 0;
let failed = 0;

function assert(condition, msg) {
  if (condition) { passed++; console.log(`  PASS: ${msg}`); }
  else { failed++; console.error(`  FAIL: ${msg}`); }
}

console.log('=== Stack Tests ===');

const stack = new Stack();
assert(stack.isEmpty(), 'stack starts empty');
assert(stack.size === 0, 'stack size is 0');

stack.push({ step: 1, action: 'select-train' });
stack.push({ step: 2, action: 'passenger-info' });
stack.push({ step: 3, action: 'confirm' });

assert(!stack.isEmpty(), 'stack not empty after pushes');
assert(stack.size === 3, 'stack size is 3');
assert(stack.peek().action === 'confirm', 'peek returns top element');

const popped = stack.pop();
assert(popped.action === 'confirm', 'pop returns top element');
assert(stack.size === 2, 'size decremented after pop');
assert(stack.peek().action === 'passenger-info', 'peek returns new top');

stack.clear();
assert(stack.isEmpty(), 'stack empty after clear');
assert(stack.size === 0, 'size is 0 after clear');

const toArray = new Stack();
toArray.push('a');
toArray.push('b');
toArray.push('c');
assert(JSON.stringify(toArray.toArray()) === JSON.stringify(['c','b','a']), 'toArray returns correct order');

console.log(`\nResults: ${passed} passed, ${failed} failed`);
process.exit(failed > 0 ? 1 : 0);
