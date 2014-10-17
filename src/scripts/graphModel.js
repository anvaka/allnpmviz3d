var eventify = require('ngraph.events');
var createGraph = require('ngraph.graph');

module.exports = function($http) {
  var graph = createGraph();

  $http.get('/data/positions.bin', {
    responseType: "arraybuffer"
  })
    .then(convertToPositions)
    .then(addNodesToGraph);

  $http.get('./data/labels.json')
    .then(addLabelsToGraph);

  var model = {
    getGraph: function getGraph() {
      return graph;
    }
  };

  eventify(model);

  return model;

  function addLabelsToGraph(response) {
    var labels = response.data;
    labels.forEach(function (label, idx) {
      graph.addNode(idx, {
        label: label
      });
    });
  }

  function addNodesToGraph(positions) {
    positions.forEach(function(pos, idx) {
      graph.addNode(idx, {
        position: pos
      });
    });

    model.fire('nodesReady', model);
  }

  function convertToPositions(response) {
    var data = new Int32Array(response.data);
    var positions = [];

    for (var i = 0; i < data.length; i += 3) {
      var pos = {
        x: data[i],
        y: data[i + 1],
        z: data[i + 2]
      };
      positions.push(pos);
    }

    return positions;
  }
};
