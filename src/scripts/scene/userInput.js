/**
 * Handles mouse/keyboard input and transforms camera position accordingly
 */
var FlyControls = require('three.fly');
var eventify = require('ngraph.events');

module.exports = createUserInputController;

function createUserInputController(camera, domElement) {
  var clock = new THREE.Clock();

  controls = new FlyControls(camera, domElement);
  domElement.tabIndex = 0;
  domElement.focus();
  controls.movementSpeed = 800;
  controls.rollSpeed = 1;
  controls.autoForward = false;
  controls.dragToLook = true;

  // we want to listen on document level, since focus can be anywhere
  window.document.addEventListener('keydown', keydown, false);

  var controller = {
    update: update
  };

  eventify(controller);

  return controller;

  function update() {
    controls.update(clock.getDelta());
  }

  function keydown(e) {
    var target = e.target || e.srcElement;
    var name = target && target.tagName;
    if (name && name.match(/input/i)) {
      return;// ignore input boxes
    }
    if (e.which === 32) { // spacebar
      changeSteeringMode();
    } else if (e.which === 76) { // l
      controller.fire('toggleLinks');
    } else if (e.which === 191) { // `/` key
      controller.fire('focusSearch');
    }
  }


  function changeSteeringMode() {
    controls.dragToLook = !controls.dragToLook;

    controls.moveState.yawLeft = 0;
    controls.moveState.pitchDown = 0;
    controls.updateRotationVector();
    controller.fire('steeringModeChanged', controls.dragToLook);
  }
}
