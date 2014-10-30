/**
 * This module checks whether node matches given pattern
 */
module.exports = function(pattern) {
  var rNameMatch = new RegExp(pattern, 'ig');

  return {
    isMatch: function(data) {
      // a simple name based match. Could be extended to complex filters
      return data && data.label && data.label.match(rNameMatch);
    }
  };
};
