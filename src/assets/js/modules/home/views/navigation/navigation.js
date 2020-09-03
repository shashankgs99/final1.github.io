//home.navigation.controller
(function(){
    angular.module('app')
    .controller('home.navigation.controller',['$scope','$interval','CategoryService',function($scope,$interval,CategoryService){
      
      $scope.isCategoryLoaded = false;
      $scope.categories = [];
      $scope.searchText = '';

      // var loadCategories = function(pageNo, callback){
      //   CategoryService.get({page: pageNo}).then(function(data){
      //     return callback(null, data.data)
      //   },function(error){
      //     return callback(error, null)
      //   })
      // }
      
      // var pageNo = 1

      // loadCategories(pageNo, function lambda(error,data){
      //   if(error){
      //     console.log(error);
      //   }else{
      //     $scope.categories = $scope.categories.concat(data.results);
      //     if(data.next){ // Next Page is there
      //       pageNo = pageNo+1;
      //       loadCategories(pageNo, lambda)
      //     }else{
      //       $scope.isCategoryLoaded = true;
      //     }
      //   }
      // })

      $scope.slickConfig = {
        enabled: true,
        autoplay: true,
        dots:true,
        prevArrow: false,
        nextArrow: false,
        draggable: false,
        autoplaySpeed: 3000,
        method: {},
        event: {
            beforeChange: function (event, slick, currentSlide, nextSlide) {
            },
            afterChange: function (event, slick, currentSlide, nextSlide) {
            }
        }
    };
        
      $scope.selection = {};
      $scope.example2model = []; 

      $scope.searchOption = 'directory';
      $scope.searchGlobal = function(searchOption,searchText){
        var url = '';
        if(searchOption === 'inventory'){
          url = '/inventory/list/category?query='+searchText;  
        }else if(searchOption === 'rental'){
          url = '/rental/list/category?query='+searchText;  
        }else if(searchOption === 'directory'){
          url = '/companies/list?query='+searchText;  
        }else if(searchOption === 'supplier'){
          url = '/companies/list?query='+searchText;  
        }        
        window.open(url,'_self');
      };
    }]);
})();