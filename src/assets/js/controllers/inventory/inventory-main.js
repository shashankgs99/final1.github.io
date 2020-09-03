(function(){
  
  var app = angular.module('app',["ui.grid","ui.grid.resizeColumns","ui.grid.selection","ui.grid.cellNav","ngLodash"]);
  app.controller('inventoryList.mainController',['$scope','$window','$timeout','ParentCategoryService','CategoryService','InventoryService','$injector',
  'hotRegisterer',
  function($scope,$window,$timeout,ParentCategoryService,CategoryService,InventoryService,$injector,hotRegisterer){
    $injector.loadNewModules(['ngHandsontable']);
  }]);
})();