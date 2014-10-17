require('angular');
require('./appController');

var ngApp = angular.module('allnpmviz3d', []);

require('an').flush(ngApp);

angular.bootstrap(document, [ngApp.name]);

module.exports = ngApp;
