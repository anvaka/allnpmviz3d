/**
 * Simple directive which allows to execute callbacke when
 * user scrolls over element
 */
module.exports = require('an').directive(whenScrolled);

function whenScrolled() {
  return function(scope, elm, attr) {
    var raw = elm[0];
    elm.bind('scroll', function() {
      if (raw.scrollTop + raw.offsetHeight >= raw.scrollHeight) {
        scope.$apply(attr.whenScrolled);
      }
    });
  };
}
