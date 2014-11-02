var TWEEN = require('tween.js');
var eventify = require('ngraph.events');
var createAutoPilot = require('./autoPilot');
var createHitTest = require('./hitTest');
var createUserInputController = require('./userInput');
var createNodeView = require('./nodeView');
var createLinkView = require('./linkView');

module.exports = sceneView;

function sceneView(graphModel) {
  var view = init3dView();
  var nodeView = createNodeView(view.getScene());
  var linkView = createLinkView(view.getScene());
  var shouldShowLinks = linkView.linksVisible();
  var autoPilot = createAutoPilot(view.getCamera());

  var api = eventify({
    search: search,
    focus: focus,
    focusOnPackage: focusOnPackage
  });

  var hitTest = createHitTest();
  hitTest.onSelected(function(idx) {
    var node = graphModel.getGraph().getNode(idx);
    if (node) {
      showPreview(node);
    }
  });

  var userInputController = createUserInputController(view.getCamera(), view.domElement);
  userInputController.on('steeringModeChanged', toggleSteeringIndicator);
  userInputController.on('toggleLinks', function() {
    shouldShowLinks = linkView.toggleLinks();
  });

  view.onrender(hitTest.update);
  view.onrender(userInputController.update);

  graphModel.on('nodesReady', nodeView.initialize);
  graphModel.on('linksReady', function(graphModel) {
    linkView.initialize(graphModel);
    adjustNodeSize(graphModel);
  });

  return api;

  function focusOnPackage(packageName) {
    var pos = graphModel.getPackagePosition(packageName);
    if (!pos) return; // we are missing data
    autoPilot.flyTo(pos);
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
    nodeView.initialize(graphModel);
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

  function focus() {
    if (view.domElement) {
      setTimeout(function() {
        view.domElement.focus();
      }, 0);
    }
  }

  function toggleSteeringIndicator(isOn) {
    var steering = document.querySelector('.steering');
    steering.style.display = isOn ? 'none' : 'block';
  }

  function showPreview(node) {
    var dependencies = 0;
    var dependents = 0;
    node.links.forEach(calculateDependents);
    api.fire('preview', {
      name: node.data.label,
      dependencies: dependencies,
      dependents: dependents
    });

    function calculateDependents(link) {
      if (link.fromId === node.id) {
        dependencies += 1;
      } else {
        dependents += 1;
      }
    }
  }
}

function init3dView() {
  var scene = new THREE.Scene();
  scene.sortObjects = false;

  var camera = new THREE.PerspectiveCamera(45, window.innerWidth / window.innerHeight, 0.1, 20000);
  camera.position.x = 0;
  camera.position.y = 0;
  camera.position.z = 0;
  camera.lookAt(new THREE.Vector3(-9000, -9000, 9000));
  window.camera = camera;

  var renderCallbacks = [];

  var renderer = new THREE.WebGLRenderer({
    antialias: false
  });
  renderer.setClearColor(0x000000, 1);
  renderer.setSize(window.innerWidth, window.innerHeight);
  document.body.appendChild(renderer.domElement);
  window.addEventListener('resize', onWindowResize, false);

  animate();

  return {
    onrender: onrender,
    getScene: getScene,
    getCamera: getCamera,
    domElement: renderer.domElement
  };

  function onrender(callback) {
    renderCallbacks.push(callback);
  }

  function getScene() {
    return scene;
  }

  function getCamera() {
    return camera;
  }

  function animate(time) {
    requestAnimationFrame(animate);

    renderer.render(scene, camera);
    for (var i = 0; i < renderCallbacks.length; ++i) {
      renderCallbacks[i](scene, camera);
    }
    TWEEN.update(time);
  }

  function onWindowResize() {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
  }
}
