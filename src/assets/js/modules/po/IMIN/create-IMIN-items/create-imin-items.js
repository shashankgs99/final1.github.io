(function(){
    angular.module('app')
   .controller('layout.order.IMINItemsController',['$scope', '$dialogScope', '$modal', '$log','$state','Notification','$http','UserService','POService','dateService','$rootScope','$stateParams','$mdDialog','$q',
   function($scope, $dialogScope, $modal, $log, $state, Notification,$http, UserService, POService, dateService, $rootScope,$stateParams,$mdDialog,$q){
     
       $scope.imin = $dialogScope.data;
       $scope.showsave = false;
       $scope.disableSave = false;
       $scope.showNext = true;
       POService.getGRNItems({grnId:$dialogScope.data.id}).then(function(result){
            $scope.iminGridOptions.data = result.data.results;
            $scope.iminGridOptions.data = $scope.iminGridOptions.data.map(function(item){
                item.checked=false;
                item.displayId = (item.po_item.item_number.split("-").pop()).split("_").pop();
                return item;
            });
       });
       $scope.iminGridOptions = {
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
       loadGRNColumns();
       
       function getRowId(row) {
         return row.id;
       }

       $scope.cancel = function(){
           $mdDialog.cancel();
       };

       $scope.selectAll = function(value){
        if(!value){
            $scope.iminGridOptions.data = $scope.iminGridOptions.data.map(function(item){
               item.checked = true;
               return item;
            });
        }else{
          $scope.iminGridOptions.data = $scope.iminGridOptions.data.map(function(item){
             item.checked = false;
             return item;
          });
        }
     };

       $scope.next = function(){
          var data = [];
          $scope.iminGridOptions.data.map(function(item){
            if(item.checked){
                data.push(item);
            }
          }); 
          $scope.iminGridOptions.data = data;
          $scope.showNext = false;
          $scope.showsave = true;
          loadGRNColumns();
       };

       $scope.removeItems = function(){
            var data = $scope.iminGridOptions.data;
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
                $scope.iminGridOptions.data =[];
                $scope.iminGridOptions.data = arr2;
            }else{
                Notification.error({
                    message: 'please select items to remove',
                    positionX: 'right',
                    positionY: 'top'
                });
                return;
            }
       };

       $scope.saveItems = function(){
           var arr =[];
           $scope.disableSave = true;
           var error = false;
           var data = $scope.iminGridOptions.data;
           data.map(function(item){
                if(error){
                    $scope.disableSave = false;
                    return;
                }
                if(!item.imin_status){
                    Notification.error({
                        message: 'please select status',
                        positionX: 'right',
                        positionY: 'top'
                    });
                    $scope.disableSave = false;
                    error = true;
                    return; 
                }
           });
           if(!error){
               data.map(function(record){
                    record.is_verified = true;
                    record.imin_status = record.imin_status.id;
                    Object.keys(record.grn).length ? record.grn = record.grn.id : record.grn = record.grn;
                    Object.keys(record.po_item).length ? record.po_item = record.po_item.id : record.po_item = record.po_item;
                    POService.updateGRNItem(record.id,record).then(function(res){
                        arr.push(res.data);
                        if(arr.length == data.length){
                            $scope.disableSave = false;
                            Notification.success({
                            message: 'successfully created',
                            positionX: 'right',
                            positionY: 'top'
                            });
                            $mdDialog.hide();
                        }
                    },function(){
                        $scope.disableSave = false;
                    });
               });
           }
       };

       $scope.updateDetails = function(ev){
        var data = [];
        $scope.iminGridOptions.data.map(function(item){
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
                       display:'imin',
                    }
                }
            }).then(function(res){
                $scope.iminGridOptions.data = $scope.iminGridOptions.data.map(function(item){
                   if(item.checked){
                       if(res && res.imin_status){
                          item.imin_status = res.imin_status;
                       }
                       if(res && res.inspected_remarks){
                         item.inspected_remarks = res.inspected_remarks;
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

       function loadGRNColumns(){
        $scope.iminGridOptions.columnDefs = [];
        $scope.iminGridOptions.columnDefs = [
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
                field: 'po_item.title',
                displayName: 'Title',
                width: 150,
                pinnedLeft: true,
                enableCellEdit: false,
                enableSorting: true,
            },
            {
                field: 'po_item.description',
                displayName: 'Description',
                width: 200,
                pinnedLeft: true,
                enableCellEdit: false,
                enableSorting: true,
            },
            {
                field: 'po_item.selected_quantity',
                displayName: 'Quantity',
                width: 100,
                pinnedLeft: true,
                enableSorting: true,
                enableCellEdit: false,
            },
            {
                field: 'quantity_received',
                displayName: 'Received',
                width: 100,
                pinnedLeft: true,
                enableSorting: true,
                enableCellEdit: false,
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
                field: 'po_item.unit_measure',
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
            },
            {
                field: 'imin_status.name',
                displayName: 'Status',
                width: 125,
                pinnedLeft: true,
                enableCellEdit: true,
            },
            {
                field: 'inspected_remarks',
                displayName: 'Remarks',
                width: 125,
                pinnedLeft: true,
                enableCellEdit: true,
            }
        ]
    }
    
}]);
})();