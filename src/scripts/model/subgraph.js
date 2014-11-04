var createGraph = require('ngraph.graph');

module.exports = function subgraph(sourceGraph, startNodeId, type) {
  var graph = createGraph();
  var id = 0;
  var startNode = sourceGraph.getNode(startNodeId);
  graph.addNode(id++, startNode.data);

  sourceGraph.forEachLinkedNode(startNodeId, function (node, link) {
    var nodeId;
    if (link.toId === startNodeId && type === 'dependents') {
      nodeId = id++;
      graph.addNode(nodeId, node.data);
      graph.addLink(nodeId, 0);
    } else if (link.fromId === startNodeId && type === 'dependencies'){
      nodeId = id++;
      graph.addNode(nodeId, node.data);
      graph.addLink(0, nodeId);
    }
  });

  return graph;
};
