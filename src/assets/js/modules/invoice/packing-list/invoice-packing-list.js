(function () {
    var app = angular.module('app');
    app.controller('layout.invoice.PackingListController', ['$scope', '$window', '$mdDialog', '$log', '$state', 'Notification', 'MessageService', '$http', 's3Service', 'dateService','$rootScope','$timeout','$stateParams','$dialogScope','$filter','InvoicePackingService',
        function ($scope, $window, $mdDialog, $log, $state, Notification, MessageService, $http, s3Service, dateService,$rootScope,$timeout,$stateParams,$dialogScope,$filter,InvoicePackingService) {

            $dialogScope.items = $dialogScope.items.map(function(item,$index){
                item.index = $index + 1;
                return item;
            });

            $scope.uiGridOptions = {
                data : $dialogScope.items,
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
                        name: 'checked',
                        displayName: '',
                        cellTemplate: '<input type="checkbox" ng-model="row.entity.checked">',
                    },
                    {
                        name: 'index',
                        displayName: '#',
                        width: 50,
                        pinnedLeft: true,
                        enableCellEdit: false,
                        enableSorting: true,
                    },
                    {
                        field: 'title',
                        displayName: 'Title',
                        width: 150,
                        pinnedLeft: true,
                        enableCellEdit: true,
                        enableSorting: true
                    },
                    {
                        field: 'details', 
                        displayName:'Details',
                        width:200,
                        pinnedLeft:true,
                        enableCellEdit: true,
                        enableSorting: true  
                    },
                    { 
                        field: 'quantity', 
                        displayName:'Quantity',
                        width:150,
                        pinnedLeft:true,
                        enableCellEdit: true,
                        enableSorting: true  
                    },
                    { 
                        field: 'units', 
                        displayName:'Units',
                        width:150,
                        pinnedLeft:true,
                        enableCellEdit: true,
                        enableSorting: true  
                    },
                    { 
                        field: 'packing', 
                        displayName:'Packing',
                        width:150,
                        pinnedLeft:true,
                        enableCellEdit: true,
                        enableSorting: true  
                    },
                    { 
                        field: 'dimensions', 
                        displayName:'Dimensions',
                        width:150,
                        pinnedLeft:true,
                        enableSorting: true,
                        enableCellEdit: false 
                    },
                    { 
                        field: 'net_weight', 
                        displayName:'Net Weight',
                        width:150,
                        pinnedLeft:true,
                        enableCellEdit: true  
                    },
                    { 
                        field: 'gross_weight', 
                        displayName:'Gross Weight',
                        width:150,
                        pinnedLeft:true,
                        enableCellEdit: true  
                    },
                    { 
                        field: 'remarks', 
                        displayName:'Remarks',
                        width:150,
                        pinnedLeft:true,
                        enableCellEdit: true  
                    }
                ],
                onRegisterApi: function onRegisterApi(registeredApi) {
                    $scope.gridApi = registeredApi;
                }
               
              };     
            
              function getRowId(row) {
                return row.id;
              }

              $scope.cancel = function(){
                  $mdDialog.hide();  
              };

              $scope.save = function(){
                 var error;
                 var data =[];
                 $dialogScope.items.map(function(item){
                    if(error){
                        return;
                    }
                    if(item.checked){
                        if(!item.title){
                            Notification.error({
                                message: 'please enter title',
                                positionX: 'right',
                                positionY: 'top'
                            });
                            error = true;
                            return;
                        }
                        data.push(item);
                    }
                 }); 
                 if(data.length && !error){
                    InvoicePackingService.post(data).then(function(res){
                        Notification.success({
                            message: 'Successfully saved',
                            positionX: 'right',
                            positionY: 'top'
                        });
                        $mdDialog.hide();
                     });
                 }else{
                     if(!data.length && !error){
                        Notification.error({
                            message: 'please select items',
                            positionX: 'right',
                            positionY: 'top'
                        }); 
                        return;
                     }
                 }
              };

            // Update Packing List
            $scope.UpdatePackingList = function(ev){
                var data = [];
                $scope.uiGridOptions.data.map(function(item){
                  if(item.checked){
                      data.push(item);
                  }
                });
                if(data.length){
                    return $mdDialog.show({
                        controller: 'layout.order.updateGRNItems',
                        templateUrl: 'assets/js/modules/po/GRN/update-grn-details/update-grn-details.html',
                        parent: angular.element(document.body),
                        targetEvent: ev,
                        multiple:true,
                        clickOutsideToClose: true,
                        locals: {
                            $dialogScope: {
                               display:'packingList',
                            }
                        }
                    }).then(function(res){
                        if(res){
                            $scope.uiGridOptions.data = $scope.uiGridOptions.data.map(function(item){
                                if(item.checked){
                                    if(res && res.packing_packing){
                                        item.modified = true;
                                        item.packing = res.packing_packing;
                                    }
                                    if(res && res.packing_dimenssion){
                                        item.modified = true;
                                        item.dimensions = res.packing_dimenssion;
                                    }
                                    if(res && res.packing_net_weight){
                                        item.modified = true;
                                        item.net_weight = res.packing_net_weight;
                                    }
                                    if(res && res.packing_gross_weight){
                                        item.modified = true;
                                        item.gross_weight = res.packing_gross_weight;
                                    }
                                    if(res && res.packing_remarks){
                                        item.modified = true;
                                        item.remarks = res.packing_remarks;
                                    }
                                }
                                return item;
                             });
                        }
                    });
                }else{
                    Notification.error({
                        message: 'please select items',
                        positionX: 'right',
                        positionY: 'top'
                    });
                }
            };

            $scope.selectAll = function(data){
                 if(!data){
                     $scope.uiGridOptions.data = $scope.uiGridOptions.data.map(function(item){
                        item.checked = true;
                        return item;
                     });
                 }else{
                    $scope.uiGridOptions.data = $scope.uiGridOptions.data.map(function(item){
                        item.checked = false;
                        return item;
                     });
                 }
            };

        }]);
})();