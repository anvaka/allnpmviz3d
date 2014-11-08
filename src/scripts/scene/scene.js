var eventify = require('ngraph.events');
var createAutoPilot = require('./autoPilot');
var createHitTest = require('./hitTest');
var createUserInputController = require('./userInput');
var createNodeView = require('./nodeView');
var createLinkView = require('./linkView');
var init3dView = require('./initThree');

module.exports = sceneView;

function sceneView(graphModel) {
  var view = init3dView();
  var nodeView = createNodeView(view.getScene());
  var linkView = createLinkView(view.getScene());
  var shouldShowLinks = linkView.linksVisible();
  var autoPilot = createAutoPilot(view.getCamera());

  var api = eventify({
    search: search,
    subgraph: subgraph,
    focus: focus,
    focusOnPackage: focusOnPackage
  });

  var hitTest = createHitTest(view.domElement);
  hitTest.on('nodeover', handleNodeHover);
  hitTest.on('nodeclick', handleNodeClick);
  hitTest.on('nodedblclick', handleNodeDblClick);

  var userInputController = createUserInputController(view.getCamera(), view.domElement);
  userInputController.on('steeringModeChanged', toggleSteeringIndicator);
  userInputController.on('toggleLinks', function() {
    shouldShowLinks = linkView.toggleLinks();
  });

  view.onrender(hitTest.update);
  view.onrender(userInputController.update);

  graphModel.on('nodesReady', nodeView.render);
  graphModel.on('linksReady', function(graphModel) {
    linkView.render(graphModel);
    adjustNodeSize(graphModel);
  });

  return api;

  function focusOnPackage(packageName) {
    var pos = graphModel.getPackagePosition(packageName);
    if (!pos) return; // we are missing data
    hitTest.postpone();
    autoPilot.flyTo(pos, function done() {
      showPreview(packageName);
    });
  }

  function adjustNodeSize(model) {
    var graph = model.getGraph();
    graph.forEachNode(function(node) {
      var outCount = 0;
      node.links.forEach(function(link) {
        if (link.toId === node.id) outCount += 1;
      });
      var size = (100 / 7402) * outCount + 15;
      nodeView.setNodeUI(node.id, 0xffffff, size);
    });
    nodeView.refresh();
  }

  function search(pattern) {
    graphModel.filter(pattern);
    nodeView.render(graphModel);
    // we always hide links when graph is filtered. Restore links rendering
    // settings only when graph is not filtered
    if (pattern && shouldShowLinks) {
      linkView.linksVisible(false);
    } else if (!pattern) {
      linkView.linksVisible(shouldShowLinks);
    }
    adjustNodeSize(graphModel);
    hitTest.reset();
  }

  function subgraph(name) {
    nodeView.render(graphModel);
    nodeView.refresh();

    linkView.render(graphModel);
    var sphere = nodeView.getBoundingSphere();
    var camera = view.getCamera();

    var offset = Math.max(sphere.radius, 100) / Math.tan(Math.PI / 180.0 * camera.fov * 0.5);
    autoPilot.flyTo(sphere.center, offset);
    hitTest.reset();
  }

  function focus() {
    if (view.domElement) {
      // always focus on next event cycle, to prevent race conditions
      setTimeout(function() {
        view.domElement.focus();
      }, 0);
    }
  }

  function toggleSteeringIndicator(isOn) {
    var steering = document.querySelector('.steering');
    steering.style.display = isOn ? 'none' : 'block';
  }


  function handleNodeHover(e) {
    api.fire('show-node-tooltip', {
      name: getPackageNameFromIndex(e.nodeIndex),
      mouse: e
    });
  }

  function handleNodeClick(e) {
    showPreview(getPackageNameFromIndex(e.nodeIndex));
  }

  function showPreview(name) {
    api.fire('preview', name);
  }

  function handleNodeDblClick(e) {
    focusOnPackage(getPackageNameFromIndex(e.nodeIndex));
  }

  function getPackageNameFromIndex(idx) {
    if (idx !== undefined) {
      var node = graphModel.getGraph().getNode(idx);
      return node && node.data.label;
    }
  }
}

