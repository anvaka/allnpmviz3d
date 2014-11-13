
module.exports = require('an').directive('helpMessage', helpMessage);

var fs = require('fs');

function helpMessage() {
  return {
    scope: { graphModel: '=' },
    restrict: 'E',
    controller: require('./messageController'),
    replace: true,
    template: fs.readFileSync(__dirname + '/message.html', 'utf8')
  };
}
