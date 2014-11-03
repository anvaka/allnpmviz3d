var createGraph = require('ngraph.graph');

module.exports = function subgraph(sourceGraph, startNodeId) {
  var graph = createGraph();
  var id = 0;
  var startNode = sourceGraph.getNode(startNodeId);
  graph.addNode(id++, startNode.data);

  sourceGraph.forEachLinkedNode(startNodeId, function (node, link) {
    if (link.toId === startNodeId) {
      var nodeId = id++;
      graph.addNode(nodeId, node.data);
      graph.addLink(nodeId, 0);
    }
  });

  return graph;
};
