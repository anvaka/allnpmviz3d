/**
 * Gives an index of a node under mouse coordinates
 */
module.exports = createHitTest;

function createHitTest() {
  var mouse = {
    x: 0,
    y: 0
  };
  var selectedCallbacks = [];
  var particleSystem;
  var lastIntersected;

  var projector = new THREE.Projector();
  var raycaster = new THREE.Raycaster();
  raycaster.params.PointCloud.threshold = 10;

  document.addEventListener('mousemove', onDocumentMouseMove, false);

  return {
    update: update,
    reset: reset,
    onSelected: onSelected
  };

  function reset() {
    // this will happen when user filters nodes
    particleSystem = null;
  }

  function onSelected(callback) {
    selectedCallbacks.push(callback);
  }

  function onDocumentMouseMove(e) {
    mouse.x = (e.clientX / window.innerWidth) * 2 - 1;
    mouse.y = -(e.clientY / window.innerHeight) * 2 + 1;
  }

  function update(scene, camera) {
    if (!particleSystem) {
      scene.children.forEach(function(child) {
        if (child.name === 'nodes') {
          particleSystem = child;
        }
      });
      if (!particleSystem) return;
    }

    var vector = new THREE.Vector3(mouse.x, mouse.y, 0.1);
    projector.unprojectVector(vector, camera);
    raycaster.ray.set(camera.position, vector.sub(camera.position).normalize());
    var intersects = raycaster.intersectObject(particleSystem);
    if (intersects.length > 0) {
      if (lastIntersected !== intersects[0].index) {
        lastIntersected = intersects[0].index;
        notifySelected(lastIntersected);
      }
    } else if (typeof lastIntersected === 'number') {
      lastIntersected = undefined;
      notifySelected(undefined);
    }
  }

  function notifySelected(index) {
    for (var i = 0; i < selectedCallbacks.length; ++i) {
      selectedCallbacks[i](index);
    }
  }
}
