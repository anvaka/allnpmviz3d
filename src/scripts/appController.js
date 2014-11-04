require('./search/searchBar');

// dirty hack to get THREE.js into global namespace
var THREE = window.THREE = require('three').THREE;

var appEvents = require('./events');

require('an').controller(AppController);

function AppController($scope, $http) {
  var graphModel = require('./graphModel')($http);
  var scene = require('./scene/scene')(graphModel);

  scene.on('preview', showPreview);
  scene.on('show-node-tooltip', showNodeTooltip);

  graphModel.on('labelsReady', function() {
    $scope.allPackagesGraph = graphModel.getGraph();
  });

  appEvents.on('search', scene.search);
  appEvents.on('focusScene', scene.focus);
  appEvents.on('focusOnPackage', scene.focusOnPackage);

  $scope.showSubgraph = function(packageName) {
    appEvents.fire('hideSearch');
    scene.subgraph(packageName);
  };

  $scope.tooltip = {
    isVisible: false
  };

  function showPreview(node) {
    $scope.package = node;
    if (!$scope.$$phase) $scope.$digest();
  }

  function showNodeTooltip(tooltipInfo) {
    if (tooltipInfo && tooltipInfo.name) {
      $scope.tooltip.name = tooltipInfo.name;
      $scope.tooltip.x = (tooltipInfo.mouse.x + 5) + 'px';
      $scope.tooltip.y = (tooltipInfo.mouse.y - 15) + 'px';
      $scope.tooltip.isVisible = true;
    } else {
      $scope.tooltip.isVisible = false;
    }

    if (!$scope.$$phase) $scope.$digest();
  }
}
