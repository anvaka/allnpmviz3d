module.exports = require('an').controller('searchController', searchController);

function searchController($scope) {
  $scope.highlightMatches = function (searchPattern) {
    $scope.$emit('search', searchPattern);
  };
}
