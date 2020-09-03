(function(){
    angular.module('app')
   .controller('layout.order.GRNItemsController',['$scope', '$window', '$modal', '$log','$state','Notification','$http','s3Service','POService','$dialogScope','dateService','$stateParams','$mdDialog','$q',
   function($scope, $window, $modal, $log, $state, Notification,$http, s3Service, POService, $dialogScope, dateService,$stateParams,$mdDialog,$q){

        $scope.showNext = false;
        $scope.showsave = false;
        $scope.checked = false;
        $scope.showEdit = false;
        $scope.disableSave = false;
        var filterItems=[];
        $scope.grn = $dialogScope.grn;
        
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
            importerDataAddCallback: function importerDataAddCallback(grid, newObjects) {
                $scope.myData = $scope.data.concat(newObjects);
            },
            onRegisterApi: function onRegisterApi(registeredApi) {
                $scope.gridApi = registeredApi;
            }
        };

        if($dialogScope.type == 'create'){
            $dialogScope.items.map(function(item){
                if(item.quantity_received){
                    item.quantity = item.selected_quantity - item.quantity_received;
                }else{
                    item.quantity = item.selected_quantity;
                }
                item.checked=false;
                item.displayId = (item.item_number.split("-").pop()).split("_").pop();
                filterItems.push(item);
            });
            $scope.showNext = true;
            $scope.items = filterItems;
            LoadPOColumns();
            $scope.uiGridOptions.data = _.sortBy(filterItems,'id');
        }

        if($dialogScope.type == 'edit'){
            $dialogScope.items.map(function(item){
                item.quantity = item.selected_quantity;
                item.checked=false;
                filterItems.push(item);
            });
            $scope.showEdit = true;
            $scope.items = filterItems;
            LoadGRNColumns();
            $scope.uiGridOptions.data = filterItems;
        }

        $scope.deleteData = function(){
           var data = $scope.uiGridOptions.data;
           var arr1 =[];
           var arr2 =[];
           data.map(function(item){
               if(item.checked){
                  arr1.push(item);
               }else{
                  arr2.push(item);
               }
           });
           if(arr1.length){
               $scope.uiGridOptions.data =[];
               $scope.uiGridOptions.data = arr2;
           }else{
                Notification.error({
                    message: 'please select items to delete',
                    positionX: 'right',
                    positionY: 'top'
                });
                return;
           }
        };
        
        $scope.selectAll = function(value){
           if(!value){
               $scope.items = $scope.items.map(function(item){
                  item.checked = true;
                  return item;
               });
           }else{
             $scope.items = $scope.items.map(function(item){
                item.checked = false;
                return item;
             });
           }
        };

        $scope.next = function(){
             var data =[];
             $scope.items.map(function(item){
                  if(item.checked){
                    data.push(item);
                  }
             }); 
             if(data.length){
                $scope.uiGridOptions.data = _.sortBy(data,'id');
                $scope.showNext = false;
                $scope.showsave = true;  
                $scope.gridApi.grid.refresh();
                LoadGRNColumns();
             }else{
                Notification.error({
                    message: 'please select items',
                    positionX: 'right',
                    positionY: 'top'
                });
                return;
             }
             
        };

        function LoadPOColumns(){
            $scope.uiGridOptions.columnDefs = [];
            $scope.uiGridOptions.columnDefs = [
                {
                    name: 'checked',
                    displayName: '',
                    cellTemplate: '<input type="checkbox" ng-model="row.entity.checked">',
                },
                {
                    name: 'displayId',
                    displayName: '#',
                    width: 75,
                    pinnedLeft: true,
                    enableCellEdit: false,
                    enableSorting: true,
                    visible:$scope.showNext
                },
                {
                    field: 'title',
                    displayName: 'Title',
                    width: 150,
                    pinnedLeft: true,
                    enableCellEdit: false,
                    enableSorting: true,
                    visible:$scope.showNext
                },
                {
                    field: 'description',
                    displayName: 'Description',
                    width: 200,
                    pinnedLeft: true,
                    enableCellEdit: false,
                    enableSorting: true,
                    visible:$scope.showNext
                },
                {
                    field: 'quantity',
                    displayName: 'Quantity',
                    width: 100,
                    pinnedLeft: true,
                    enableSorting: true,
                    enableCellEdit: false,
                    visible:$scope.showNext
                },
                {
                    field: 'unit_measure',
                    displayName: 'Unit Of Measure',
                    width: 100,
                    pinnedLeft: true,
                    enableCellEdit: false,
                    visible:$scope.showNext
                },
                {
                    field: 'unit_price',
                    displayName: 'Unit Price',
                    width: 100,
                    pinnedLeft: true,
                    enableCellEdit: false,
                    visible:$scope.showNext
                },
                {
                    field: 'vat',
                    displayName: 'VAT',
                    width: 65,
                    pinnedLeft: true,
                    enableCellEdit:false,
                    visible:$scope.showNext
                },
                {
                    field: 'total_price',
                    displayName: 'Total Price',
                    width: 150,
                    pinnedLeft: true,
                    enableCellEdit:false,
                    visible:$scope.showNext
                },
                {
                    field: 'delivery_date',
                    displayName: 'Delivery Date',
                    width: 150,
                    pinnedLeft: true,
                    enableCellEdit: false,
                    visible:$scope.showNext
                },
                // {
                //     field: 'cgst',
                //     displayName: 'CGST',
                //     width: 65,
                //     pinnedLeft: true,
                //     enableCellEdit: false,
                //     visible:$scope.showNext
                // },
                // {
                //     field: 'sgst',
                //     displayName: 'SGST',
                //     width: 65,
                //     pinnedLeft: true,
                //     enableCellEdit: false,
                //     visible:$scope.showNext
                // }, 
                {
                    field: 'other_charges',
                    displayName: 'Other Charges',
                    width: 70,
                    pinnedLeft: true,
                    enableCellEdit: false,
                    visible:$scope.showNext
                },
                {
                    field: 'deliver_basis',
                    displayName: 'Delivery Basis',
                    width: 125,
                    pinnedLeft: true,
                    enableCellEdit: false,
                    visible:$scope.showNext
                },
                {
                    field: 'delivery_date',
                    displayName: 'Delivery Date',
                    width: 150,
                    pinnedLeft: true,
                    enableCellEdit: false,
                    visible:$scope.showNext
                },
                {
                    field: 'batch',
                    displayName: 'Batch',
                    width: 65,
                    pinnedLeft: true,
                    enableCellEdit: true,
                    visible:$scope.showsave
                },
                {
                    field: 'serial',
                    displayName: 'Serial',
                    width: 65,
                    pinnedLeft: true,
                    enableCellEdit: true,
                    visible:$scope.showsave
                }, 
                {
                    field: 'production_date',
                    displayName: 'Production Date',
                    width: 70,
                    pinnedLeft: true,
                    enableCellEdit: true,
                    visible:$scope.showsave
                },
                {
                    field: 'expiry_date',
                    displayName: 'Expiry Date',
                    width: 125,
                    pinnedLeft: true,
                    enableCellEdit: true,
                    visible:$scope.showsave
                },
                {
                    field: 'delivery_date',
                    displayName: 'Delivery Date',
                    width: 70,
                    pinnedLeft: true,
                    enableCellEdit: true,
                    visible:$scope.showsave
                },
                {
                    field: 'yard_receipt_date',
                    displayName: 'Yard Receipt Date',
                    width: 125,
                    pinnedLeft: true,
                    enableCellEdit: true,
                    visible:$scope.showsave
                },
            ]
        }    

        function LoadGRNColumns(){
            $scope.uiGridOptions.columnDefs = [];
            $scope.uiGridOptions.columnDefs = [
                {
                    name: 'checked',
                    displayName: '',
                    cellTemplate: '<input type="checkbox" ng-model="row.entity.checked">',
                    width: 50,
                },
                {
                    name: 'displayId',
                    displayName: '#',
                    width: 75,
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
                    enableSorting: true,
                },
                {
                    field: 'description',
                    displayName: 'Description',
                    width: 200,
                    pinnedLeft: true,
                    enableCellEdit: false,
                    enableSorting: true,
                },
                {
                    field: 'quantity',
                    displayName: 'Quantity',
                    width: 100,
                    pinnedLeft: true,
                    enableSorting: true,
                    enableCellEdit: false,
                },
                {
                    field: 'received',
                    displayName: 'Received',
                    width: 100,
                    pinnedLeft: true,
                    enableSorting: true,
                    enableCellEdit: true,
                },
                {
                    field: 'manufacturer',
                    displayName: 'Manufacturer',
                    width: 100,
                    pinnedLeft: true,
                    enableSorting: true,
                    enableCellEdit: false,
                },
                {
                    field: 'unit_measure',
                    displayName: 'Unit Of Measure',
                    width: 100,
                    pinnedLeft: true,
                    enableCellEdit: false,
                },
                {
                    field: 'batch',
                    displayName: 'Batch',
                    width: 100,
                    pinnedLeft: true,
                    enableCellEdit: true,
                },
                {
                    field: 'serial',
                    displayName: 'Serial',
                    width: 100,
                    pinnedLeft: true,
                    enableCellEdit: true,
                }, 
                {
                    field: 'production_date',
                    displayName: 'Production Date',
                    width: 125,
                    pinnedLeft: true,
                    enableCellEdit: true,
                },
                {
                    field: 'expiry_date',
                    displayName: 'Expiry Date',
                    width: 100,
                    pinnedLeft: true,
                    enableCellEdit: true,
                },
                {
                    field: 'delivery_date',
                    displayName: 'Delivery Date',
                    width: 125,
                    pinnedLeft: true,
                    enableCellEdit: true,
                },
                {
                    field: 'yard_receipt_date',
                    displayName: 'Yard Receipt Date',
                    width: 125,
                    pinnedLeft: true,
                    enableCellEdit: true,
                }
            ]
        }

        $scope.save = function(){
            $scope.disableSave = true;
            var data = $scope.uiGridOptions.data;
            var error = false;
            data = data.map(function(item){
               if(error){
                   return;
               } 
               if(!item.received){
                    Notification.error({
                        message: 'please enter received quantity',
                        positionX: 'right',
                        positionY: 'top'
                    });
                    error = true;
                    $scope.disableSave = false;
                    return;
               }
               if(!item.yard_receipt_date){
                    Notification.error({
                        message: 'please enter yard receipt date',
                        positionX: 'right',
                        positionY: 'top'
                    });
                    error = true;
                    $scope.disableSave = false;
                    return;
               }
               item.grn = $dialogScope.grn.id;
               item.po_item = item.id;
               item.quantity_received = item.received;
               item.company = $dialogScope.company;
               return item;
            });
            if(!error){
                POService.postGRNItem(data).then(function(res){
                    $scope.disableSave = false;
                    Notification.success({
                        message: 'successfully saved',
                        positionX: 'right',
                        positionY: 'top'
                    });
                    $mdDialog.hide($scope.grn );
                },function(err){
                    $scope.disableSave = false;
                });
            }
        };

        $scope.cancel = function(){
           $mdDialog.cancel();
        };

        function getRowId(row) {
            return row.id;
        }
   
        $scope.updateDetails = function(ev){
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
                           display:'grn',
                           type:'create',
                           delivery_date : dateService.convertDateToJS($scope.grn.delivery_date),
                           yard_receipt_date : dateService.convertDateToJS($scope.grn.receipt_date)
                        }
                    }
                }).then(function(res){
                    $scope.uiGridOptions.data = $scope.uiGridOptions.data.map(function(item){
                       if(item.checked){
                           if(res && res.quantity_received){
                              item.received = res.quantity_received;
                           }
                           if(res && res.manufacturer){
                             item.manufacturer = res.manufacturer;
                           }
                           if(res &&res.batch){
                            item.batch = res.batch;
                           }
                           if(res &&res.serial){
                            item.serial = res.serial;
                           }
                           if(res &&res.production_date){
                            item.production_date = res.production_date;
                           }
                           if(res &&res.expiry_date){
                            item.expiry_date = res.expiry_date;
                           }
                           if(res &&res.delivery_date){
                            item.delivery_date = res.delivery_date;
                           }
                           if(res &&res.yard_receipt_date){
                            item.yard_receipt_date = res.yard_receipt_date;
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
}]).controller('layout.order.updateGRNItems', ['$scope', '$window', '$modal', 'MessageService', '$state', 'dateService', '$http', 'ProjectService', 'POService', '$dialogScope', '$stateParams', '$mdDialog', '$q',
    function ($scope, $window, $modal, MessageService, $state, dateService, $http, ProjectService, POService, $dialogScope, $stateParams, $mdDialog, $q) {
        
        $scope.display = $dialogScope.display;
        $scope.type = $dialogScope.type;
        $scope.data ={};

        if($dialogScope.delivery_date){
            $scope.data.delivery_date = $dialogScope.delivery_date;
        }

        if($dialogScope.yard_receipt_date){
            $scope.data.yard_receipt_date = $dialogScope.yard_receipt_date;
        }

        if($dialogScope.display == 'project'){
            ProjectService.getProjectStatus().then(function (item) {
                $scope.statusList = item.data.results;
            });
        } 

        if($dialogScope.display == 'supplierProject'){
            ProjectService.getProjectStatus().then(function (item) {
                $scope.projectStatus = item.data.results;
            });
        } 
        
        if($dialogScope.display == 'enquiry'){
            MessageService.getEnquiryStates().then(function (res) {
                $scope.statusList = res.data.results;
                $scope.statusList = _.sortBy($scope.statusList, 'id');
            });
        }
        $scope.cancel = function(){
           $mdDialog.cancel();
        };

        POService.getIMINStatus().then(function(res){
          $scope.status = res.data.results;
        });

        POService.getPaymentStatus().then(function(res){
            $scope.prStatus = res.data.results;
        });

        $scope.reverse = false;
        if($dialogScope.type == 'reverse'){
            $scope.reverse = true;
            $scope.title = "Quantity Reversed";
        }else{
            $scope.title = "Quantity Received";
        }

        $scope.viewPaymentReceipt = function(data,ev){
            $mdDialog.show({
                controller: 'layout.standard.paymentReceiptController',
                templateUrl: 'assets/js/modules/invoice/payment-receipt-details/payment-receipt-details.html',
                parent: angular.element(document.body),
                targetEvent: ev,
                multiple:true,
                clickOutsideToClose: true,
                locals:{
                    $dialogScope:{
                        customer : $dialogScope.customer,
                        order:$dialogScope.order,
                        company : $dialogScope.company,
                        invoiceStatus : false
                    }
                }
            });
        };


        $scope.save = function(data){
            if(data){
                if($dialogScope.type == 'reverse'){
                    data.quantity_received = -Math.abs(data.quantity_received);
                }
                if(data && data.imin_status){
                    data.imin_status = data.imin_status;
                }
                if(data && data.inspected_remarks){
                    data.inspected_remarks = data.inspected_remarks;
                }
                if(data && data.production_date){
                    data.production_date = dateService.convertDateToPython(data.production_date);
                }
                if(data && data.expiry_date){
                    data.expiry_date = dateService.convertDateToPython(data.expiry_date);
                }
                if(data && data.delivery_date){
                    data.delivery_date = dateService.convertDateToPython(data.delivery_date);
                }
                if(data && data.yard_receipt_date){
                    data.yard_receipt_date = dateService.convertDateToPython(data.yard_receipt_date);
                }
                if(data && data.payment_due_date){
                    data.payment_due_date = dateService.convertDateToPython(data.payment_due_date);
                }
                if(data && data.invoiced_quantity){
                    data.invoiced_quantity = data.invoiced_quantity;
                }
                if(data && data.invoice_item_quantity){
                    data.invoice_item_quantity = data.invoice_item_quantity;
                }
                if(data && data.invoice_item_remark){
                    data.invoice_item_remark = data.invoice_item_remark;
                }
                if(data && data.packing_dimenssion){
                    data.packing_dimenssion = data.packing_dimenssion;
                }
                if(data && data.packing_packing){
                    data.packing_packing = data.packing_packing;
                }
                if(data && data.packing_net_weight){
                    data.packing_net_weight = data.packing_net_weight;
                }
                if(data && data.packing_gross_weight){
                    data.packing_gross_weight = data.packing_gross_weight;
                }
                if(data && data.packing_remarks){
                    data.packing_remarks = data.packing_remarks;
                }
                $mdDialog.hide(data);
            }
        };
    }]);
})();