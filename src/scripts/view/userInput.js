/**
 * Handles mouse/keyboard input and transforms camera position accordingly
 */
var FlyControls = require('three.fly');
var eventify = require('ngraph.events');

module.exports = createUserInputController;

function createUserInputController(camera) {
  var clock = new THREE.Clock();

  controls = new FlyControls(camera);
  controls.movementSpeed = 800;
  controls.rollSpeed = 1;
  controls.autoForward = false;
  controls.dragToLook = false;

  var domElement = document.body;

  domElement.addEventListener('keydown', keydown, false);
  var controller = {
    update: update
  };
  eventify(controller);

  return controller;

  function update() {
    controls.update(clock.getDelta());
  }

  function keydown(e) {
    if (e.which === 32) { // spacebar
      controls.dragToLook = !controls.dragToLook;

      controls.moveState.yawLeft = 0;
      controls.moveState.pitchDown = 0;
      controls.updateRotationVector();
      controller.fire('steeringModeChanged', controls.dragToLook);
    }
  }
}
