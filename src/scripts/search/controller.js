module.exports = require('an').controller('searchController', searchController);

function searchController($scope) {
  $scope.looseFocus = function (e) {
    $scope.$emit('focusScene');
  };
  $scope.highlightMatches = function (searchPattern) {
    $scope.$emit('search', searchPattern);
  };
}
