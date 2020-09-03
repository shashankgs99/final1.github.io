(function(){
  
  var app = angular.module('app');

  // app.controller('inventory.mainController',['$scope','$window','$timeout','ParentCategoryService','CategoryService','InventoryService','hotRegisterer',function($scope,$window,$timeout,ParentCategoryService,CategoryService,InventoryService,hotRegisterer){
    
  //   $scope.categoryDataLoaded = false;

  //   ParentCategoryService.get().then(function(data){
  //     $scope.categoriesCount = data.data.count;
  //     $scope.categories = data.data.results;
  //     $scope.categoryDataLoaded = true;

  //     // Load Categories Data
  //     for(var i=0;i<$scope.categories.length;i+=1){
  //       (function(i){
  //         var category = $scope.categories[i];
  //         CategoryService.get({parent_category__category_name: category.category_name,sub_sub_category__isempty:'True'}).then(function(data){
  //           $scope.categories[i].categories = data.data.results;
  //         });
  //         // 5 second delay for this call. This is to ensure that scrolling is smooth.
  //         $timeout(function() {
  //             InventoryService.get({category_name: category.category_name}).then(function(data){
  //               $scope.categories[i].inventories = data.data.results;
  //             });
  //         }, 5000);
          
  //       })(i);
  //     };
  //   },function(err){
  //     console.log(err);
  //   });
  // }]);

  // app.controller('inventory.categoryController',['$scope','$window','$timeout','ParentCategoryService','CategoryService','InventoryService','hotRegisterer',function($scope,$window,$timeout,ParentCategoryService,CategoryService,InventoryService,hotRegisterer){
    
  //   $scope.params = {};
  //   $scope.categoryDataLoaded = false;
    
  //   ParentCategoryService.getById($scope.$stateParams.categoryId).then(function(data){
      
  //     $scope.category = data.data;
  //     $scope.categoryDataLoaded = true;

  //     // Load Params for HandsonTable
  //     $scope.params.category_name = $scope.category.category_name;

  //     CategoryService.get({parent_category__category_name: $scope.category.category_name}).then(function(data){
  //           $scope.category.categories = data.data.results;
  //     });
  //     InventoryService.get({category_name: $scope.category.category_name}).then(function(data){
  //       $scope.category.inventories = data.data.results;
  //       console.log($scope.category);
  //     });

  //   })
    
  // }]);

})();