module.exports = require('an').controller('searchController', searchController);

function searchController($scope) {
  // when graph model is done loading we will have graph instance set via
  // `allPackagesGraph` variable from scope
  var graph;

  // since search is not started => no matches
  $scope.matchedPackages = [];

  // we are not searching anything at the moment, hide search results:
  $scope.whenSearchInProgress = false;

  // let parent scope transfer focus to the scene
  $scope.looseFocus = function(e) {
    $scope.$emit('focusScene');
  };

  // `allPackagesGraph` will be available only after we are done downloading
  // graph data. Need to monitor this event before search can become enabled
  $scope.$watch('allPackagesGraph', function(newValue, oldValue) {
    if (!newValue) return;

    graph = newValue;
  });

  // this is used for pagenating results when user scrolls.
  $scope.loadMore = function noop() {};

  // tell parents that search pattern is changed, update search results
  $scope.highlightMatches = function(searchPattern) {
    $scope.$emit('search', searchPattern);
    showMatches(graph, searchPattern);
  };


  function showMatches(graph, pattern) {
    $scope.whenSearchInProgress = graph && pattern;
    if (!graph) return; // probably we are still loading...

    // load everything in memory
    var allMatches = getAllMatches(graph, pattern);

    // and then gradually render it to DOM (e.g. when user scrolls the list)
    // but first, remove all items from array
    $scope.matchedPackages.length = 0;

    // let UI know how many packages we have
    $scope.totalMatches = allMatches.length;

    // loadMore will ask next page of items
    $scope.loadMore = pagify(allMatches, appendMatches).nextPage;

    // load first page
    $scope.loadMore();

    function appendMatches(items) {
      for (var i = 0; i < items.length; ++i) {
        $scope.matchedPackages.push(items[i]);
      }
    }
  }

}

function pagify(collection, callback) {
  var itemsPerPage = 20;
  collection = collection || [];
  lastPage = 0;

  return {
    nextPage: function() {
      var totalItems = collection.length;
      if (totalItems === 0) return;

      var from = itemsPerPage * lastPage;
      var to = Math.min((lastPage + 1) * itemsPerPage, totalItems);
      if (to - from <= 0) return;

      callback(collection.slice(from, to));
      lastPage += 1;
    }
  };
}

function getAllMatches(graph, pattern) {
  var allMatches = [];
  var matcher = require('./matcher')(pattern);
  graph.forEachNode(function(node) {
    if (matcher.isMatch(node.data)) allMatches.push(node.data.label);
  });

  return allMatches;
}
