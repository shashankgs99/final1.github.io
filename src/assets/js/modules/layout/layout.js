(function(){
    angular.module('app')
   .controller('layout.controller',[
    '$scope',
    '$window',
    '$location',
    '$http',
    '$timeout',
    'ngProgressFactory',
    function($scope,$window,$location,$http,$timeout,ngProgressFactory){
        
      console.log("From Layout Controller");

      // Parent Scope.
      $scope.progressbar = {};
      
      // NgProgress
      $scope.progressbar = ngProgressFactory.createInstance();
      $scope.progressbar.start();
      $timeout(function() {
         $scope.progressbar.complete();
      }, 3000);
          
   }]);
})();