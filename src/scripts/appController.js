require('./search/searchBar');

// dirty hack to get THREE.js into global namespace
var THREE = window.THREE = require('three').THREE;
// todo: Remove this
window._typeface_js = {
  faces: THREE.FontUtils.faces,
  loadFace: THREE.FontUtils.loadFace
};

var appEvents = require('./events');
var getDependenciesInfo = require('./model/getDepsInfo');

require('an').controller(AppController);

function AppController($scope, $http) {
  var graphModel = require('./graphModel')($http);
  var scene = require('./scene/scene')(graphModel);

  scene.on('preview', showPreview);
  scene.on('show-node-tooltip', showNodeTooltip);

  // when labels are ready search control can start using them:
  graphModel.on('labelsReady', setGraphOnScope);
  graphModel.on('loadingConnections', setStatus('Loading connections...'));
  graphModel.on('loadingNodes', setStatus('Loading packages...'));
  graphModel.on('coreReady', showHint);

  // TODO: these event seem to belong to scene itself:
  // Someone requested to search a package. Forward it to scene:
  appEvents.on('search', scene.search);
  appEvents.on('focusScene', scene.focus);
  appEvents.on('focusOnPackage', scene.focusOnPackage);
  appEvents.on('jiggle', scene.jiggle);
  appEvents.on('subgraphRequested', showSubgraph);

  $scope.showSubgraph = showSubgraph;

  $scope.tooltip = {
    isVisible: false
  };

  $scope.loading = {
    message: ''
  };

  function setStatus(message) {
    return function() {
      $scope.loading.isVisible = true;
      $scope.loading.message = message;
      digest();
    };
  }

  function showHint() {
    // todo: this should be in a separate nice directive
    var showMobileHelp = window.orientation;
    var helpMessage = showMobileHelp ? 'One finger touch: move forward <br/> Two fingers touch: move backward' :
      'Use WASD to move<br /> Spacebar to toggle steering';
    setStatus(helpMessage)();

    setTimeout(function () {
      $scope.loading.isVisible = false;
      digest();
    }, 5000);
  }

  function setGraphOnScope() {
    $scope.allPackagesGraph = graphModel.getGraph();
  }

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
