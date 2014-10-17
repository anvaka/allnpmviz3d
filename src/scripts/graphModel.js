var eventify = require('ngraph.events');
var createGraph = require('ngraph.graph');

module.exports = function($http, $q) {
  var graph = createGraph();

  $http.get('/data/positions.bin', {
    responseType: "arraybuffer"
  })
    .then(convertToPositions)
    .then(addNodesToGraph)
    .then(downloadLinks);

  $http.get('./data/labels.json')
    .then(addLabelsToGraph);

  var model = {
    getGraph: function getGraph() {
      return graph;
    }
  };

  eventify(model);

  return model;

  function downloadLinks() {
    $http.get('/data/links.bin', {
      responseType: "arraybuffer"
    })
      .then(addLinksToGraph);
  }

  function addLabelsToGraph(response) {
    var labels = response.data;
    labels.forEach(function(label, idx) {
      addToGraph(idx, 'label', label);
    });
  }

  function addNodesToGraph(positions) {
    positions.forEach(function(pos, idx) {
      addToGraph(idx, 'position', pos);
    });

    model.fire('nodesReady', model);
  }

  function addLinksToGraph(res) {
    var arr = new Int32Array(res.data);
    for (var i = 0; i < arr.length; i++) {
      var id = arr[i];
      if (id < 0) {
        id *= -1;
        id -= 1;
        lastFromId = id;
      } else {
        graph.addLink(lastFromId, id);
      }
    }

    model.fire('linksReady', model);
    return graph;
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

  function addToGraph(nodeId, dataName, dataValue) {
    var node = graph.getNode(nodeId);
    if (!node) {
      var data = {};
      data[dataName] = dataValue;
      graph.addNode(nodeId, data);
    } else {
      node.data[dataName] = dataValue;
    }
  }
};
