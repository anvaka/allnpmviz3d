/**
 * Responsible for low level THREE.js scene setup. We also have higher level API
 * to work with graph: `scene.js`
 */
module.exports = init3dView;

var TWEEN = require('tween.js');

function init3dView() {
  var scene = new THREE.Scene();
  scene.sortObjects = false;

  var camera = new THREE.PerspectiveCamera(45, window.innerWidth / window.innerHeight, 0.1, 20000);

  camera.position.x = -5466;
  camera.position.y = 216;
  camera.position.z = 5388;
  camera.lookAt(new THREE.Vector3(0.5860185623168945, 0.5938381172414715, 0.5513062081376774));
  window.camera = camera;

  var renderCallbacks = [];

  // high resolution timers are not supported in some browsers, which may lead
  // to broken animation. Fall back to regular date timer in that case:
  var updateTween = window.performance ? highResTimer : dateTimer;

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
    updateTween(time);
  }

  function onWindowResize() {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
  }

  function highResTimer(time) {
    TWEEN.update(time);
  }

  function dateTimer(time) {
    TWEEN.update(+new Date());
  }
}
