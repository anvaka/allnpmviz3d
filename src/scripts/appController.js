require('./search/searchBar');
require('./help/message');

require('./scene/patchThree');

var appEvents = require('./events');
var getDependenciesInfo = require('./model/getDepsInfo');

require('an').controller(AppController);

function AppController($scope, $http) {
  var graphModel = require('./graphModel')($http);
  $scope.graphModel = graphModel;

  var scene = require('./scene/scene')(graphModel);
  if (scene) {
    // scene may be null, if webgl is not supported. This is very bad,
    // most of the site will not function properly.
    scene.on('preview', showPreview);
    scene.on('show-node-tooltip', showNodeTooltip);
    // TODO: these event seem to belong to scene itself:
    // Someone requested to search a package. Forward it to scene:
    appEvents.on('search', scene.search);
    appEvents.on('focusScene', scene.focus);
    appEvents.on('focusOnPackage', scene.focusOnPackage);
    appEvents.on('jiggle', scene.jiggle);
  }


  // when labels are ready search control can start using them:
  graphModel.on('labelsReady', setGraphOnScope);
  appEvents.on('subgraphRequested', showSubgraph);

  $scope.showSubgraph = showSubgraph;

  $scope.tooltip = {
    isVisible: false
  };

  function setGraphOnScope() {
    $scope.allPackagesGraph = graphModel.getGraph();
  }

  function showSubgraph(packageName, type) {
    var filteredGraph = graphModel.filterSubgraph(packageName, type);
    if (scene) scene.subgraph(packageName); // todo: rename this to something else.

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

    digest();
  }

  function digest() {
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
    $scope.showPackagePreview = true;

    digest();
  }
}
