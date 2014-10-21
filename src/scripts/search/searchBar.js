require('./controller');

module.exports = require('an').directive('searchBar', searchBar);

var fs = require('fs');
function searchBar() {
  return {
    scope: {
      onPackageSelected: '='
    },
    restrict: 'E',
    template : fs.readFileSync(__dirname + '/searchBar.html', 'utf8')
  };
}
