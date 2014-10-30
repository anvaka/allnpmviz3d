/**
 * Module takes a collection and let clients iterate over it page by page in
 * asynchronous manner.
 *
 * E.g.:
 *
 * var collection = pagify([0, ... , 100], function (items) {
 *   console.log(items);
 * });
 *
 * collection.nextPage(); // prints 0..19;
 * collection.nextPage(); // prints 20..39;
 */
module.exports = pagify;

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
