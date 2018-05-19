/**
 * Search bar controller. Handles user input and fires search commands
 */
require('./dynamic');

module.exports = require('an').controller('searchController', searchController);

var screen = require('../scene/screenUtils');
var appEvents = require('../events');
var pagify = require('./pagify');

function searchController($scope) {
  // when graph model is done loading we will have graph instance set via
  // `allProductsGraph` variable from scope
  var graph;

  // we will throttle user input to increase responsiveness
  var lastInputHandle;

  // since search is not started => no matches
  $scope.matchedProducts = [];

  // we are not searching anything at the moment, hide search results:
  $scope.showSearchResults = false;

  // on mobile devices we don't want to always show list of products
  $scope.showListOfProducts = true;

  // let parent scope transfer focus to the scene
  $scope.formSubmitted = function(e) {

    appEvents.fire('focusScene');
    if ($scope.selectedProduct && $scope.selectedProduct[0] === ':') {
      // command mode starts with colon and has a form of
      // <command> <value>
      var commandInput = $scope.selectedProduct;
      var commandMatch = commandInput.match(/^:([^\s]+)(.+)?$/);
      if (commandMatch) handleCommand(commandMatch[1], commandMatch[2], commandInput);
    }
  };

  $scope.showDetails = function(productName) {
    appEvents.fire('focusOnProduct', productName);
    appEvents.fire('focusScene');
    if (screen.isSmall()) {
      $scope.showListOfProducts = false;
    }
  };

  appEvents.on('showDependencyGraph', showDependencyGraph);

  // `allProductsGraph` will be available only after we are done downloading
  // graph data. Need to monitor this event before search can become enabled
  $scope.$watch('allProductsGraph', function(newValue, oldValue) {
    if (!newValue) return;

    graph = newValue;
  });

  // this is used for pagenating results when user scrolls.
  $scope.loadMore = function noop() {};

  // tell parents that search pattern is changed, update search results
  $scope.searchPatternChanged = searchPatternChanged;

  function handleCommand(command, args, commandInput) {
    // todo: simplify this
    if (command.match(/^d.*ts$/i) && args) { // Assume 'dependents'
      appEvents.fire('subgraphRequested', args.replace(/^\s+|\s+$/g, ''), 'dependents');
    } else if (command.match(/^d.*es$/i) && args) { // assume 'dependencies'
      appEvents.fire('subgraphRequested', args.replace(/^\s+|\s+$/g, ''), 'dependencies');
    } else if (command.match(/^a(ll)?d.*ts$/i) && args) { // Assume 'alldependents'
      appEvents.fire('subgraphRequested', args.replace(/^\s+|\s+$/g, ''), 'alldependents');
    } else if (command.match(/^a(ll)?d.*es$/i) && args) { // assume 'alldependencies'
      appEvents.fire('subgraphRequested', args.replace(/^\s+|\s+$/g, ''), 'alldependencies');
    } else if (commandInput.match(/i love npm/i)) {
      // todo: this should be based on some sort of plugins
      appEvents.fire('jiggle');
    } else {
      // TODO: Implement more commands. This is supposed to be command mode, where users
      // can enter complex filters.
      // Ideas: `:help`, `:about`
      console.log('This cool idea is not implemented yet');
    }
  }

  function searchPatternChanged(searchPattern) {
    $scope.showSearchResults = graph && searchPattern;
    if (!graph) return; // probably we are still loading...

    // we are throttling input here. No need to react to every keystroke:
    if (lastInputHandle) {
      clearTimeout(lastInputHandle);
      lastInputHandle = 0;
    }

    if (searchPattern && searchPattern[0] === ':') {
      $scope.showSearchResults = false; // this should be handled elsewhere
      // this is command mode. It should be handled only when form is submitted
      return;
    }

    lastInputHandle = setTimeout(function() {
      appEvents.fire('search', searchPattern);

      $scope.showSearchResults = searchPattern;
      var allMatches = getAllMatches(graph, searchPattern);
      var header = createSearchResultsHeader(allMatches.length);
      showMatches(allMatches, header);
      lastInputHandle = 0;
      if (!$scope.$$phase) $scope.$digest();
    }, 150);
  }

  function showDependencyGraph(e) {
    $scope.showSearchResults = true;
    if (screen.isSmall()) {
      $scope.showListOfProducts = false;
    }
    if (e.type === 'dependents') {
      $scope.selectedProduct = ':dependents ' + e.name;
    } else if (e.type === 'dependencies') {
      $scope.selectedProduct = ':dependencies ' + e.name;
    } else if (e.type === 'alldependents') {
      $scope.selectedProduct = ':alldependents ' + e.name;
    } else if (e.type === 'alldependencies') {
      $scope.selectedProduct = ':alldependencies ' + e.name;
    } else {
      throw new Error('Unsupported subgraph type');
    }

    var allMatches = [];
    var productName = require('./simpleEscape')(e.name);
    var header;
    if (e.graph) {
      e.graph.forEachNode(function(node) {
        if (node.data.label !== e.name) allMatches.push(node.data.label);
      });
      if (e.type.match(/(all)?dependents/)) {
        header = createDependentsResultHeader(allMatches.length, productName);
      } else if (e.type.match(/(all)?dependencies/)){
        header = createDependenciesResultHeader(allMatches.length, productName);
      }
    } else {
      header = 'Could not find product ' + productName;
    }

    showMatches(allMatches, header);
  }

  function showMatches(allMatches, header) {
    // Gradually render allMatches to DOM (e.g. when user scrolls the list)
    // but first, remove all items from array
    $scope.matchedProducts.length = 0;

    // let UI know how many products we have
    $scope.totalMatches = allMatches.length;
    $scope.header = header;

    // loadMore will ask next page of items
    $scope.loadMore = pagify(allMatches, appendMatches).nextPage;

    // load first page
    $scope.loadMore();

    function appendMatches(items) {
      for (var i = 0; i < items.length; ++i) {
        $scope.matchedProducts.push(items[i]);
      }
    }
  }
}

// TODO: maybe this should be a separate module? It could be used by graphModel
// too to filter the graph...
function getAllMatches(graph, pattern) {
  var allMatches = [];
  var matcher = require('./matcher')(pattern);
  graph.forEachNode(function(node) {
    if (matcher.isMatch(node.data)) allMatches.push(node.data.label);
  });

  // TODO: could be a good idea to sort this
  return allMatches;
}

function createDependentsResultHeader(foundCount, productName) {
  if (foundCount === 1) {
    return "1 <small>product depends on </small> " + productName;
  } else if (foundCount === 0) {
    return "<small>No products depend on </small> " + productName;
  } else {
    return "{{totalMatches|number}} <small>products depend on </small> " + productName;
  }
}

function createDependenciesResultHeader(foundCount, productName) {
  if (foundCount === 1) {
    return productName + " <small>depends on </small> 1 <small>product</small>";
  } else if (foundCount === 0) {
    return productName + "<small> does not have dependencies</small>";
  } else {
    return productName + "<small> depends on</small> {{totalMatches|number}} <small>products</small>";
  }
}

function createSearchResultsHeader(foundCount) {
  if (foundCount === 1) {
    return "<small>Found</small> 1 <small>product</small>";
  } else if (foundCount === 0) {
    return "<small>No matches found</small>";
  } else {
    return "<small>Found</small> {{totalMatches|number}} <small>products</small>";
  }
}
