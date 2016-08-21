angular.module('groupChatApp', []);

angular.module('groupChatApp').factory('SocketFactory', function($rootScope) {
    var socket = io();

    return {

        on: function(event, callback) {
            socket.on(event, function() {
                var args = arguments;
                $rootScope.$apply(function() {
                    callback.apply(socket, args);
                });
            });
        },

        emit: function(event, data, callback) {
            socket.emit(event, data, function() {
                var args = arguments;
                $rootScope.$apply(function() {
                  if (callback) {
                    callback.apply(socket, args);
                  }
              });
            });
        }
    }
});

angular.module('groupChatApp').directive('ctrlEnterBreakLine', function() {
  return function(scope, element, attrs) {
    var ctrlDown = false;
    element.bind("keydown", function(event) {
      if (event.which === 17) {
        ctrlDown = true;
        setTimeout(function() {
          ctrlDown = false;
        }, 1000)
      }
      if (event.which === 13) {
        if (ctrlDown) {
          element.val(element.val() + '\n')
        } else {
          scope.$apply(function() {
            scope.$eval(attrs.ctrlEnterBreakLine);
          });
          event.preventDefault();
        }
      }
    });
  };
});

angular.module('groupChatApp').directive('autoScrollToBottom', function() {
  return {
    link: function(scope, element, attrs) {
      scope.$watch(
        function() {
          return element.children().length;
        },
        function() {
          element.animate({
            scrollTop: element.prop('scrollHeight')
          }, 1000);
        }
      );
    }
  };
});

angular.module('groupChatApp').controller('MessageCreatorCtrl', function($scope, SocketFactory) {
  $scope.createMessage = function () {
    SocketFactory.emit('messages.create', $scope.newMessage);
    $scope.newMessage = ''
  }
});

angular.module('groupChatApp').controller('RoomCtrl', function($scope, SocketFactory) {
  $scope.messages = []
  SocketFactory.on('messages.read', function (messages) {
    $scope.messages = messages
  })
  SocketFactory.on('messages.add', function (message) {
    $scope.messages.push(message)
  })
  SocketFactory.emit('messages.read')
})
