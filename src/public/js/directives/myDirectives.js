app.directive('gameStack', function() {
      return {
        restrict: 'E',
        scope: {
          info: '='
        },
        templateUrl: 'static/js/directives/mainGameStack.html'
      };
  });
