/**
 * This module checks whether node matches given pattern
 */
module.exports = function(pattern) {
  var rNameMatch = compileRegex(pattern);
  return {
    isMatch: function(data) {
      // a simple name based match. Could be extended to complex filters
      return rNameMatch && data && data.label && data.label.match(rNameMatch);
    }
  };
};

function compileRegex(pattern) {
  try {
    return new RegExp(pattern, 'ig');
  } catch (e) {
    // this cannot be compiled. Ignore it.
  }
}
