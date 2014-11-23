var subgraph = require('../src/scripts/model/subgraph.js');
var createGraph = require('ngraph.graph');
var test = require('tap').test;

test('it gets subgraph', function(t) {
  var graph = createGraph();
  graph.addLink(0, 1);
  graph.addLink(0, 2);
  graph.addLink(2, 1);
  graph.addLink(2, 4);
  graph.addLink(4, 2);

  t.test('it gets direct outs', function(t) {
    var directDeps = subgraph.out(graph, 0);
    t.equal(directDeps.getLinksCount(), 2, '0 -> 1, 0 -> 2');
    t.equal(directDeps.getNodesCount(), 3, '0, 1, 2');
    t.end();
  });

  t.test('it gets all outs', function(t) {
    var directDeps = subgraph.outAll(graph, 0);
    t.equal(directDeps.getLinksCount(), 5, '0 -> 1, 0 -> 2, 2 -> 1, 2 -> 4, 4 -> 2');
    t.equal(directDeps.getNodesCount(), 4, '0, 1, 2, 4');
    t.end();
  });

  t.test('it gets direct ins', function(t) {
    // 0 -> 1 <- 2
    var directDeps = subgraph.in(graph, 1);
    t.equal(directDeps.getLinksCount(), 2, '0 -> 1 <- 2');
    t.equal(directDeps.getNodesCount(), 3, '0, 1, 2');
    t.end();
  });

  t.test('it gets all ins', function(t) {
    var directDeps = subgraph.inAll(graph, 1);
    t.equal(directDeps.getLinksCount(), 5, '0 -> 1; 2 -> 1, 4 -> 2, 0 -> 2; 2 -> 4');

    t.equal(directDeps.getNodesCount(), 4, '0, 1, 2, 4');
    t.end();
  });

  t.end();
});
