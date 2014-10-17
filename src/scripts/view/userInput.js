/**
 * Handles mouse/keyboard input and transforms camera position accordingly
 */
var FlyControls = require('three.fly');

module.exports = createUserInputController;

function createUserInputController(camera) {
  var clock = new THREE.Clock();

  controls = new FlyControls(camera);
  controls.movementSpeed = 800;
  controls.rollSpeed = 1;
  controls.autoForward = false;
  controls.dragToLook = true;

  return {
    update: update
  };

  function update() {
    controls.update(clock.getDelta());
  }
}
