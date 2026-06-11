const { Graph, GraphUtils } = require('../data-structures/Graph');

let passed = 0;
let failed = 0;

function assert(condition, msg) {
  if (condition) { passed++; console.log(`  PASS: ${msg}`); }
  else { failed++; console.error(`  FAIL: ${msg}`); }
}

console.log('=== Graph Tests ===');

const graph = new Graph();

graph.addStation({ id: 'ST001', name: 'Jakarta' });
graph.addStation({ id: 'ST002', name: 'Bandung' });
graph.addStation({ id: 'ST003', name: 'Cirebon' });
graph.addStation({ id: 'ST004', name: 'Semarang' });

// Bidirectional routes
graph.addRoute('ST001', 'ST002', 150);
graph.addRoute('ST002', 'ST003', 120);
graph.addRoute('ST003', 'ST004', 200);
graph.addRoute('ST001', 'ST003', 250); // direct route

// BFS shortest path (fewest transit)
const shortest = graph.findShortestPath('ST001', 'ST004');
assert(shortest !== null, 'BFS finds a path');
assert(shortest.path.length >= 2, 'path has at least 2 stations');
console.log('  Shortest path:', shortest.path.map(s => s.name).join(' → '));

// DFS all alternatives
const allPaths = graph.findAllPaths('ST001', 'ST004');
assert(allPaths.length >= 1, 'DFS finds at least 1 path');
console.log(`  DFS found ${allPaths.length} alternative paths`);

// No path case
const noPath = graph.findShortestPath('ST001', 'ST999');
assert(noPath === null, 'returns null for unreachable station');

console.log(`\nResults: ${passed} passed, ${failed} failed`);
process.exit(failed > 0 ? 1 : 0);
