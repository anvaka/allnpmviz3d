module.exports = require('an').controller('searchController', searchController);

function searchController($scope) {
  $scope.looseFocus = function (e) {
    console.log('ya', e);
  };
  $scope.highlightMatches = function (searchPattern) {
    $scope.$emit('search', searchPattern);
  };
}
