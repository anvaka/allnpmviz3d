require('angular');
require('./appController');

var ngApp = angular.module('skusystem_visualizer', []);

require('an').flush(ngApp);

angular.bootstrap(document, [ngApp.name]);

module.exports = ngApp;
