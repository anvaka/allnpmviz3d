// dirty hack to get THREE.js into global namespace
var THREE = window.THREE = require('three').THREE;

require('an').controller(AppController);

function AppController($scope, $http) {
  var graphModel = require('./graphModel')($http);
  var graphView = require('./view/graphView')(graphModel);
}

