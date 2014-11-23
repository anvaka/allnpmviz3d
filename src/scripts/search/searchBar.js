require('whenscrolled');
require('./searchController');

/**
 * A directive to render search bar. We only handle `focusSearch` event
 * here. Remaining logic resides in the searchController.js
 */
module.exports = require('an').directive('searchBar', searchBar);

var fs = require('fs');
var appEvents = require('../events');

function searchBar() {
  return {
    scope: { allPackagesGraph: '=' },
    restrict: 'E',
    replace: true,
    template: fs.readFileSync(__dirname + '/searchBar.html', 'utf8'),
    link: function(scope, element) {
      appEvents.on('focusSearch', focusSearch);

      function focusSearch() {
        var inputBox = element.find('input')[0];
        inputBox.focus();
      }
    }
  };
}
