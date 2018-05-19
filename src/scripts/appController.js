/**
 * Welcome to the entry point of this visualization. I tried to keep
 * code modular and clean. But if I failed somewhere - feel free to
 * open PR!
 *
 * This is the main controller of the application. It kicks off graph
 * download, initializes scene and sometimes coordinates events between
 * application parts.
 */

// These requires are used to get angular controllers/directives into
// final bundle.
require('./search/searchBar');
require('./help/message');

// Unfortunately THREE.js sometimes relies on global THREE object. We
// patch global window here:
require('./scene/patchThree');

// appEvents is a singletone, which serves as a simple Pub/Sub mechanism.
// Reduces coupling betweeng components.
var appEvents = require('./events');

// simple statistics about products: how many dependents/dependencies?
var getDependenciesInfo = require('./model/getDepsInfo');

// register AppController as a controller within angular
require('an').controller(AppController);

function AppController($scope, $http) {
  // graphmodel gives us access to the graph
  var graphModel = require('./graphModel')($http);

  // some directives need access to the graph model as well. Put it to parent scope here:
  $scope.graphModel = graphModel;

  // Let the rendering begin:
  var scene = require('./scene/scene')(graphModel);
  if (scene) {
    // scene may be null, if webgl is not supported. This is very bad,
    // most of the site will not function properly.
    scene.on('preview', showPreview);
    scene.on('show-node-tooltip', showNodeTooltip);
    // TODO: these event seem to belong to scene itself:
    // Someone requested to search a product. Forward it to scene:
    appEvents.on('search', scene.search);
    appEvents.on('focusScene', scene.focus);
    appEvents.on('focusOnProduct', scene.focusOnProduct);
    appEvents.on('jiggle', scene.jiggle);
  }

  // when labels are ready search control can start using them:
  graphModel.on('labelsReady', setGraphOnScope);

  // when someone needs to show only part of the graph, they fire 'subgraphRequested' event:
  appEvents.on('subgraphRequested', showSubgraph);

  $scope.showSubgraph = showSubgraph;

  // tooltip is what's shown when user hovers over node.
  $scope.tooltip = {
    isVisible: false
  };

  function setGraphOnScope() {
    // TODO: maybe this should not be here.
    $scope.allProductsGraph = graphModel.getGraph();
  }

  function showSubgraph(productName, type) {
    var filteredGraph = graphModel.filterSubgraph(productName, type);
    if (scene) scene.subgraph(productName); // TODO: rename this to something else.

    appEvents.fire('showDependencyGraph', {
      name: productName,
      type: type,
      graph: filteredGraph
    });

    if (filteredGraph) {
      showPreview(productName);
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

  function showPreview(productName) {
    // todo: This violates SRP. Should this be in a separate module?
    if (productName === undefined) return; // no need to toggle full preview

    var node = graphModel.getNodeByName(productName);

    if (!node) return; // no such product found

    var depsInfo = getDependenciesInfo(node.id, node.links);
    $scope.product = {
      name: productName,
      dependencies: depsInfo.dependencies,
      dependents: depsInfo.dependents
    };
    $scope.showProductPreview = true;

    digest();
  }
}
