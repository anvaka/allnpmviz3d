/**
 * This is higher level abstraction on top of THREE.js scene
 * which commands how to render nodes, links, performs autopiloting
 * and handles ray tracing for user input
 */
var eventify = require('ngraph.events');
var createAutoPilot = require('./autoPilot');
var createHitTest = require('./hitTest');
var createUserInputController = require('./userInput');
var createNodeView = require('./nodeView');
var createLinkView = require('./linkView');
var init3dView = require('./initThree');

var webglEnabled = require('webgl-enabled')();
module.exports = sceneView;

function sceneView(graphModel) {
  if (!webglEnabled) return;

  var view = init3dView();
  var nodeView = createNodeView(view.getScene());
  var linkView = createLinkView(view.getScene());
  var shouldShowLinks = linkView.linksVisible();
  var autoPilot = createAutoPilot(view.getCamera());
  var jiggler;

  var api = eventify({
    search: search,
    subgraph: subgraph,
    focus: focus,
    focusOnPackage: focusOnPackage,
    jiggle: jiggle
  });

  var hitTest = createHitTest(view.domElement);
  hitTest.on('nodeover', handleNodeHover);
  hitTest.on('nodeclick', handleNodeClick);
  hitTest.on('nodedblclick', handleNodeDblClick);

  var userInput = createUserInputController(view.getCamera(), view.domElement);
  userInput.on('steeringModeChanged', toggleSteeringIndicator);
  userInput.on('toggleLinks', function() {
    shouldShowLinks = linkView.toggleLinks();
  });

  view.onrender(render);

  graphModel.on('nodesReady', nodeView.render);
  graphModel.on('linksReady', function(graphModel) {
    linkView.render(graphModel);
    adjustNodeSize(graphModel);
  });

  return api;

  function render(scene, camera) {
    hitTest.update(scene, camera);
    userInput.update(scene, camera);
    // todo: this is ugly and should not belong here
    if (jiggler) {
      var vx = 4, vy = 4, vz = 4;
      var points = jiggler.points;
      var destinations = jiggler.destinations;
      for (var i = 0; i < destinations.length; ++i) {
        var idx = i * 3;
        var d = destinations[i];
        if (points[idx] + vx < d.x) { points[idx] += vx; }
        if (points[idx] + vx > d.x) { points[idx] -= vx; }

        if (points[idx + 1] + vy < d.y) { points[idx + 1] += vy; }
        if (points[idx + 1] + vy > d.y) { points[idx + 1] -= vy; }

        if (points[idx + 2] + vz < d.z) { points[idx + 2] += vz; }
        if (points[idx + 2] + vz > d.z) { points[idx + 2] -= vz; }
      }

      jiggler.position.needsUpdate = true;
    }
  }
  function jiggle() {
    if (linkView.linksVisible()) {
      linkView.linksVisible(false);
    }
    jiggler = nodeView.jiggle();
    focusOnSphere(jiggler.sphere);
  }

  function focusOnPackage(packageName) {
    var pos;
    if (jiggler) {
      var node = graphModel.getNodeByName(packageName);
      if (node) {
        pos = {
          x: jiggler.points[node.id * 3],
          y: jiggler.points[node.id * 3 + 1],
          z: jiggler.points[node.id * 3 + 2]
        };
      }
    } else {
      pos = graphModel.getPackagePosition(packageName);
    }
    if (!pos) return; // we are missing data
    hitTest.postpone();
    userInput.pause();

    autoPilot.flyTo(pos, function done() {
      showPreview(packageName);
      userInput.resume();
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
    jiggler = null;
  }

  function subgraph(name) {
    nodeView.render(graphModel);
    nodeView.refresh();

    linkView.render(graphModel);
    var sphere = nodeView.getBoundingSphere();
    focusOnSphere(sphere);

    hitTest.reset();
  }

  function focusOnSphere(sphere) {
    var camera = view.getCamera();

    var offset = Math.max(sphere.radius, 100) / Math.tan(Math.PI / 180.0 * camera.fov * 0.5);

    userInput.pause();
    autoPilot.flyTo(sphere.center, function () {
      userInput.resume();
    }, offset);
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

