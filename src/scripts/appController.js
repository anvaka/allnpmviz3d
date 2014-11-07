require('./search/searchBar');

// dirty hack to get THREE.js into global namespace
var THREE = window.THREE = require('three').THREE;

var appEvents = require('./events');
var getDependenciesInfo = require('./model/getDepsInfo');

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
  appEvents.on('subgraphRequested', showSubgraph);

  $scope.showSubgraph = showSubgraph;

  $scope.tooltip = {
    isVisible: false
  };

  function showSubgraph(packageName, type) {
    var filteredGraph = graphModel.filterSubgraph(packageName, type);
    scene.subgraph(packageName); // todo: rename this to something else.

    appEvents.fire('showDependencyGraph', {
      name: packageName,
      type: type,
      graph: filteredGraph
    });

    if (filteredGraph) {
      showPreview(packageName);
    }
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

  function showPreview(packageName) {
    // todo: This violates SRP. Should this be in a separate module?
    if (packageName === undefined) return; // no need to toggle full preview

    var node = graphModel.getNodeByName(packageName);

    if (!node) return; // no such package found

    var depsInfo = getDependenciesInfo(node.id, node.links);
    $scope.package = {
      name: packageName,
      dependencies: depsInfo.dependencies,
      dependents: depsInfo.dependents
    };

    if (!$scope.$$phase) $scope.$digest();
  }
}
