/**
 * Handles mouse/keyboard input and transforms camera position accordingly
 */
var fly = require('three.fly');
var eventify = require('ngraph.events');
var appEvents = require('../events');

module.exports = createUserInputController;

function createUserInputController(camera, domElement) {
  var clock = new THREE.Clock();

  var wasdControls = fly(camera, domElement, THREE);
  var paused = false;

  domElement.tabIndex = 0;
  domElement.focus();
  wasdControls.movementSpeed = 800;
  wasdControls.rollSpeed = 1;
  wasdControls.autoForward = false;
  wasdControls.dragToLook = true;

  // we want to listen on document level, since focus can be anywhere
  window.document.addEventListener('keydown', keydown, false);

  // TODO: IE?
  domElement.addEventListener('touchstart', onTouchStart, false);
  domElement.addEventListener('touchend', onTouchEnd, false);

  var touchControls;
  var api = {
    update: update,
    pause: pause,
    resume: resume
  };

  eventify(api);

  if (window.orientation !== undefined) {
    touchControls = require('three.orientation')(camera);
    api.update = updateTochToo;
  }

  return api;

  function update() {
    wasdControls.update(clock.getDelta());
  }

  function updateTochToo() {
    wasdControls.update(clock.getDelta());
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
      api.fire('toggleLinks');
    } else if (e.which === 191) { // `/` key
      // need to do this in next iteration to prevent search field from entering
      // actual character
      setTimeout(function() {
        appEvents.fire('focusSearch');
      }, 0);
    } else if (e.which === 186) { // colon
        appEvents.fire('focusSearch');
    }
  }

  function onTouchStart(e) {
    if (paused) return;
    if (!e.touches) return;

    if (e.touches.length > 0) {
      wasdControls.moveState.forward = (e.touches.length === 1);
      wasdControls.moveState.back = (e.touches.length === 2);
      wasdControls.updateMovementVector();
    }
  }

  function onTouchEnd(e) {
    if (paused) return;

    if (!e.touches) return;
    wasdControls.moveState.forward = (e.touches.length === 1);
    wasdControls.moveState.back = (e.touches.length === 2);
    wasdControls.updateMovementVector();
  }

  function shouldSkipKeyboardEvent(e) {
    var target = e.target || e.srcElement;
    var name = target && target.tagName;
    return name && name.match(/input/i); // We should ignore input boxes
  }

  function changeSteeringMode() {
    wasdControls.dragToLook = !wasdControls.dragToLook;

    wasdControls.moveState.yawLeft = 0;
    wasdControls.moveState.pitchDown = 0;
    wasdControls.updateRotationVector();
    api.fire('steeringModeChanged', wasdControls.dragToLook);
  }

  function pause() {
    paused = true;
    disconnectTouch();
  }

  function resume() {
    paused = false;
    connectTouch();
  }

  function disconnectTouch() {
    if (touchControls) {
      touchControls.disconnect();
    }
  }

  function connectTouch() {
    if (touchControls) {
      touchControls.connect();
    }
  }
}
