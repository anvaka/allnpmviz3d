/**
 * Builds subgraph from a larger graph. Subgraph always starts from a given node
 * and includes:
 *   - node's direct dependencies, when `type` === "dependencies" or
 *   - node's direct dependents, when `type` === "dependencies"
 *
 * If type includes "all" prefix (e.g. "alldependents") then the subgraph
 * will include all indirect nodes too.
 */
var createGraph = require('ngraph.graph');

module.exports = function subgraph(sourceGraph, startNodeId, type) {
  var graph = createGraph();
  var id = 0;
  var startNode = sourceGraph.getNode(startNodeId);
  var nodesToProcess = [];
  var addedNodes = [];
  var needAll = type && (type[0] === 'a') && (type[1] === 'l') && (type[2] === 'l');
  if (needAll) {
    type = type.substr(3); // remove `all` prefix
  }

  // root node should always be added:
  addedNodes[startNodeId] = id;
  graph.addNode(id++, startNode.data);

  nodesToProcess.push(startNodeId);
  // starting from a root visit all neighbours and construct subgraph:
  while (nodesToProcess.length) {
    addSubgraph(nodesToProcess.pop());
  }

  return graph;

  function addSubgraph(originalNodeId) {
    var newNodeId = addedNodes[originalNodeId];
    // todo this contains a lot of duplication. refactor

    sourceGraph.forEachLinkedNode(originalNodeId, function(node, link) {
      var nodeId;
      var otherNodeId;
      if (link.toId === originalNodeId && type === 'dependents') {
        otherNodeId = addedNodes[node.id];
        if (otherNodeId === undefined) {
          // we haven't seen this node before.
          nodeId = id++;
          graph.addNode(nodeId, node.data);
          graph.addLink(nodeId, newNodeId);
          // make sure we process remaining nodes if required
          if (needAll) {
            addedNodes[node.id] = nodeId;
            nodesToProcess.push(node.id);
          }
        } else {
          // we've already added this node to subgraph. Add link only
          graph.addLink(otherNodeId, newNodeId);
        }
      } else if (link.fromId === originalNodeId && type === 'dependencies') {

        otherNodeId = addedNodes[node.id];
        if (otherNodeId === undefined) {
          nodeId = id++;
          graph.addNode(nodeId, node.data);
          graph.addLink(newNodeId, nodeId);
          // make sure we process remaining nodes if required
          if (needAll) {
            addedNodes[node.id] = nodeId;
            nodesToProcess.push(node.id);
          }
        } else {
          graph.addLink(newNodeId, otherNodeId);
        }
      }
    });
  }
};
