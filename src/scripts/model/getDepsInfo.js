/**
 * Calculates number of dependents/dependencies for a given node
 * based on `links` collection
 */
module.exports = function getDependenciesInfo(nodeId, links) {
  var result = {
    dependencies: 0,
    dependents: 0
  };

  for (var i = 0; i < links.length; ++i) {
    var link = links[i];

    if (link.fromId === nodeId) {
      result.dependencies += 1;
    } else {
      result.dependents += 1;
    }
  }

  return result;
};
