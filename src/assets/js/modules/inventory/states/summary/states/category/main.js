(function(){
  
  var app = angular.module('app');

  app.controller('inventory.summary.categoryController',[
    '$scope',
    '$window',
    '$timeout',
    'ParentCategoryService',
    'CategoryService',
    'InventoryService',
    '$stateParams',
    '$state',
    function($scope,$window,$timeout,ParentCategoryService,CategoryService,InventoryService,$stateParams,$state){
    
    $scope.categoryDataLoaded = false;
    var rentalCategories = [];
    $scope.rental = $stateParams.rental;
    if($stateParams.rental){
      $scope.params = $stateParams.rental;
    }

    getCategories();

    var skipClick = false;
    $scope.openResults = function(category_name,sub_category){
      if(!skipClick){
        var url = '';
        if($stateParams.rental){
          url += '/rental/list/category?q=&idx=Inventory&p=0&hFR[categories.lvl0][0]='+category_name;  
        }else{
          url += '/inventory/list/category?q=&idx=Inventory&p=0&hFR[categories.lvl0][0]='+category_name;  
        }
        if(sub_category){
          url += ' > '+sub_category;
        }
        if($stateParams.rental){
          url += '&dFR[stock_or_inventory][0]=Rental';
        }else{
          url += '&dFR[stock_or_inventory][0]=-Rental';
        }
        window.open(url,'_self');
        skipClick = true;
      }
    };

    function getCategories(){
      InventoryService.getActiveCategories({itemType:$stateParams.rental?'Rental':'Stock'}).then(function(data){
        $scope.categories = _.groupBy(data.data,'parent_category');
        var categoryNames = Object.keys($scope.categories);
        $scope.categoryDataLoaded = true;
        // Load Categories Data

        for(var i=0;i<categoryNames.length;i+=1){

          (function(i){
            var category = categoryNames[i];
            // 5 second delay for this call. This is to ensure that scrolling is smooth.
            $timeout(function() {
                var params;
                if($stateParams.rental){
                  params = {category_name: category,stock_or_inventory: "Rental"};
                }else{
                  params = {category_name: category,stock_or_inventory: {"value": "Rental", "operator": "!=" }};
                }
                InventoryService.getOutput(params).then(function(data){
                  $scope.categories[category][0].inventories = data.data.results;
                  $scope.categories[category][0].inventoriesLoaded = 'true';
                });
            }, 5000);
            
          })(i);
          };
        },function(err){
          console.log(err);
        });
      }
  }]);

})();