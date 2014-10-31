require('./searchController');
require('./whenScrolled');

module.exports = require('an').directive('searchBar', searchBar);

var fs = require('fs');
function searchBar() {
  return {
    scope: {
      allPackagesGraph: '='
    },
    restrict: 'E',
    template : fs.readFileSync(__dirname + '/searchBar.html', 'utf8')
  };
}
