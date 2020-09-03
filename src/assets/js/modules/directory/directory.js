//directory.list.controller
(function(){
  
    var app = angular.module('app');
  
    app.controller('directory.controller',[
      '$scope',
      '$window',
      '$timeout',
      function($scope,$window,$timeout){
  
      $scope.directory_data = {}; // to be shared with child UIs
      
    }]);
  
    // Used by Angular Router
    app.controller('directory.progressController',['$scope','$window','$timeout','ParentCategoryService','CategoryService','DirectoryService',
    // 'hotRegisterer',
    function($scope,$window,$timeout,ParentCategoryService,CategoryService,DirectoryService,hotRegisterer){


    }]);

    app.controller('directory.progress.selectChannelsController',['$scope','$window','$timeout','ParentCategoryService','CategoryService','DirectoryService',
    // 'hotRegisterer',
    function($scope,$window,$timeout,ParentCategoryService,CategoryService,DirectoryService,hotRegisterer){
  
      $scope.isPrimaryCategoryLoaded = false;

      DirectoryService.get().then(function(data){
        $scope.isPrimaryCategoryLoaded = true;
        $scope.primaryCategories = data.data.results;

      },function(err){
        console.log(err);
      })

      $scope.isSubCategoryLoaded = false;
      $scope.isSubSubCategoryLoaded = false;
      $scope.isSubSubSubCategoryLoaded = false;
  
      $scope.loadSubCategoryOptions = function(higher_category){
        $scope.selectedDirectory = higher_category;
        $scope.subCategories = '';
        $scope.subSubCategories = '';
        $scope.subSubSubCategories = '';
        
        var params = {};
        params.category__category_id__startswith = higher_category.category; // Start with primary category name
        params.category__sub_category__isempty='False'; // Limit search to one with only Sub Categories
        params.category__sub_sub_category__isempty='True'; // Limit search to one with only Sub Categories
  
        DirectoryService.get(params).then(function(data){
          $scope.isSubCategoryLoaded = true;
          $scope.subCategories = data.data.results;
  
        },function(err){
          console.log(err);
        })
      };
      $scope.loadSubSubCategoryOptions = function(higher_category){
        $scope.selectedDirectory = higher_category;
        $scope.subSubCategories = '';
        $scope.subSubSubCategories = '';
  
        var params = {};
        params.category__category_id__startswith = higher_category.category; // Start with primary category name
        params.category__sub_sub_category__isempty='False'; // Limit search to one with only Sub Categories
        params.category__sub_sub_sub_category__isempty='True'; // Limit search to one with only Sub Categories
  
        DirectoryService.get(params).then(function(data){
          $scope.isSubSubCategoryLoaded = true;
          $scope.subSubCategories = data.data.results;
  
        },function(err){
          console.log(err);
        })
      };
      $scope.loadSubSubSubCategoryOptions = function(higher_category){
        $scope.selectedDirectory = higher_category;
        $scope.subSubSubCategories = '';
  
        var params = {};
        params.category__category_id__startswith = higher_category.category; // Start with primary category name
        params.category__sub_sub_sub_category__isempty='False'; // Limit search to one with only Sub Categories
  
        DirectoryService.get(params).then(function(data){
          $scope.isSubSubSubCategoryLoaded = true;
          $scope.subSubSubCategories = data.data.results;
  
        },function(err){
          console.log(err);
        })
      };
      $scope.selectSubSubSubCategory = function(higher_category){
        $scope.selectedDirectory = higher_category;
      }
  
    }]);
  
  })();