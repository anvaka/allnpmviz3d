/**
 * Binds content of html to dynamically compiled content
 */
module.exports = require('an').directive('dynamic', dynamic);

function dynamic($compile) {
  return {
    restrict: 'A',
    replace: true,
    link: function (scope, ele, attrs) {
      scope.$watch(attrs.dynamic, function(html) {
        ele.html(html);
        $compile(ele.contents())(scope);
      });
    }
  };
}
