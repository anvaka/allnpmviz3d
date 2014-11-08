/**
 * Gives an index of a node under mouse coordinates
 */
var eventify = require('ngraph.events');

module.exports = createHitTest;

function createHitTest(domElement) {
  var particleSystem;
  var lastIntersected;
  var postponed = true;

  var projector = new THREE.Projector();
  var raycaster = new THREE.Raycaster();

  // This defines sensitivity of raycaster.
  // TODO: Should it depend on node size?
  raycaster.params.PointCloud.threshold = 10;
  domElement = domElement || document.body;

  // we will store mouse coordinates here to process on next RAF event (`update()` method)
  var mouse = {
    x: 0,
    y: 0
  };

  // store DOM coordinates as well, to let clients know where mouse is
  var domMouse = {
    down: false,
    x: 0,
    y: 0,
    nodeIndex: undefined
  };
  var singleClickHandler;

  domElement.addEventListener('mousemove', onMouseMove, false);
  domElement.addEventListener('mousedown', onMouseDown, false);
  domElement.addEventListener('mouseup', onMouseUp, false);
  domElement.addEventListener('touchstart', onTouchStart, false);
  domElement.addEventListener('touchend', onTouchEnd, false);

  var api = {
    /**
     * This should be called from RAF. Initiates process of hit test detection
     */
    update: update,

    /**
     * Reset all caches. Most likely underlying scene changed
     * too much.
     */
    reset: reset,

    /**
     * Hit tester should not emit events until mouse moved
     */
    postpone: postpone
  };

  // let us publish events
  eventify(api);
  return api;

  function postpone() {
    // postpone processing of hit testing until next mouse movement
    // this gives opportunity to avoid race conditions.
    postponed = true;
  }

  function reset() {
    // this will happen when user filters nodes
    particleSystem = null;
  }

  function onMouseUp(e) {
    domMouse.down = false;
    postponed = true;
  }

  function onMouseDown(e) {
    postponed = false;
    domMouse.down = true;
    domMouse.nodeIndex = lastIntersected;

    if (singleClickHandler) {
      // If we were able to get here without clearing single click handler,
      // then we are dealing with double click.

      // No need to fire single click event anymore:
      window.clearTimeout(singleClickHandler);
      singleClickHandler = null;

      // fire double click instead:
      api.fire('nodedblclick', domMouse);
    } else {
      // Wait some time before firing event. It can be a double click...
      singleClickHandler = window.setTimeout(function() {
        api.fire('nodeclick', domMouse);
        singleClickHandler = undefined;
      }, 300);
    }
  }

  function onTouchStart(e) {
    if (!e.touches && e.touches.length === 1) {
      postponed = true;
      return;
    }

    postponed = false;
    setMouseCoordinates(e.touches[0]);
  }

  function onTouchEnd(e) {
    if (e.touches && e.touches.length === 1) {
      setMouseCoordinates(e.touches[0]);
    }
    setTimeout(function() {
      postponed = false;
      api.fire('nodeclick', domMouse);
    }, 0);
  }

  function onMouseMove(e) {
    setMouseCoordinates(e);
    postponed = false; // mouse moved, we are free.
  }

  function setMouseCoordinates(e) {
    // todo: this should not depend on window
    mouse.x = (e.clientX / window.innerWidth) * 2 - 1;
    mouse.y = -(e.clientY / window.innerHeight) * 2 + 1;

    domMouse.x = e.clientX;
    domMouse.y = e.clientY;
  }

  function update(scene, camera) {
    // We need to stop processin any events until user moves mouse.
    // this is to avoid race conditions between search field and scene
    if (postponed) return;

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
      // there is no node under mouse cursor. Let it know to UI:
      lastIntersected = undefined;
      notifySelected(undefined);
    }
  }

  function notifySelected(index) {
    domMouse.nodeIndex = index;
    api.fire('nodeover', domMouse);
  }
}
