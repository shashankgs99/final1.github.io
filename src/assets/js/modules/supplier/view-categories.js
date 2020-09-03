(function () {
    var app = angular.module('app');
    app.controller('layout.standard.viewCategoriesController', ['$scope', '$state','Notification','CustomerService','BuyerSupplierService','$stateParams','$timeout','$window',
    function ($scope,$state,Notification,CustomerService,BuyerSupplierService,$stateParams,$timeout,$window) {

        BuyerSupplierService.getOne($stateParams.companyId).then(function(data){
            $scope.count = data.data.count;
            $scope.suppliersList = data.data;
            if('categories' in $scope.suppliersList){
                $scope.uiGridOptions.data = $scope.suppliersList.categories;
            }else{
                $scope.uiGridOptions.data = [];
            }
        });

        $scope.uiGridOptions = {
            enableCellEditOnFocus: true,
            enableColumnResizing: true,
            enableFiltering: true,
            enableGridMenu: true,
            showGridFooter: true,
            showColumnFooter: true,
            fastWatch: true,
            importerDataAddCallback: function importerDataAddCallback( grid, newObjects ) {
              $scope.myData = $scope.data.concat( newObjects );
            },
            columnDefs: [
                {
                    field: 'parent_category',
                    displayName: 'Parent Category',
                    width: 200,
                    pinnedLeft: true,
                    enableCellEdit: true,
                    enableSorting: true
                },
                {
                    field: 'sub_category', 
                    displayName:'Sub Category',
                    width:200,
                    pinnedLeft:true,
                    enableCellEdit: true,
                    enableSorting: true  
                },
                { 
                    field: 'sub_sub_category', 
                    displayName:'Secondary Sub Category',
                    width:200,
                    pinnedLeft:true,
                    enableCellEdit: true,
                    enableSorting: true  
                },
                { 
                    field: 'sub_sub_sub_category', 
                    displayName:'Tertiary Sub Category',
                    width:200,
                    pinnedLeft:true,
                    enableCellEdit: true,
                    enableSorting: true  
                }
            ],
            onRegisterApi: function onRegisterApi(registeredApi) {
                $scope.gridApi = registeredApi;
            }
           
        }; 

    }]);
})();