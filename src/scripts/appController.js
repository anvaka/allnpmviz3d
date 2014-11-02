require('./search/searchBar');

// dirty hack to get THREE.js into global namespace
var THREE = window.THREE = require('three').THREE;

var appEvents = require('./events');

require('an').controller(AppController);

function AppController($scope, $http) {
  var graphModel = require('./graphModel')($http);
  var scene = require('./scene/scene')(graphModel);
  scene.on('preview', showPreview);

  graphModel.on('labelsReady', function() {
    $scope.allPackagesGraph = graphModel.getGraph();
  });

  appEvents.on('search', scene.search);
  $scope.$on('focusScene', scene.focus);
  $scope.$on('focusOnPackage', function(_, name) {
    scene.focusOnPackage(name);
  });

  function showPreview(node) {
    $scope.package = node;
    $scope.$digest();
  }
}
