(function(){
  
  var app = angular.module('app');

  app.controller('inventoryList.filters',['$scope','$window','$timeout','ParentCategoryService','CategoryService','InventoryService','hotRegisterer',
  function($scope,$window,$timeout,ParentCategoryService,CategoryService,InventoryService,hotRegisterer){
    
    $scope.params = {};
    $scope.categoryDataLoaded = false;
    console.log($scope.$stateParams.categoryId);

    ParentCategoryService.get().then(function(data){
      $scope.categoriesCount = data.data.count;
      $scope.categories = data.data.results;
      console.log($scope.categories);
      dropdownCompatibleArray($scope.categories,'category_name');
    });

    ParentCategoryService.getById($scope.$stateParams.categoryId).then(function(data){
      $scope.category = data.data;
      $scope.categoryDataLoaded = true;
      // Load Params for HandsonTable
      $scope.params.category_name = $scope.category.category_name;
      CategoryService.get({parent_category__category_name: $scope.category.category_name}).then(function(data){
            $scope.category.categories = data.data.results;
      });
    })
    
    var dropdownCompatibleArray = function(array, key_in_array){
      var new_array = [];
      console.log(array);
      array.forEach(function(item,$index){
        console.log(item);
        var data = {};
        data.id = $index+1;
        data.label = item[key_in_array];
        new_array.push(data)
      });
      console.log(new_array);
      return new_array;
    };

    // DOM Manipulation
    //angular.element(document.querySelectorAll('div.card-container')).css('height',(window.outerHeight(true)+23)+'px');
  }]);

})();