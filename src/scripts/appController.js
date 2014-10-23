require('./search/searchBar');

// dirty hack to get THREE.js into global namespace
var THREE = window.THREE = require('three').THREE;

require('an').controller(AppController);

function AppController($scope, $http) {
  var graphModel = require('./graphModel')($http);
  var scene = require('./scene/scene')(graphModel);
  scene.on('preview', showPreview);

  $scope.$on('search', search);

  function showPreview(node) {
    $scope.package = node;
    $scope.$digest();
  }

  function search(_, pattern){
    scene.search(pattern);
  }
}

