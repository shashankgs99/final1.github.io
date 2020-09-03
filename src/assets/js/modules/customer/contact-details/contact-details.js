(function () {
    var app = angular.module('app');
    app.controller('layout.contact.details', ['$scope', '$window', '$modal', '$log', '$state', 'Notification', 'MessageService','CsvService', '$http', 's3Service', 'OfferService', '$stateParams','BuyerSupplierService','CustomerService',
        function($scope, $window, $modal, $log, $state, Notification, MessageService, CsvService, $http, s3Service, OfferService, $stateParams,BuyerSupplierService,CustomerService) {
            
            $scope.List =[];
            if($state.current.name.includes("customers")){
                $scope.type = "Customers";
                CustomerService.get({ page_size: 10000 }).then(function (data) {
                    $scope.List = data.data.results; 
                });
            }else{
                $scope.type = "Suppliers";
                BuyerSupplierService.get().then(function(data){
                    $scope.List = data.data.results; 
                });
            }

            $scope.uiGridOptions = {
                enableCellEditOnFocus: true,
                enableColumnResizing: true,
                enableFiltering: true,
                enableGridMenu: true,
                showGridFooter: true,
                showColumnFooter: true,
                fastWatch: true,
                rowIdentity: getRowId,
                getRowIdentity: getRowId,
                importerDataAddCallback: function importerDataAddCallback( grid, newObjects ) {
                  $scope.myData = $scope.data.concat( newObjects );
                },
                columnDefs: [
                    {
                        field: 'firstname',
                        displayName: 'First Name',
                        width: 150,
                        pinnedLeft: true,
                        enableCellEdit: false,
                        enableSorting: true,
                    },
                    {
                        field: 'lastname', 
                        displayName:'Last Name',
                        width:200,
                        pinnedLeft:true,
                        enableCellEdit: false,
                        enableSorting: true,
                    },
                    { 
                        field: 'countryCode1', 
                        displayName:'Country Code',
                        width:200,
                        pinnedLeft:true,
                        enableCellEdit: true,
                        enableSorting: true,
                    },
                    { 
                        field: 'phonenumber1', 
                        displayName:'Mobile',
                        width:200,
                        pinnedLeft:true,
                        enableCellEdit: true,
                        enableSorting: true,
                    },
                    { 
                        field: 'countryCode2', 
                        displayName:'Country Code',
                        width:200,
                        pinnedLeft:true,
                        enableCellEdit: true,
                        enableSorting: true,
                    },
                    { 
                        field: 'phonenumber2', 
                        displayName:'Phone',
                        width:200,
                        pinnedLeft:true,
                        enableSorting: true,
                        enableCellEdit: false,
                    },
                    { 
                        field: 'emailid1', 
                        displayName:'Email 1',
                        width:200,
                        pinnedLeft:true,
                        enableSorting: true,
                        enableCellEdit: true,
                    },
                    { 
                        field: 'emailid2', 
                        displayName:'Email 2',
                        width:200,
                        pinnedLeft:true,
                        enableSorting: true,
                        enableCellEdit: true,
                    },
                    { 
                        field: 'company_name', 
                        displayName:'Company Name',
                        width:200,
                        pinnedLeft:true,
                        enableSorting: true,
                        enableCellEdit: true,
                    }
                ],
                onRegisterApi: function onRegisterApi(registeredApi) {
                    $scope.gridApi = registeredApi;
                }
               
              }; 

              if($stateParams.data){
                  if($stateParams.data[0].contacts.length){
                    var contacts = $stateParams.data[0].contacts;
                    contacts.map(function(info){
                       info.company_name = $stateParams.data[0].name;
                    });
                    $scope.uiGridOptions.data = contacts;
                  }else{
                    $scope.uiGridOptions.data = [];
                    Notification.error({
                        message: 'selected  has no contacts',
                        positionX: 'right',
                        positionY: 'top'
                    });
                    return;
                  }
                  
              }

              function getRowId(row) {
                 return row.id;
              }
              
            //   $scope.rowClick = function (row) { 
            //     var selectionCellTemplate = '<div class="ngCellText ui-grid-cell-contents">' +
            //    ' <div ng-click="grid.appScope.rowClick(row)">{{COL_FIELD}}</div>' +
            //    '</div>'; 
            //     cellTemplate: selectionCellTemplate     
            //     var index = row.grid.renderContainers.body.visibleRowCache.indexOf(row);
            //     $state.go("supplierDashboard.customers.viewCompany",{companyId:$stateParams.companyId});
            //   };

              $scope.FilterContacts = function(data){
                  CustomerService.getOne(data).then(function(res){
                      var results = res.data;
                      if(results && results.contacts.length){
                         var contacts = results.contacts;
                         contacts.map(function(info){
                            info.company_name = res.data.name;
                         });
                         $scope.uiGridOptions.data = contacts;
                      }else{
                        $scope.uiGridOptions.data = [];
                        Notification.error({
                            message: 'selected '+ $scope.type + ' has no contacts',
                            positionX: 'right',
                            positionY: 'top'
                        });
                        return;
                      }
                  });
              };
       
        }]);
})();