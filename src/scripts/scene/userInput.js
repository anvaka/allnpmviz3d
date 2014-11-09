/**
 * Handles mouse/keyboard input and transforms camera position accordingly
 */
var FlyControls = require('three.fly');
var eventify = require('ngraph.events');
var appEvents = require('../events');

module.exports = createUserInputController;

function createUserInputController(camera, domElement) {
  var clock = new THREE.Clock();

  var controls = new FlyControls(camera, domElement);
  domElement.tabIndex = 0;
  domElement.focus();
  controls.movementSpeed = 800;
  controls.rollSpeed = 1;
  controls.autoForward = false;
  controls.dragToLook = true;

  // we want to listen on document level, since focus can be anywhere
  window.document.addEventListener('keydown', keydown, false);

  var touchControls;
  var controller = {
    update: update,
    pause: pause,
    resume: resume
  };

  eventify(controller);

  if (window.orientation !== undefined) {
    touchControls = require('three.orientation')(camera);
    controller.update = updateTochToo;
  }

  return controller;

  function update() {
    controls.update(clock.getDelta());
  }

  function updateTochToo() {
    controls.update(clock.getDelta());
    touchControls.update();
  }

  function keydown(e) {
    if (e.which === 27) { // ESC
      appEvents.fire('focusScene');
    }

    if (shouldSkipKeyboardEvent(e)) return;

    if (e.which === 32) { // spacebar
      changeSteeringMode();
    } else if (e.which === 76) { // l
      controller.fire('toggleLinks');
    } else if (e.which === 191) { // `/` key
      // need to do this in next iteration to prevent search field from entering
      // actual character
      setTimeout(function() {
        appEvents.fire('focusSearch');
      }, 0);
    }
  }

  function shouldSkipKeyboardEvent(e) {
    var target = e.target || e.srcElement;
    var name = target && target.tagName;
    return name && name.match(/input/i); // We should ignore input boxes
  }

  function changeSteeringMode() {
    controls.dragToLook = !controls.dragToLook;

    controls.moveState.yawLeft = 0;
    controls.moveState.pitchDown = 0;
    controls.updateRotationVector();
    controller.fire('steeringModeChanged', controls.dragToLook);
  }

  function pause() {
    if (touchControls) touchControls.disconnect();
  }

  function resume () {
    if (touchControls) touchControls.connect();
  }
}
