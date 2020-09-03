(function () {
    var app = angular.module('app');
    app.controller('layout.standard.SOItemController', ['$scope', '$window', '$mdDialog', '$log', '$state', 'Notification', 'MessageService', '$http', 's3Service', 'dateService','$rootScope','$timeout','$stateParams','$dialogScope','$filter','SalesOrderService',
        function ($scope, $window, $mdDialog, $log, $state, Notification, MessageService, $http, s3Service, dateService,$rootScope,$timeout,$stateParams,$dialogScope,$filter,SalesOrderService) {

            $scope.showDelete = $dialogScope.delete;
            $scope.saveItem = $dialogScope.save;
            $scope.SOData =[]; 
            $scope.type  = $dialogScope.type;
            $scope.items = angular.copy($dialogScope.items);
            $scope.items = _.sortBy($scope.items,'displayId');
            var savedItems;
            $scope.disableSave = false;
            $scope.disableUpdate = false;
            $scope.disableDelete = false;
            $scope.delete = false;
            $scope.selectedItems = function(entity) {
                entity.checked = true;
            };
           
            $scope.uiGridOptions = {
                data : $scope.items,
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
                        visible : $dialogScope.showCheckbox
                    },
                    {
                        name: 'displayId',
                        displayName: 'S No#',
                        width: 65,
                        pinnedLeft: true,
                        enableCellEdit: false,
                        enableSorting: true,
                        visible:$dialogScope.showCheckbox
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
                        field: 'description', 
                        displayName:'Description',
                        width:200,
                        pinnedLeft:true,
                        enableCellEdit: true,
                        enableSorting: true  
                    },
                    { 
                        field: 'customer_po_number', 
                        displayName:'Customer PO S.No',
                        width:200,
                        pinnedLeft:true,
                        enableCellEdit: true,
                        enableSorting: true  
                    },
                    { 
                        field: 'buyer_part_number', 
                        displayName:'Buyer part Number',
                        width:200,
                        pinnedLeft:true,
                        enableCellEdit: true,
                        enableSorting: true  
                    },
                    { 
                        field: 'supplier_part_number', 
                        displayName:'Supplier Part Number',
                        width:200,
                        pinnedLeft:true,
                        enableCellEdit: true,
                        enableSorting: true  
                    },
                    { 
                        field: 'quantity_ordered', 
                        displayName:'Quantity Ordered',
                        width:200,
                        pinnedLeft:true,
                        enableSorting: true,
                        enableCellEdit: false 
                    },
                    { 
                        field: 'unit_measure', 
                        displayName:'Unit Of Measure',
                        width:150,
                        pinnedLeft:true,
                        enableCellEdit: true  
                    },
                    { 
                        field: 'unit_price', 
                        displayName:'Unit Price',
                        width:150,
                        pinnedLeft:true,
                        enableCellEdit: true  
                    },
                    { 
                        field: 'price_basis', 
                        displayName:'Price Basis',
                        width:150,
                        pinnedLeft:true,
                        enableCellEdit: true  
                    },
                    { 
                        field: 'delivery_date', 
                        displayName:'Delivery Date',
                        width:150,
                        pinnedLeft:true,
                        enableCellEdit: true  
                    },
                    { 
                        field: 'delivery_basis', 
                        displayName:'Delivery Basis',
                        width:150,
                        pinnedLeft:true,
                        enableCellEdit: true  
                    },
                    // { 
                    //     field: 'cgst', 
                    //     displayName:'CGST',
                    //     width:150,
                    //     pinnedLeft:true,
                    //     enableCellEdit: true  
                    // },
                    // { 
                    //     field: 'sgst', 
                    //     displayName:'SGST',
                    //     width:150,
                    //     pinnedLeft:true,
                    //     enableCellEdit: true  
                    // },
                    { 
                        field: 'vat', 
                        displayName:'VAT',
                        width:150,
                        pinnedLeft:true,
                        enableCellEdit: true  
                    },
                    { 
                        field: 'other_charges', 
                        displayName:'Other Charges',
                        width:200,
                        pinnedLeft:true,
                        enableCellEdit: true,
                    }
                ],
                onRegisterApi: function onRegisterApi(registeredApi) {
                    $scope.gridApi = registeredApi;
          
                    $scope.gridApi.edit.on.afterCellEdit($scope,function(rowEntity, colDef, newValue, oldValue){
                        
                        if(colDef.name == 'quantity_ordered'){
                            if(rowEntity.unit_price){
                                rowEntity.total_price = parseInt(newValue)*parseInt(rowEntity.unit_price);
                            }
                        }
                        if(colDef.name == 'unit_price'){
                            if(rowEntity.quantity_ordered){
                                rowEntity.total_price = parseInt(newValue)*parseInt(rowEntity.quantity_ordered);
                            }
                        }
                        if(newValue != oldValue){
                            var data = newValue;
                            if(data = "" ||!data){
                               newValue = null;
                               var name = colDef.field;
                               rowEntity[name] = newValue;
                            }
                            if(colDef.field == 'cgst' || colDef.field == 'sgst'){
                                rowEntity.vat = 0.00;
                                if(newValue > 10){
                                    var name = colDef.field;
                                    rowEntity[name] = 0.00;
                                    Notification.error({
                                        message: 'Please enter gst value less than 10',
                                        positionX: 'right',
                                        positionY: 'top'
                                    });
                                }
                            } 
                            if(colDef.field == 'vat'){
                                rowEntity.sgst = 0.00;
                                rowEntity.cgst = 0.00;
                                if(newValue > 10){
                                    var name = colDef.field;
                                    rowEntity[name] = 0.00;
                                    Notification.error({
                                        message: 'Please enter vat value less than 10',
                                        positionX: 'right',
                                        positionY: 'top'
                                    });
                                }
                            } 
                            rowEntity.state = true;
                        }
                    });
                }
               
              };     
            
              function getRowId(row) {
                return row.id;
              }

              $scope.cancel = function(){
                    var data =[];
                    if($scope.delete){
                        $scope.items = $scope.items.map(function(item){
                          if(item.state){
                              $dialogScope.items.map(function(info){
                                   if(info.id == item.id){
                                       item = info;
                                   }
                              });
                          }
                          return item;
                      });  
                      $mdDialog.hide({savedItems:$scope.items,SOData :$scope.orderInfo,totalLength: $scope.totalLength,exisitingItemsCount :$scope.items.length});  
                    }else{
                      $mdDialog.cancel();  
                    }                 
              };

              $scope.AddDetails = function(ev,type){
                var arr=[];  
                $scope.items.map(function(item){
                    if(item.checked && item.id){
                        arr.push(item);
                    }
                });
                if(arr && arr.length){
                    return $mdDialog.show({
                        controller: 'layout.standard.annexureDetails',
                        templateUrl: 'assets/js/modules/po/orders/annexure-details/annexure-details.html',
                        parent: angular.element(document.body),
                        targetEvent: ev,
                        multiple : true,
                        clickOutsideToClose: true,
                        locals:{
                            $dialogScope:{
                                type:type
                            }
                        }
                      }).then(function (data) {
                          if (data) {
                              $scope.items = $scope.items.map(function (info) {
                                  if(info.checked){
                                    if(data.sgst){
                                        info.sgst = data.sgst;
                                        info.vat = null;
                                    }
                                    if(data.cgst){
                                        info.cgst = data.cgst;
                                        info.vat = null;
                                    }
                                    if(data.igst){
                                        info.igst = data.igst;
                                    }
                                    if(data.vat){
                                        info.vat = data.vat;
                                        info.sgst = null;
                                        info.cgst = null;
                                    }
                                    if(data.selected_quantity){
                                        info.quantity_ordered = data.selected_quantity;
                                    }
                                    if(data.unitPrice){
                                        info.unit_price = data.unitPrice;
                                    }
                                    if(data.deliveryDate){
                                        info.delivery_date = dateService.convertDateToPython(data.deliveryDate);
                                    }
                                    if(info.quantity_ordered && info.unit_price){
                                       info.total_price = parseInt(info.quantity_ordered)*parseInt(info.unit_price);
                                    }
                                    if(data.other_charges){
                                        info.other_charges = data.other_charges;
                                    }
                                    info.state = true;
                                  }
                                  return info;
                              });
                          }
                      }, function (err) {
    
                      });
                }else{
                    Notification.error({
                        message: 'Please select items to add details',
                        positionX: 'right',
                        positionY: 'top'
                    });
                    error = true;
                    return; 
                }
                
              };

              $scope.saveSO = function(){
                $scope.disableSave = true;
                var error;
                var selectedData =[];
                $scope.items = $scope.items.map(function(item){
                    if(error){
                        $scope.disableSave = false;
                        return;
                    }
                    if(!item.unit_measure){
                        Notification.error({
                            message: 'Please Enter Unit Measure',
                            positionX: 'right',
                            positionY: 'top'
                        });
                        error = true;
                        $scope.disableSave = false;
                        return;
                    }
                    if(!item.unit_price){
                        Notification.error({
                            message: 'Please Enter Unit Price',
                            positionX: 'right',
                            positionY: 'top'
                        });
                        error = true;
                        $scope.disableSave = false;
                        return;
                    }
                    if(!item.quantity_ordered){
                        Notification.error({
                            message: 'Please Enter Selected Quantity',
                            positionX: 'right',
                            positionY: 'top'
                        });
                        error = true;
                        $scope.disableSave = false;
                        return;
                    }
                    if(!item.delivery_date){
                        Notification.error({
                            message: 'Please Enter Delivery date',
                            positionX: 'right',
                            positionY: 'top'
                        });
                        error = true;
                        $scope.disableSave = false;
                        return;
                    }

                    // if(item.selected_quantity && item.quantity_remaining){
                    //     if(parseInt(item.selected_quantity) > parseInt(item.quantity_remaining)){
                    //         Notification.error({
                    //             message: 'selected quantity must be lesser than total quantity',
                    //             positionX: 'right',
                    //             positionY: 'top'
                    //         });
                    //         error = true;
                    //         return; 
                    //     }
                    // }
                    var totalTax = 0;
                    if(item.vat){
                        totalTax = Number(item.vat);
                    }
                    if(item.other_charges){
                        totalTax ?  totalTax = totalTax + Number(item.other_charges)  : totalTax = Number(item.other_charges);
                    }
                    if(item.delivery_date.includes("-")){
                        item.delivery_date = item.delivery_date.split("-").join("/");
                    }
                    var total = Number(item.unit_price)*Number(item.quantity_ordered);
                    var value = (total * (totalTax / 100)).toFixed(2);
                    item.total_price_with_tax = Number(total) + Number(value);
                    return item;
                    
                });
                if(!error){
                    SalesOrderService.saveSOItems($scope.items).then(function(res){
                          savedItems = res.data;
                          UpdateSalesAmount();
                    },function(err){
                        $scope.disableSave = false;
                    });
                }
            };  

            $scope.checkAll = function (value) {
                if(!value){
                    $scope.items = $scope.items.map(function (item) {
                        item.checked = true;
                        return item;
                    });
                }else{
                    $scope.items = $scope.items.map(function (item) {
                        item.checked = false;
                        return item;
                    });
                }
            };

            var a = ['', 'one ', 'two ', 'three ', 'four ', 'five ', 'six ', 'seven ', 'eight ', 'nine ', 'ten ', 'eleven ', 'twelve ', 'thirteen ', 'fourteen ', 'fifteen ', 'sixteen ', 'seventeen ', 'eighteen ', 'nineteen '];
            var b = ['', '', 'twenty', 'thirty', 'forty', 'fifty', 'sixty', 'seventy', 'eighty', 'ninety'];

            function inWords(num) {
                var str;
                if ((num = num.toString()).length > 9) return 'overflow';
                var n = ('000000000' + num).substr(-9).match(/^(\d{2})(\d{2})(\d{2})(\d{1})(\d{2})$/);
                if (!n) return; var str = '';
                str += (n[1] != 0) ? (a[Number(n[1])] || b[n[1][0]] + ' ' + a[n[1][1]]) + 'crore ' : '';
                str += (n[2] != 0) ? (a[Number(n[2])] || b[n[2][0]] + ' ' + a[n[2][1]]) + 'lakh ' : '';
                str += (n[3] != 0) ? (a[Number(n[3])] || b[n[3][0]] + ' ' + a[n[3][1]]) + 'thousand ' : '';
                str += (n[4] != 0) ? (a[Number(n[4])] || b[n[4][0]] + ' ' + a[n[4][1]]) + 'hundred ' : '';
                str += (n[5] != 0) ? ((str != '') ? 'and ' : '') + (a[Number(n[5])] || b[n[5][0]] + ' ' + a[n[5][1]]) + 'only ' : '';
                return str;
            }

            function UpdateSalesAmount(){
                var totalSalesCost=null;
                var currency;
                var itemsInfo={};
                SalesOrderService.getSOItems({soId:$dialogScope.SOId}).then(function(data){
                    if(data.data.results.length){
                        $scope.totalLength = data.data.results.length;
                        var currency = data.data.results[0].currency;
                        if($scope.disableDelete){
                            var result=[];
                            $scope.items.map(function(item){
                               if(!item.checked){
                                  result.push(item);
                               }
                            });
                            $scope.items = result;
                            $scope.uiGridOptions.data = result;
                            savedItems = $scope.items;
                        }
                        data.data.results.map(function(item){
                            if(item.total_price){
                                currency = item.currency;
                                totalSalesCost ? totalSalesCost = parseInt(totalSalesCost)+parseInt(item.total_price) : totalSalesCost = item.total_price;
                            }
                        });
                        var priceWords = inWords(totalSalesCost);
                        SalesOrderService.update($dialogScope.SOId,{price_number:totalSalesCost,currency:currency,price_words:priceWords}).then(function(res){
                            $scope.orderInfo = res.data;
                            if($scope.disableDelete){
                                Notification.success({
                                    message: 'Successfully deleted',
                                    positionX: 'right',
                                    positionY: 'top'
                                });
                                $scope.delete = true;
                                $scope.disableDelete = false;
                            }else{
                                Notification.success({
                                    message: 'Successfully saved',
                                    positionX: 'right',
                                    positionY: 'top'
                                });
                                $scope.disableSave = false;
                                itemsInfo.SOData = res.data;
                                if($dialogScope.type == 'add'){
                                    itemsInfo.count = savedItems.length;
                                    itemsInfo.savedItems = savedItems;
                                    itemsInfo.totalLength = $scope.totalLength;
                                    $mdDialog.hide(itemsInfo);
                                }
                                if($dialogScope.type == 'edit'){
                                    itemsInfo.savedItems = $scope.items;
                                    itemsInfo.totalLength = $scope.totalLength;
                                    itemsInfo.count = itemsInfo.savedItems.length;
                                    $mdDialog.hide(itemsInfo);
                                }
                            } 
                        },function(error){
                            $scope.disableSave = false;
                        });
                    }else{
                        $scope.totalLength = data.data.results.length;
                        $scope.items = [];
                        $scope.uiGridOptions.data = result;
                        savedItems = $scope.items;
                        totalSalesCost = 0;
                        currency=null;
                        priceWords = null;
                        SalesOrderService.update($dialogScope.SOId,{price_number:totalSalesCost,currency:currency,price_words:priceWords}).then(function(res){
                            if($scope.disableDelete){
                                Notification.success({
                                    message: 'Successfully deleted',
                                    positionX: 'right',
                                    positionY: 'top'
                                });
                                $scope.delete = true;
                                $scope.disableDelete = false;
                            }else{
                                Notification.success({
                                    message: 'Successfully saved',
                                    positionX: 'right',
                                    positionY: 'top'
                                });
                                $scope.disableSave = false;
                                itemsInfo.SOData = res.data;
                                if($dialogScope.type == 'edit'){
                                    itemsInfo.showTotal = false; 
                                    itemsInfo.savedItems = $scope.items;
                                    itemsInfo.count = itemsInfo.savedItems.length;
                                    itemsInfo.totalLength = $scope.totalLength;
                                    $mdDialog.hide(itemsInfo);
                                }
                            } 
                        });
                    }
                }); 
            }

            $scope.updateItems = function(){
               $scope.disableUpdate = true;
               var editedItems =[];
               var error;
               var arr=[];
               $scope.items.map(function(item){
                    if(item.state || item.checked){
                        if(error){
                            $scope.disableUpdate = false;
                            return;
                        }
                        if(!item.unit_measure){
                            Notification.error({
                                message: 'Please Enter Unit Measure',
                                positionX: 'right',
                                positionY: 'top'
                            });
                            error = true;
                            $scope.disableUpdate = false;
                            return;
                        }
                        if(!item.unit_price){
                            Notification.error({
                                message: 'Please Enter Unit Price',
                                positionX: 'right',
                                positionY: 'top'
                            });
                            error = true;
                            $scope.disableUpdate = false;
                            return;
                        }
                        if(!item.quantity_ordered){
                            Notification.error({
                                message: 'Please Enter Selected Quantity',
                                positionX: 'right',
                                positionY: 'top'
                            });
                            error = true;
                            $scope.disableUpdate = false;
                            return;
                        }
                        if(!item.delivery_date){
                            Notification.error({
                                message: 'Please Enter Delivery date',
                                positionX: 'right',
                                positionY: 'top'
                            });
                            error = true;
                            $scope.disableUpdate = false;
                            return;
                        } 
                        editedItems.push(item);
                    }
               });
               if(editedItems.length){
                    editedItems.map(function(soItem){
                        SalesOrderService.updateSOItems(soItem.id,soItem).then(function(resp){
                              arr.push(resp.data);
                              if(editedItems.length == arr.length){
                                  UpdateSalesAmount();
                              }
                        });
                    },function(error){
                        $scope.disableUpdate = false;
                    });
               }else{
                   if(error){
                       $scope.disableUpdate = false;
                       return;
                   }
               }
            };

            $scope.deleteItems = function(){
                var deletedData =[];
                var arr=[];
                $scope.items.map(function(item){
                   if(item.checked){
                      deletedData.push(item);
                   }
                });
                if(deletedData.length){
                    $scope.disableDelete = true;
                    deletedData.map(function(data){
                        SalesOrderService.deleteSOItems(data.id).then(function(resp){
                            arr.push(resp.data);
                            if(deletedData.length == arr.length){
                                UpdateSalesAmount();
                            }
                        },function(err){
                            $scope.disableDelete = false;
                        });
                    });
                    
                }else{
                    Notification.error({
                        message: 'Please select items to delete',
                        positionX: 'right',
                        positionY: 'top'
                    }); 
                    return;
                }
            };

          
        }]).controller('layout.standard.SOViewItems', ['$scope', '$window', '$mdDialog', '$log', '$state', 'Notification', 'MessageService', '$http', 's3Service', 'dateService','$rootScope','$timeout','$stateParams','$dialogScope','$filter','SalesOrderService',
        function ($scope, $window, $mdDialog, $log, $state, Notification, MessageService, $http, s3Service, dateService,$rootScope,$timeout,$stateParams,$dialogScope,$filter,SalesOrderService) {
           
            $scope.saveItem = true;
            $scope.showDelete = false;
            $scope.uiGridOptions = {
                data : $dialogScope.items,
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
                        name: 'id',
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
                        enableCellEdit: false,
                        enableSorting: true
                    },
                    {
                        field: 'description', 
                        displayName:'Description',
                        width:200,
                        pinnedLeft:true,
                        enableCellEdit: false,
                        enableSorting: true  
                    },
                    { 
                        field: 'notes', 
                        displayName:'Buyer PO S.No',
                        width:200,
                        pinnedLeft:true,
                        enableCellEdit: false,
                        enableSorting: true  
                    },
                    { 
                        field: 'buyer_part_number', 
                        displayName:'Buyer part Number',
                        width:200,
                        pinnedLeft:true,
                        enableCellEdit: false,
                        enableSorting: true  
                    },
                    { 
                        field: 'supplier_part_number', 
                        displayName:'Supplier Part Number',
                        width:200,
                        pinnedLeft:true,
                        enableCellEdit: false,
                        enableSorting: true  
                    },
                    { 
                        field: 'quantity_ordered', 
                        displayName:'Quantity Ordered',
                        width:200,
                        pinnedLeft:true,
                        enableSorting: true,
                        enableCellEdit: false 
                    },
                    { 
                        field: 'unit_measure', 
                        displayName:'Unit Of Measure',
                        width:150,
                        pinnedLeft:true,
                        enableCellEdit: false  
                    },
                    { 
                        field: 'unit_price', 
                        displayName:'Unit Price',
                        width:150,
                        pinnedLeft:true,
                        enableCellEdit: false  
                    },
                    { 
                        field: 'price_basis', 
                        displayName:'Price Basis',
                        width:150,
                        pinnedLeft:true,
                        enableCellEdit: false  
                    },
                    { 
                        field: 'delivery_date', 
                        displayName:'Delivery Date',
                        width:150,
                        pinnedLeft:true,
                        enableCellEdit: false  
                    },
                    { 
                        field: 'delivery_basis', 
                        displayName:'Delivery Basis',
                        width:150,
                        pinnedLeft:true,
                        enableCellEdit: false  
                    },
                    // { 
                    //     field: 'igst', 
                    //     displayName:'GST',
                    //     width:150,
                    //     pinnedLeft:true,
                    //     enableCellEdit: false  
                    // },
                    // { 
                    //     field: 'cgst', 
                    //     displayName:'CGST',
                    //     width:150,
                    //     pinnedLeft:true,
                    //     enableCellEdit: false  
                    // },
                    // { 
                    //     field: 'sgst', 
                    //     displayName:'SGST',
                    //     width:150,
                    //     pinnedLeft:true,
                    //     enableCellEdit: false  
                    // },
                    { 
                        field: 'vat', 
                        displayName:'VAT',
                        width:150,
                        pinnedLeft:true,
                        enableCellEdit: false  
                    },
                    { 
                        field: 'other_charges', 
                        displayName:'Other Charges',
                        width:200,
                        pinnedLeft:true,
                        enableCellEdit: false,
                    }
                ],
                onRegisterApi: function onRegisterApi(registeredApi) {
                    $scope.gridApi = registeredApi;
                }
               
            };   

              $scope.cancel = function(){
                $mdDialog.cancel();  
              };
        }]);
})();