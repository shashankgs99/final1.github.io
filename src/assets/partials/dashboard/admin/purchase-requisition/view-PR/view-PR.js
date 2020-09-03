(function () {
    var app = angular.module('app');
    app.controller('layout.standard.viewPRData', ['$scope', '$window', '$mdDialog', '$log', '$state', 'Notification', 'MessageService', '$http', 's3Service', 'dateService', 'OfferService', '$rootScope', '$timeout', '$stateParams', 'MTOService', 'MTOOfferService', '$dialogScope', 'POService', '$filter','uiGridConstants',
        function ($scope, $window, $mdDialog, $log, $state, Notification, MessageService, $http, s3Service, dateService, OfferService, $rootScope, $timeout, $stateParams, MTOService, MTOOfferService, $dialogScope, POService, $filter,uiGridConstants) {
         
            $dialogScope.items = $dialogScope.items.map(function(item){
                if($dialogScope.type == 'add'){
                    var data  = item.item_number.split("-").pop();
                    item.displayId = data.split("_").pop();
                }
                if($dialogScope.type == 'edit' || $dialogScope.type == 'view'){
                    var data  = item.item_number.split("-").pop();
                    item.displayId = data.split("_").pop();
                }        
                return item;       
            });
            $dialogScope.items = _.sortBy($dialogScope.items,'item_number');
            _.replace = function(collection, identity, replacement) {
                var index = _.indexOf(collection, _.find(collection, identity));
                collection.splice(index, 1, replacement);  
            };

            $scope.showButtons = $dialogScope.showButtons;
            if($dialogScope.showButtons){
                $scope.visible = false;
                $scope.showCheckbox = true;
                $scope.displaySave = false;
            }else{
                $scope.visible = true;  
            }
            if($scope.visible){
                $scope.showCheckbox = true;
            }
            $scope.showDelete = $dialogScope.delete;
            $scope.disableSave = false;
            $scope.disableUpdate  = false;
            $scope.group = $dialogScope.group;
            $scope.cancelDialog = false;
            $scope.items = angular.copy($dialogScope.items);
            $scope.type = $dialogScope.type;
            $scope.delete = false;
            var selectedItems =[];
            var editedItems =[];
            var savedItems = [];
            if($dialogScope.visible == false){
                $scope.visible = $dialogScope.visible;
            }
            var a = ['', 'one ', 'two ', 'three ', 'four ', 'five ', 'six ', 'seven ', 'eight ', 'nine ', 'ten ', 'eleven ', 'twelve ', 'thirteen ', 'fourteen ', 'fifteen ', 'sixteen ', 'seventeen ', 'eighteen ', 'nineteen '];
            var b = ['', '', 'twenty', 'thirty', 'forty', 'fifty', 'sixty', 'seventy', 'eighty', 'ninety'];

            $scope.uiGridOptions = {
                data: $scope.items,
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
                columnDefs: [
                    {
                        name: 'checked',
                        displayName: '',
                        cellTemplate: '<input type="checkbox" ng-model="row.entity.checked" ng-click="grid.appScope.rowClick(row.entity)">',
                        visible: $scope.showCheckbox
                    },
                    {
                        name: 'displayId',
                        displayName: 'S.No',
                        width: 150,
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
                        displayName: 'Description',
                        width: 200,
                        pinnedLeft: true,
                        enableCellEdit: false,
                        enableSorting: true
                    },
                    {
                        field: 'notes',
                        displayName: 'Item Note',
                        width: 100,
                        pinnedLeft: true,
                        enableCellEdit: $scope.visible,
                        enableSorting: true
                    },
                    {
                        field: 'buyer_part_number',
                        displayName: 'Buyer part Number',
                        width: 100,
                        pinnedLeft: true,
                        enableCellEdit: $scope.visible,
                        enableSorting: true
                    },
                    {
                        field: 'supplier_part_number',
                        displayName: 'Supplier Part Number',
                        width: 100,
                        pinnedLeft: true,
                        enableCellEdit: $scope.visible,
                        enableSorting: true
                    },
                    {
                        field: 'quantity_remaining',
                        displayName: 'Available Quantity',
                        width: 100,
                        pinnedLeft: true,
                        enableSorting: true,
                        enableCellEdit: false
                    },
                    {
                        field: 'selected_quantity',
                        displayName: 'Selected Quantity',
                        width: 100,
                        pinnedLeft: true,
                        enableSorting: true,
                        enableCellEdit: $scope.visible
                    },
                    {
                        field: 'unit_measure',
                        displayName: 'Unit Of Measure',
                        width: 100,
                        pinnedLeft: true,
                        enableCellEdit: $scope.visible
                    },
                    {
                        field: 'unit_price',
                        displayName: 'Unit Price',
                        width: 100,
                        pinnedLeft: true,
                        enableCellEdit: $scope.visible
                    },
                    {
                        field: 'price_basis',
                        displayName: 'Price Basis',
                        width: 125,
                        pinnedLeft: true,
                        enableCellEdit: $scope.visible
                    },
                    {
                        field: 'delivery_date',
                        displayName: 'Delivery Date',
                        width: 125,
                        pinnedLeft: true,
                        enableCellEdit: $scope.visible
                    },
                    {
                        field: 'delivery_basis',
                        displayName: 'Delivery Basis',
                        width: 100,
                        pinnedLeft: true,
                        enableCellEdit: $scope.visible
                    },
                    {
                        field: 'buyer_notes',
                        displayName: 'Buyer Notes',
                        width: 150,
                        pinnedLeft: true,
                        enableCellEdit: $scope.visible,
                    },
                    // {
                    //     field: 'igst',
                    //     displayName: 'IGST',
                    //     width: 70,
                    //     pinnedLeft: true,
                    //     enableCellEdit: $scope.visible
                    // },
                    // {
                    //     field: 'cgst',
                    //     displayName: 'CGST',
                    //     width: 70,
                    //     pinnedLeft: true,
                    //     enableCellEdit: $scope.visible
                    // },
                    // {
                    //     field: 'sgst',
                    //     displayName: 'SGST',
                    //     width: 70,
                    //     pinnedLeft: true,
                    //     enableCellEdit: $scope.visible
                    // },
                    {
                        field: 'vat',
                        displayName: 'VAT',
                        width: 70,
                        pinnedLeft: true,
                        enableCellEdit: $scope.visible
                    },
                    {
                        field: 'other_charges',
                        displayName: 'Other Charges',
                        width: 70,
                        pinnedLeft: true,
                        enableCellEdit: $scope.visible,
                    },
                    {
                        field: 'secondary_units',
                        displayName: 'Secondary Units',
                        width: 100,
                        pinnedLeft: true,
                        enableCellEdit: $scope.visible,
                    },
                    {
                        field: 'conversion_rate',
                        displayName: 'Conversion Rate',
                        width: 100,
                        pinnedLeft: true,
                        enableCellEdit: $scope.visible,
                    }
                ],
                onRegisterApi: function onRegisterApi(registeredApi) {
                    $scope.gridApi = registeredApi;

                    $scope.gridApi.edit.on.afterCellEdit($scope, function (rowEntity, colDef, newValue, oldValue) {

                        if (colDef.name == 'selected_quantity') {
                            if (rowEntity.unit_price) {
                                rowEntity.total_price = parseInt(newValue) * parseInt(rowEntity.unit_price);
                            }
                        }
                        if (colDef.name == 'unit_price') {
                            if (rowEntity.selected_quantity) {
                                rowEntity.total_price = parseInt(newValue) * parseInt(rowEntity.selected_quantity);
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
                                rowEntity.vat = null;
                                rowEntity.igst = null;
                                if(newValue > 10){
                                    var name = colDef.field;
                                    rowEntity[name] = null;
                                    Notification.error({
                                        message: 'Please enter gst value less than 10',
                                        positionX: 'right',
                                        positionY: 'top'
                                    });
                                    return;
                                }
                                if(newValue <= 0){
                                    var name = colDef.field;
                                    rowEntity[name] = null;
                                    Notification.error({
                                        message: 'Please enter valid value',
                                        positionX: 'right',
                                        positionY: 'top'
                                    });
                                    return;
                                }
                            } 
                            if(colDef.field == 'vat'){
                                rowEntity.sgst = null;
                                rowEntity.cgst = null;
                                rowEntity.igst = null;
                                if(newValue > 10){
                                    var name = colDef.field;
                                    rowEntity[name] = null;
                                    Notification.error({
                                        message: 'Please enter vat value less than 10',
                                        positionX: 'right',
                                        positionY: 'top'
                                    });
                                }
                                if(newValue <= 0){
                                    var name = colDef.field;
                                    rowEntity[name] = null;
                                    Notification.error({
                                        message: 'Please enter valid value',
                                        positionX: 'right',
                                        positionY: 'top'
                                    });
                                    return;
                                }
                            } 
                            if(colDef.field == 'igst'){
                                rowEntity.sgst = null;
                                rowEntity.cgst = null;
                                rowEntity.vat = null;
                                if(newValue > 10){
                                    var name = colDef.field;
                                    rowEntity[name] = null;
                                    Notification.error({
                                        message: 'Please enter vat value less than 10',
                                        positionX: 'right',
                                        positionY: 'top'
                                    });
                                }
                                if(newValue <= 0){
                                    var name = colDef.field;
                                    rowEntity[name] = null;
                                    Notification.error({
                                        message: 'Please enter valid value',
                                        positionX: 'right',
                                        positionY: 'top'
                                    });
                                    return;
                                }
                            } 
                            rowEntity.state = true;
                            if($dialogScope.type == 'edit'){
                                editedItems.push(rowEntity);
                            }
                        }
                            
                    });
                }

            };

            function getRowId(row) {
                return row.id;
            }

            $scope.cancel = function () {
                if($scope.cancelDialog){
                    $mdDialog.hide({ order: $scope.order,savedItems: savedItems,group:$dialogScope.group,count:$scope.count});
                }else{
                   $mdDialog.cancel();
                }
            };

            $scope.rowClick = function(data){
                if(data.checked){
                    selectedItems.push(data);
                    selectedItems = _.uniqBy(selectedItems,'id');
                }else{
                    var index = null;
                    selectedItems.map(function(item,$index){
                      if(item.id == data.id){
                          index = $index;
                      }
                    });
                    selectedItems.splice(index,1);
                    selectedItems = _.uniqBy(selectedItems,'id');
                }
            };

            $scope.checkAll = function (value) {
                if (!value) {
                    $scope.items = $scope.items.map(function (item) {
                        item.checked = true;
                        return item;
                    });
                    selectedItems = $scope.items;
                    selectedItems = _.uniqBy(selectedItems,'id');
                } else {
                    $scope.items = $scope.items.map(function (item) {
                        item.checked = false;
                        return item;
                    });
                    selectedItems = [];
                    selectedItems = _.uniqBy(selectedItems,'id');
                }
            };

            $scope.update = function(){
                $scope.disableUpdate  = true;
                editedItems =[];
                $scope.items = $scope.items.map(function(item){
                    if(item.state || item.checked){
                        editedItems.push(item);
                    }
                    return item;
                });
                if(editedItems.length){
                    var error;
                editedItems.map(function (item) {
                    if (error) {
                        $scope.disableUpdate  = false;
                        return;
                    }
                    if (!item.unit_measure) {
                        Notification.error({
                            message: 'Please Enter Unit Measure',
                            positionX: 'right',
                            positionY: 'top'
                        });
                        error = true;
                        $scope.disableUpdate  = false;
                        return;
                    }
                    if (!item.unit_price) {
                        Notification.error({
                            message: 'Please Enter Unit Price',
                            positionX: 'right',
                            positionY: 'top'
                        });
                        error = true;
                        $scope.disableUpdate  = false;
                        return;
                    }
                    if (!item.selected_quantity) {
                        Notification.error({
                            message: 'Please Enter Selected Quantity',
                            positionX: 'right',
                            positionY: 'top'
                        });
                        error = true;
                        $scope.disableUpdate  = false;
                        return;
                    }
                    if (!item.delivery_date) {
                        Notification.error({
                            message: 'Please Enter Delivery date',
                            positionX: 'right',
                            positionY: 'top'
                        });
                        error = true;
                        $scope.disableUpdate  = false;
                        return;
                    }
                });
                if(!error){
                    updateItems(editedItems);
                } 
                }else{
                    $mdDialog.hide({ order: $scope.order,savedItems:$scope.uiGridOptions.data,count:$scope.count,editedItemsCount:$scope.items.length});
                }
            };

            function updateItems(result){
                var arr=[];
                if(result.length){
                    result.map(function(item){
                        POService.updatePOItems(item.id,item).then(function(resp){
                            arr.push(resp.data);
                            if(arr.length == result.length){
                                $scope.uiGridOptions.data.map(function(id){
                                   savedItems.push(id.id);
                                });
                                CalculateAmount();
                            }
                         },function(err){
                            $scope.disableUpdate  = false;
                         });
                    }); 
                }
            }

            $scope.save = function () {
                $scope.disableSave = true;
                var error;
                if (!selectedItems.length) {
                    Notification.error({
                        message: 'please select items to save',
                        positionX: 'right',
                        positionY: 'top'
                    });
                    $scope.disableSave = false;
                    return;
                }else{
                    selectedItems.map(function (item) {
                        if (error) {
                            $scope.disableSave = false;
                            return;
                        }
                        if (!item.unit_measure) {
                            Notification.error({
                                message: 'Please Enter Unit Measure',
                                positionX: 'right',
                                positionY: 'top'
                            });
                            error = true;
                            $scope.disableSave = false;
                            return;
                        }
                        if (!item.unit_price) {
                            Notification.error({
                                message: 'Please Enter Unit Price',
                                positionX: 'right',
                                positionY: 'top'
                            });
                            error = true;
                            $scope.disableSave = false;
                            return;
                        }
                        if (!item.selected_quantity) {
                            Notification.error({
                                message: 'Please Enter Selected Quantity',
                                positionX: 'right',
                                positionY: 'top'
                            });
                            error = true;
                            $scope.disableSave = false;
                            return;
                        }
                        if (!item.delivery_date) {
                            Notification.error({
                                message: 'Please Enter Delivery date',
                                positionX: 'right',
                                positionY: 'top'
                            });
                            error = true;
                            $scope.disableSave = false;
                            return;
                        }
                    });
                    if(!error){
                        saveItems(selectedItems);
                    }
                }
            };


            function saveItems(data){
              var result = filterItems(data);
              if(result.length){
                POService.postPOItems(result).then(function (res) {
                    var result = res.data;
                    result.map(function(item){
                        savedItems.push(item.id);
                    });
                    CalculateAmount();
                },function(error){
                    $scope.disableSave = false;
                });
               }
            }


            function filterItems(data){
                data = data.map(function(item){
                     var obj={};
                     obj.pr_item_number = item.item_number;
                     obj.title = item.title;
                     obj.description =item.description;
                     if(item.notes){
                         obj.notes = item.notes;
                     }
                     if(item.buyer_part_number){
                        obj.buyer_part_number = item.buyer_part_number;
                     }
                     if(item.supplier_part_number){
                        obj.supplier_part_number = item.supplier_part_number;
                     }
                     obj.available_quantity = item.quantity_remaining;
                     obj.unit_measure = item.unit_measure;
                     obj.unit_price = item.unit_price;
                     obj.total_price = item.total_price;
                     if(item.price_basis){
                        obj.price_basis = item.price_basis;
                     }
                     obj.delivery_date = item.delivery_date;
                     if(item.delivery_basis){
                        obj.delivery_basis = item.delivery_basis;
                     }
                     if(item.buyer_notes){
                         obj.buyer_notes = item.buyer_notes;
                     }
                     if(item.igst){
                        obj.igst = item.igst;
                     }else{
                        obj.igst = null;
                     }
                     if(item.cgst){
                        obj.cgst = item.cgst;
                     }else{
                        obj.cgst = null;
                     }
                     if(item.sgst){
                        obj.sgst = item.sgst;
                     }else{
                        obj.sgst = null;
                     }
                     if(item.vat){
                        obj.vat = item.vat;
                     }else{
                        obj.vat = null;
                     }
                     if(item.other_charges){
                         obj.other_charges = item.other_charges;
                     }
                     obj.po = $dialogScope.orderId;
                     obj.selected_quantity = item.selected_quantity;

                     if(item.pr_group){
                       obj.id = item.id;
                     }else{
                       obj.pr_group = item.group.id;
                     }

                     return obj;
                });

                return data;
            }

            function CalculateAmount() {
                var totalPrice;
                var obj = {};
                POService.getPOItems({ poId: $dialogScope.orderId }).then(function (res) {
                    var totalItems = res.data.results;
                    if($scope.delete){
                        var result=[];
                        $scope.items.map(function(item){
                           if(!item.checked){
                              result.push(item);   
                              savedItems.push(item.id);   
                           }
                        });
                        $scope.uiGridOptions.data = result;
                        savedItems.map(function(item){
                            totalItems.map(function(po){
                                if(item == po.id){
                                    _.replace($scope.uiGridOptions.data,{id:po.id},po);
                                }
                            });
                        });
                        $scope.uiGridOptions.data = $scope.uiGridOptions.data.map(function(item){
                            item.quantity_remaining = item.available_quantity;
                            item.displayId = ((item.item_number).split("-").pop()).split("_").pop()
                            item.checked = false;
                            return item;
                        });
                        $scope.items = $scope.uiGridOptions.data;
                    }
                    $scope.count = res.data.results.length;
                   
                    if(totalItems.length){
                        totalItems.map(function (item) {
                            totalPrice ? totalPrice = parseFloat(item.total_price) + parseFloat(totalPrice) : totalPrice = item.total_price;
                        });
                    }else{
                        var totalPrice = null;
                        $scope.items = [];
                        $scope.uiGridOptions.data = [];
                        savedItems = [];
                    }
                    obj.price_number = totalPrice;
                    obj.price_words = totalPrice ? inWords(totalPrice) : null;
                    UpdatePOAmount(obj);
                },function(err){
                    $scope.disableSave = false;
                    $scope.disableUpdate  = false;
                });
            }

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

            function UpdatePOAmount(data) {
                POService.update($dialogScope.orderId, data).then(function (info) {
                    $scope.order = info.data;
                    $scope.disableSave = false;
                    $scope.disableUpdate  = false;
                    if($scope.delete){
                        Notification.success({
                            message: 'Successfully deleted',
                            positionX: 'right',
                            positionY: 'top'
                        });
                        $scope.delete = false;
                        $scope.cancelDialog = true;
                    }else{
                        Notification.success({
                            message: 'Successfully saved',
                            positionX: 'right',
                            positionY: 'top'
                        });
                        if($dialogScope.type == 'add'){
                            $mdDialog.hide({ order: $scope.order,savedItems: savedItems,group:$dialogScope.group,count:$scope.count});
                        }
                        if($dialogScope.type == 'edit'){
                            $mdDialog.hide({ order: $scope.order,savedItems:savedItems,count:$scope.count});
                        }
                    }

                },function(err){
                    $scope.disableSave = false;
                    $scope.disableUpdate  = false;
                });
            }

            $scope.AddDetails = function(ev,type){
                var arr = [];
                $scope.items.map(function (item) {
                    if (item.checked) {
                        arr.push(item);
                    }
                });
                if (arr && arr.length) {
                    return $mdDialog.show({
                        controller: 'layout.standard.annexureDetails',
                        templateUrl: 'assets/js/modules/po/orders/annexure-details/annexure-details.html',
                        parent: angular.element(document.body),
                        targetEvent: ev,
                        multiple: true,
                        clickOutsideToClose: true,
                        locals: {
                            $dialogScope: {
                                type: type,
                            }
                        }
                    }).then(function (data) {
                        if (data) {
                                selectedItems = selectedItems.map(function (info) {
                                    if (data.sgst) {
                                        info.sgst = data.sgst;
                                        info.vat = null;
                                        info.igst = null;
                                    }
                                    if (data.cgst) {
                                        info.cgst = data.cgst;
                                        info.vat = null;
                                        info.igst = null;
                                    }
                                    if (data.igst) {
                                        info.igst = data.igst;
                                        info.vat = null;
                                        info.sgst = null;
                                        info.cgst = null;
                                    }
                                    if (data.vat) {
                                        info.vat = data.vat;
                                        info.sgst = null;
                                        info.cgst = null;
                                        info.igst = null;
                                    }
                                    if (data.selected_quantity) {
                                        info.selected_quantity = data.selected_quantity;
                                    }
                                    if (data.unitPrice) {
                                        info.unit_price = data.unitPrice;
                                    }
                                    if (data.deliveryDate) {
                                        info.delivery_date = dateService.convertDateToPython(data.deliveryDate);
                                    }
                                    if (info.selected_quantity && info.unit_price) {
                                        info.total_price = parseInt(info.selected_quantity) * parseInt(info.unit_price);
                                    }
                                    if (data.other_charges) {
                                        info.other_charges = data.other_charges;
                                    }
                                    if (data.secondary_units) {
                                        info.secondary_units = data.secondary_units;
                                    }
                                    if (data.conversion_rate) {
                                        info.conversion_rate = data.conversion_rate;
                                    }
                                    info.state = true;
                                    return info;
                                });
                                if($dialogScope.type == 'edit'){
                                   editedItems = selectedItems;
                                }
                        }
                    }, function (err) {

                    });
                } else {
                    Notification.error({
                        message: 'Please select items to add details',
                        positionX: 'right',
                        positionY: 'top'
                    });
                    error = true;
                    return;
                }

            };
                
            $scope.DeletePOItems = function(){
                $scope.delete = true;
                var checked =[];
                var arr=[];
                $scope.items.map(function (item) {
                    if (item.checked) {
                        checked.push(item);
                    }
                });
                if(checked.length){
                    checked.map(function (item) {
                        POService.deletePOItems(item.id).then(function (res) {
                            arr.push(res.data);
                            if (checked.length == arr.length) {
                                CalculateAmount();
                            }
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
                
            }

            $scope.AddToPO = function(){
                var data =[];
                $scope.items.map(function(item){
                    if(item.checked){
                        data.push(item);
                    }
                });
                if(data.length){
                    $scope.uiGridOptions.data = data;
                    $scope.items = data;
                    $scope.visible = true;
                    $scope.displaySave = true;
                }else{
                    Notification.error({
                        message: 'Please select atleast one item',
                        positionX: 'right',
                        positionY: 'top'
                    });
                    return;
                }
            };
}]);
})();