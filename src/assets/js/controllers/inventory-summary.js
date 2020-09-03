(function(){
  
  var app = angular.module('app');

  app.controller('inventory.summaryController',['$scope','$window','$timeout','ParentCategoryService','CategoryService','InventoryService','hotRegisterer',function($scope,$window,$timeout,ParentCategoryService,CategoryService,InventoryService,hotRegisterer){
    
    $scope.categoryDataLoaded = false;

    ParentCategoryService.get().then(function(data){
      $scope.categoriesCount = data.data.count;
      $scope.categories = data.data.results;
      $scope.categoryDataLoaded = true;

      // Load Categories Data
      for(var i=0;i<$scope.categories.length;i+=1){
        (function(i){
          var category = $scope.categories[i];
          CategoryService.get({parent_category__category_name: category.category_name,sub_sub_category__isempty:'True'}).then(function(data){
            $scope.categories[i].categories = data.data.results;
          });
          // 5 second delay for this call. This is to ensure that scrolling is smooth.
          $timeout(function() {
              InventoryService.get({category_name: category.category_name}).then(function(data){
                $scope.categories[i].inventories = data.data.results;
              });
          }, 5000);
          
        })(i);
      };
    },function(err){
      console.log(err);
    });
  }]);
})();