var createHitTest = require('./hitTest');
var createUserInputController = require('./userInput');
var renderNodes = require('./renderNodes');
var renderLinks = require('./renderLinks');

module.exports = graphView;

function graphView(graphModel) {
  var view = init3dView();
  var graph = graphModel.getGraph();

  var hitTest = createHitTest();
  hitTest.onSelected(function(idx) {
    var node = graph.getNode(idx);
    if (node) {
      console.log(node.data.label);
    }
  });

  var userInputController = createUserInputController(view.getCamera());

  view.onrender(hitTest.update);
  view.onrender(userInputController.update);

  graphModel.on('nodesReady', renderNodes(view.getScene()));
  graphModel.on('linksReady', renderLinks(view.getScene()));
}

function init3dView() {
  var scene = new THREE.Scene();
  scene.sortObjects = false;

  var camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 20000);
  camera.position.x = 0;
  camera.position.y = 0;
  camera.position.z = 0;
  camera.lookAt(new THREE.Vector3(9000, 9000, 9000));
  window.camera = camera;

  var renderCallbacks = [];

  var renderer = new THREE.WebGLRenderer({
    antialias: false
  });
  renderer.setClearColor(0x000000, 1);
  renderer.setSize(window.innerWidth, window.innerHeight);
  document.body.appendChild(renderer.domElement);

  animate();

  return {
    onrender: onrender,
    getScene: getScene,
    getCamera: getCamera
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

  function animate() {
    requestAnimationFrame(animate);

    renderer.render(scene, camera);
    for (var i = 0; i < renderCallbacks.length; ++i) {
      renderCallbacks[i](scene, camera);
    }
  }
}
