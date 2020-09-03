(function () {
    var app = angular.module('app');
    app.controller('layout.standard.MRController', ['$scope', 'BuyerSupplierService', 'CustomerService', '$state', '$mdDialog', 'StoreService', 'SalesOrderService', 'Notification','$stateParams','MRService','POService',
        function ($scope,BuyerSupplierService,CustomerService, $state, $mdDialog, StoreService,SalesOrderService, Notification,$stateParams,MRService,POService) {

            $scope.selectedTab=0;
            var selectedItems =[];
            $scope.storeTypes =[];
            $scope.editQuantity = false;
            $scope.disableSaveItems = false;
            $scope.disableSave = false;
            $scope.MR = {};
            MRService.getStatus().then(function(res){
                $scope.MRStatus = res.data.results;
            });

            MRService.getRequestType().then(function(result){
                $scope.requestType = result.data.results;
            });
 
            MRService.getPurpose().then(function(result){
                $scope.purposeTypeList = result.data.results;
            });

            if($scope.current_user.data && $scope.current_user.data.company){
                SalesOrderService.get({supplier_company_id:$scope.current_user.data.company.id}).then(function(res){
                   $scope.SOList = res.data.results;
                });

                StoreService.getStoreTypes({company : $scope.current_user.data.company.id}).then(function(res){
                    $scope.storeTypesList = res.data.results;
                //     $scope.storeTypesList.map(function(item){
                //         if(item.name == 'Inward Store'){
                //            StoreService.get({store_type:item.id,company:$scope.current_user.data.company.id}).then(function(res){
                //                $scope.sourceNames = res.data.results;
                //            });
                //         }
                //    });
                });

                POService.get({buyer_company_id:$scope.current_user.data.company.id}).then(function (data) {
                    $scope.count = data.data.count;
                    $scope.poList = data.data.results;
                });
            }
            
            function LoadMR(){
                MRService.getOne($stateParams.MRId).then(function(res){
                    $scope.MR = res.data; 
                });
            }

            $scope.FilterDestinationDetails = function(data){
                if(data.name  == 'Sub-Vendors'){
                    BuyerSupplierService.get().then(function (res) {
                        $scope.storeNames = res.data.results;
                    }); 
                }
                else if(data.name  == 'Customer'){
                    CustomerService.get().then(function (res) {
                        $scope.storeNames = res.data.results;
                    }); 
                }else{
                    $scope.storeNames = [];
                    StoreService.get({store_type:data.id,company:$scope.current_user.data.company.id}).then(function(res){
                        $scope.storeNames = res.data.results;
                        $scope.storeNames = $scope.storeNames.map(function(item){
                              item.name = item.store_name;
                              return item;
                        });
                    });
                }
            };

            $scope.selectSourceList = function(data){
                $scope.sourceNames =[];
                StoreService.get({store_type:data,company:$scope.current_user.data.company.id}).then(function(res){
                    $scope.sourceNames = res.data.results;
                });
            };

            $scope.SelectContactsData = function(data){
               if($scope.MR.request_type == 2){
                    if(data.contacts && data.contacts.length){
                        FilterContacts(data.contacts);
                    }
                    if(data.addresses && data.addresses.length){
                        FilterAddresses(data.addresses);
                    }
               }else{
                    if(data.company.contact && data.company.contact.length){
                        FilterContacts(data.company.contact);
                    }
                    if(data.company.addresses && data.company.addresses.length){
                        FilterAddresses(data.company.addresses);
                    } 
               }
            };

            $scope.FilterItems = function(data){
                StoreService.getInventoryItems({poId:data,store:$scope.MR.source_detail}).then(function(res){
                    selectedItems =[];
                    $scope.inventoryList = res.data.results;
                    $scope.UiGridOptions.data =[];
                    $scope.UiGridOptions.data = res.data.results;
                    if($scope.MR.request_type == 2 || ($scope.MR.request_type == 1 && $scope.MR.purpose == 1)){
                        $scope.UiGridOptions.data =  $scope.UiGridOptions.data.map(function(item){
                            var quantity = item.quantity_received - item.quantity_issued;
                            item.quantity_received = quantity;
                            return item;
                        });
                    }
                });
            };

            $scope.selectDestination = function(data){
                if(data.purpose == 1){
                    $scope.storeTypesData = [];
                    $scope.storeTypesList.map(function (item) {
                        if (item.name == 'Production') {
                            $scope.storeTypesData.push(item);
                        }
                    });
                }
                if(data.purpose == 2){
                    $scope.storeTypesData = [];
                    $scope.storeTypesList.map(function (item) {
                        if (item.name == 'Inward Store' || item.name == 'Store(Others)') {
                            $scope.storeTypesData.push(item);
                        }
                    });
                }
            };

            $scope.filterStoresData = function(data){
                StoreService.getInventoryLocations({store_name:data}).then(function(res){
                    selectedItems =[];
                    $scope.inventoryList = res.data.results;
                    $scope.UiGridOptions.data =[];
                    $scope.UiGridOptions.data = res.data.results;
                    if($scope.MR.request_type && $scope.MR.request_type == 2 || ($scope.MR.request_type == 1 && $scope.MR.purpose == 1)){
                        $scope.UiGridOptions.data =  $scope.UiGridOptions.data.map(function(item){
                            var quantity = item.quantity_received - item.quantity_issued;
                            item.quantity_received = quantity;
                            return item;
                        });
                    }
                }); 
            };

            function FilterContacts(data){
                $scope.contactPersons =[];
                data.map(function(item){
                   var name = null;
                   if(item.firstname){
                      name = item.firstname;
                   }
                   if(item.lastname){
                      name ?  name = `${name} ${item.lastname}` :name = item.lastname;
                   }
                   if(name){
                      $scope.contactPersons.push({id:item.id,name:name});
                   }
                });
            }

            function FilterAddresses(data){
                $scope.addresses =[];
                data.map(function(res){
                    var address;
                    if (res.nameofaddress) {
                        address = res.nameofaddress;
                    }
                    if (res.addressline1) {
                        address ?  address = `${address},${res.addressline1}` : address = res.addressline1;
                    }
                    if (res.addressline2) {
                        address ?  address = `${address},${res.addressline2}`: address = res.addressline2;
                    }
                    if (res.city) {
                        address ?  address = `${address},${res.city}` : address = res.city;
                    }
                    if (res.state) {
                        address ?  address = `${address},${res.state}` : address = res.state;
                    }
                    if (res.country) {
                        address ?  address = `${address},${res.country}` : address = res.country;
                    }
                    $scope.addresses.push({ id: res.id,address: address });
                });
            }

            if($stateParams.MRId){
                LoadMR();
            }else{
                $scope.disableTabs = {
                    first : true,
                    second:true
                };
            }

            // if($scope.current_user.data && $scope.current_user.data.company){
            //     StoreService.getInventoryItems({company:$scope.current_user.data.company.id}).then(function(res){
            //         selectedItems =[];
            //         $scope.inventoryList = res.data.results;
            //         $scope.UiGridOptions.data = res.data.results;
            //     });
            // }

            $scope.save = function(data){
                $scope.disableSave = true;
                if(!data.request_type){
                    Notification.error({
                        message: 'please select request type',
                        positionX: 'right',
                        positionY: 'top'
                    });
                    $scope.disableSave = false;
                    return;
                }
                if(!data.order_reference){
                    Notification.error({
                        message: 'please select order reference',
                        positionX: 'right',
                        positionY: 'top'
                    });
                    $scope.disableSave = false;
                    return;
                }
                if(!data.source_type){
                    Notification.error({
                        message: 'please select source type',
                        positionX: 'right',
                        positionY: 'top'
                    });
                    $scope.disableSave = false;
                    return;
                }
                if(!data.source_detail){
                    Notification.error({
                        message: 'please select source detail',
                        positionX: 'right',
                        positionY: 'top'
                    });
                    $scope.disableSave = false;
                    return;
                }
                if(!data.destinationType){
                    Notification.error({
                        message: 'please select destination type',
                        positionX: 'right',
                        positionY: 'top'
                    });
                    $scope.disableSave = false;
                    return;
                }
                if(!data.destinationDetail){
                    Notification.error({
                        message: 'please select destination Detail',
                        positionX: 'right',
                        positionY: 'top'
                    });
                    $scope.disableSave = false;
                    return;
                }
                if(data.source_detail == data.destinationDetail){
                    Notification.error({
                        message: 'source and destination details must be different',
                        positionX: 'right',
                        positionY: 'top'
                    });
                    $scope.disableSave = false;
                    return;
                }
                var dt=null,dd=null;
                dt = data.destinationType;
                dd = data.destinationDetail;
                if(data.destinationDetail){
                    data.destination_detail =  data.destinationDetail.name;
                }
                data.destination_type = data.destinationType.id;
                data.company = $scope.current_user.data.company.id;
                $scope.MRStatus.map(function(item){
                    if(item.name == 'Created'){
                        data.mr_status = item.id;
                    }
                 });
                MRService.post(data).then(function(res){
                    $scope.MR = res.data; 
                    $scope.MR.destinationType = dt;
                    $scope.MR.destinationDetail = dd;
                    if($scope.MR.request_type == 2 || ($scope.MR.request_type == 1 && $scope.MR.purpose == 1)){
                        $scope.UiGridOptions.data =  $scope.UiGridOptions.data.map(function(item){
                            var quantity = item.quantity_received - item.quantity_issued;
                            item.quantity_received = quantity;
                            return item;
                        });
                    }
                    var date = $scope.MR.created.toString();
                    $scope.MR.created_date = date.slice(0,10);
                    $scope.disableTabs.first = false;
                    Notification.success({
                        message: 'Successfully created',
                        positionX: 'right',
                        positionY: 'top'
                    });
                    $scope.selectedTab=1;
                },function(err){
                    $scope.disableSave = false;
                });
            };

            $scope.cancel = function(){
                selectedItems =[];
                $state.go("storeDashboard.materialRequisition.list");
            };

            function getRowId(row) {
                return row.id;
            }

            $scope.UiGridOptions = {
                enableCellEditOnFocus: true,
                enableColumnResizing: true,
                enableFiltering: true,
                enableGridMenu: true,
                showGridFooter: true,
                showColumnFooter: true,
                fastWatch: true,
                rowIdentity: getRowId,
                getRowIdentity: getRowId,
                importerDataAddCallback: function importerDataAddCallback(grid, newObjects) {
                    $scope.myData = $scope.data.concat(newObjects);
                },
                onRegisterApi: function onRegisterApi(registeredApi) {
                    $scope.gridApi = registeredApi;
                },
                columnDefs:[
                    {
                        name: 'checked',
                        displayName: '',
                        width: 75,
                        cellTemplate: '<input type="checkbox" ng-model="row.entity.checked" ng-click="grid.appScope.rowClick(row.entity)">',
                        visible:!$scope.showColumn
                    },
                    {
                        name: 'inventory.id',
                        displayName: 'Inventory Id',
                        width: 100,
                        pinnedLeft: true,
                        enableCellEdit: false,
                        enableSorting: true,
                    },
                    {
                        field: 'inventory.po_item.title',
                        displayName: 'Title',
                        width: 200,
                        pinnedLeft: true,
                        enableCellEdit: false,
                        enableSorting: true,
                    },
                    {
                        field: 'inventory.po_item.description',
                        displayName: 'Description',
                        width: 220,
                        pinnedLeft: true,
                        enableCellEdit: false,
                        enableSorting: true,
                    },
                    {
                        field: 'quantity',
                        displayName: 'Available Quantity',
                        width: 125,
                        pinnedLeft: true,
                        enableCellEdit:false,
                    },
                    {
                        field: 'issued_quantity',
                        displayName: 'Quantity to be issued',
                        width: 125,
                        pinnedLeft: true,
                        enableCellEdit:false,
                    },
                    {
                        field: 'inventory.po_item.unit_measure',
                        displayName: 'Unit Of Measure',
                        width: 100,
                        pinnedLeft: true,
                        enableCellEdit: false,
                    }
                ]
            };

            $scope.itemsGridOptions = {
                enableCellEditOnFocus: true,
                enableColumnResizing: true,
                enableFiltering: true,
                enableGridMenu: true,
                showGridFooter: true,
                showColumnFooter: true,
                fastWatch: true,
                rowIdentity: getRowId,
                getRowIdentity: getRowId,
                importerDataAddCallback: function importerDataAddCallback(grid, newObjects) {
                    $scope.myData = $scope.data.concat(newObjects);
                },
                onRegisterApi: function onRegisterApi(registeredApi) {
                    $scope.gridApi = registeredApi;
                },
                columnDefs:[
                    {
                        name: 'checked',
                        displayName: '',
                        width: 75,
                        cellTemplate: '<input type="checkbox" ng-model="row.entity.checked" ng-click="grid.appScope.rowClick(row.entity)">',
                        visible:!$scope.showColumn
                    },
                    {
                        name: 'inventory.id',
                        displayName: 'Inventory Id',
                        width: 100,
                        pinnedLeft: true,
                        enableCellEdit: false,
                        enableSorting: true,
                    },
                    {
                        field: 'inventory.po_item.title',
                        displayName: 'Title',
                        width: 200,
                        pinnedLeft: true,
                        enableCellEdit: false,
                        enableSorting: true,
                    },
                    {
                        field: 'inventory.po_item.description',
                        displayName: 'Description',
                        width: 200,
                        pinnedLeft: true,
                        enableCellEdit: false,
                        enableSorting: true,
                    },
                    {
                        field: 'quantity',
                        displayName: 'Available Quantity',
                        width: 125,
                        pinnedLeft: true,
                        enableCellEdit:false,
                    },
                    {
                        field: 'issued_quantity',
                        displayName: 'Quantity to be issued',
                        width: 125,
                        pinnedLeft: true,
                        enableCellEdit:true,
                    },
                    {
                        field: 'inventory.po_item.unit_measure',
                        displayName: 'Unit Of Measure',
                        width: 125,
                        pinnedLeft: true,
                        enableCellEdit: false,
                    }
                ]
            };

            $scope.rowClick = function(data){
                if(data.checked){
                    selectedItems.push(data);
                }else{
                    var index = null;
                    selectedItems.map(function(item,$index){
                        if(item.id == data.id){
                            index = $index;
                        }
                    });
                    selectedItems.splice(index,1);
                }
            };
           
            $scope.saveToList = function(){
                if(selectedItems.length){
                    $scope.selectedTab=1;
                    $scope.editQuantity = true;
                    $scope.itemsGridOptions.data = [];
                    $scope.itemsGridOptions.data = selectedItems;
                    $scope.itemsGridOptions.data = $scope.itemsGridOptions.data.map(function(item){
                        item.checked = false;
                        return item;
                    });
                    if($scope.disableTabs.second){
                        $scope.disableTabs.second = false;
                    }
                    $scope.selectedTab = 2;
                }else{
                    Notification.error({
                        message: 'please select items',
                        positionX: 'right',
                        positionY: 'top'
                    });
                    return;
                }
                
            };

            $scope.saveItems = function(){
                 $scope.disableSaveItems = true;
                 var reference=[];
                 var data = angular.copy($scope.itemsGridOptions.data);
                 var error = false;
                 var items=[];
                 data.map(function(record){
                    if(error){
                        return;
                    }
                    if(!record.issued_quantity){
                        Notification.error({
                            message: 'please enter issue quantity',
                            positionX: 'right',
                            positionY: 'top'
                        });
                        $scope.disableSaveItems = false;
                        error = true;
                        return;
                    }
                    if(record.issued_quantity && record.inventory.po_item.quantity_received){
                       if(Number(record.issued_quantity) > Number(record.inventory.po_item.quantity_received)){
                            Notification.error({
                                message: 'quantity issued must be less than available quantity',
                                positionX: 'right',
                                positionY: 'top'
                            });
                            $scope.disableSaveItems = false;
                            error = true;
                            return;
                       }
                    }
                    if(record.inventory.net_quantity > 0){
                        var quantity = record.inventory.net_quantity - record.inventory.issued_quantity;
                        if(quantity < 0){
                            Notification.error({
                                message: `issued quantity is not availble in ${record.id}`,
                                positionX: 'right',
                                positionY: 'top'
                            });
                            error = true;
                            return
                        }
                    }
                    var obj={};
                    obj.issued_quantity = record.issued_quantity;
                    obj.inventory = record.inventory.id;
                    obj.MR = $scope.MR.id;
                    items.push(obj);
                 });
                 if(!error && items.length){
                    MRService.postItems(items).then(function(res){
                        $scope.disableSaveItems = false;
                        Notification.success({
                            message: 'Successfully created',
                            positionX: 'right',
                            positionY: 'top'
                        }); 
                        $scope.cancel();
                    },function(err){
                        $scope.disableSaveItems = false;
                    });
                 }else{
                    if(!error){
                        Notification.error({
                            message: 'please select items',
                            positionX: 'right',
                            positionY: 'top'
                        });  
                        return;
                    }
                 }
            };

            $scope.selectAll = function(value,gridData){
                if(!value){
                    gridData = gridData.map(function(item){
                        item.checked = true;
                        return item;
                    });  
                    selectedItems =  gridData;  
                }else{
                    gridData = gridData.map(function(item){
                        item.checked = false;
                        return item;
                    });
                    selectedItems =  []; 
                }
            };

            $scope.remove  = function(data){
                var data =[];
                var checked =[];
                $scope.itemsGridOptions.data.map(function(item){
                   if(!item.checked){
                     data.push(item);
                   }else{
                     checked.push(item);
                   }
                }); 
                if(!checked.length){
                    Notification.error({
                        message: 'please select items to remove',
                        positionX: 'right',
                        positionY: 'top'
                    });
                    return;
                }else{
                    $scope.itemsGridOptions.data =[];
                    $scope.itemsGridOptions.data = data;
                }
                
            };

            $scope.updateDetails = function(ev){
                var data = [];
                $scope.itemsGridOptions.data.map(function(item){
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
                               display:'material_requisition',
                            }
                        }
                    }).then(function(res){
                        $scope.UiGridOptions.data = $scope.UiGridOptions.data.map(function(item){
                           if(item.checked){
                               if(res && res.issued_quantity){
                                  item.issued_quantity = res.issued_quantity;
                               }
                           }
                           return item;
                        });
                    });
                }else{
                    Notification.error({
                        message: 'please select items',
                        positionX: 'right',
                        positionY: 'top'
                    });
                }
            };

            $scope.FilterList = function(data){
                  $scope.purposeType = [];
                  $scope.storeTypesData =[];
                  if(data == 1){
                      $scope.purposeTypeList.map(function(item){
                          if(item.name == 'Processing' || item.name == 'Transfer'){
                              $scope.purposeType.push(item);
                           }
                      });
                      $scope.storeTypesList.map(function(item){
                        if(item.name == 'Production' || item.name == 'Inward Store' || item.name == 'Store(Others)'){
                           $scope.storeTypesData.push(item);
                        }
                      });
                  }
                  if(data == 2){
                    $scope.purposeTypeList.map(function(item){
                        if(item.name == 'Sale' || item.name == 'Non-billable-Returnable' || item.name == 'Non-billable-Non-Returnable'){
                           $scope.purposeType.push(item);
                        }
                    });
                    $scope.storeTypesList.map(function(item){
                        if(item.name == 'Customer' || item.name == 'Sub-Vendors'){
                           $scope.storeTypesData.push(item);
                        }
                    });
                  }
            };


       
        }]);
})();