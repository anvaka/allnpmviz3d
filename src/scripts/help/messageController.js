/**
 * This controller is responsible for providing feedback:
 *  - Shows what's being loaded
 *  - Shows error in case of an error
 *  - Shows brief intro on startup
 */
module.exports = require('an').controller('messageController', messageController);
var webglEnabled = require('webgl-enabled')();

function messageController($scope) {
  var graphModel = $scope.graphModel;

  if (webglEnabled) {
    graphModel.on('loadingConnections', setStatus('Loading connections...'));
    graphModel.on('loadingNodes', setStatus('Loading packages...'));
    graphModel.on('coreReady', showHint);
    graphModel.on('downloadFailed', showDownloadError);
  } else {
    showWebglError();
  }

  $scope.message = '';

  function showDownloadError(err) {
    $scope.isVisible = true;
    $scope.messageType = 'error';
    $scope.error = err;
  }

  function showWebglError() {
    $scope.isVisible = true;
    $scope.messageType = 'webglError';
  }

  function setStatus(message) {
    return function() {
      $scope.isVisible = true;
      $scope.message = message;
      digest();
    };
  }

  function showHint() {
    $scope.isVisible = true;
    $scope.messageType = (window.orientation !== undefined) ? 'touchHelp' : 'keyboardHelp';
    scheduleCloseHintTimeout();
  }

  function digest() {
    setTimeout(function() {
      if (!$scope.$$phase) $scope.$digest();
    }, 0);
  }

  function scheduleCloseHintTimeout() {
    document.body.addEventListener('keydown', close, false);
    document.body.addEventListener('touchstart', close, false);
    var closeItself = setTimeout(close, 10000);

    function close() {
      document.body.removeEventListener('keydown', close);
      document.body.removeEventListener('touchstart', close);
      clearTimeout(closeItself);
      $scope.isVisible = false;
      digest();
    }
  }
}
