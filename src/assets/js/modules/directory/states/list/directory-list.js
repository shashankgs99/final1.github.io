//directory.list.controller
(function(){
  
  var app = angular.module('app');

  app.controller('directory.list.controller',[
    '$scope',
    '$stateParams', function($scope,$stateParams){

    $scope.itemType = 'directory';
    if($stateParams.inventory){
      $scope.itemType = 'inventory';
    }
    if($stateParams.rental){
      $scope.itemType = 'rental';
    }
    $scope.directory_data = {};
    // Bingding variables to both the views - Content & Filters
    $scope.directory_data.filters = {};

    
  }]);


})();