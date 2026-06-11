// [namespace] Pengelompokan fungsi dalam object
const GraphUtils = {
  // [Callback Function] onVisit menerima fungsi callback
  bfs(graph, startId, endId, onVisit) {
    const visited = new Set();
    const queue = [[startId]];
    visited.add(startId);

    while (queue.length > 0) {
      const path = queue.shift();
      const current = path[path.length - 1];

      if (onVisit) onVisit(current);

      if (current === endId) return path;

      const neighbors = graph.getNeighbors(current);
      for (const neighbor of neighbors) {
        if (!visited.has(neighbor.stationId)) {
          visited.add(neighbor.stationId);
          queue.push([...path, neighbor.stationId]);
        }
      }
    }
    return null;
  },

  dfs(graph, startId, endId) {
    const allPaths = [];
    const visited = new Set();

    function dfsHelper(currentId, targetId, path) {
      visited.add(currentId);
      path.push(currentId);

      if (currentId === targetId) {
        allPaths.push([...path]);
      } else {
        const neighbors = graph.getNeighbors(currentId);
        for (const neighbor of neighbors) {
          if (!visited.has(neighbor.stationId)) {
            dfsHelper(neighbor.stationId, targetId, path);
          }
        }
      }

      path.pop();
      visited.delete(currentId);
    }

    dfsHelper(startId, endId, []);
    return allPaths;
  }
};

class Graph {
  constructor() {
    // [Pointer] Adjacency list via referensi objek
    this.adjacencyList = new Map();
    this.stations = new Map();
  }

  addStation(station) {
    this.stations.set(station.id, station);
    if (!this.adjacencyList.has(station.id)) {
      this.adjacencyList.set(station.id, []);
    }
  }

  // Bidirectional route
  addRoute(fromId, toId, distance) {
    if (!this.adjacencyList.has(fromId)) this.adjacencyList.set(fromId, []);
    if (!this.adjacencyList.has(toId)) this.adjacencyList.set(toId, []);

    this.adjacencyList.get(fromId).push({ stationId: toId, distance });
    this.adjacencyList.get(toId).push({ stationId: fromId, distance });
  }

  getNeighbors(stationId) {
    return this.adjacencyList.get(stationId) || [];
  }

  getStation(id) {
    return this.stations.get(id) || null;
  }

  getAllStations() {
    return Array.from(this.stations.values());
  }

  // [namespace] BFS via GraphUtils
  findShortestPath(fromId, toId) {
    const pathIds = GraphUtils.bfs(this, fromId, toId);
    if (!pathIds) return null;
    return {
      path: pathIds.map(id => this.getStation(id)),
      stations: pathIds.length
    };
  }

  // [namespace] DFS via GraphUtils
  findAllPaths(fromId, toId) {
    const pathIds = GraphUtils.dfs(this, fromId, toId);
    return pathIds.map(ids => ({
      path: ids.map(id => this.getStation(id)),
      stations: ids.length
    }));
  }
}

module.exports = { Graph, GraphUtils };
