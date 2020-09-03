(function () {
    angular.module('app')
        .controller('layout.standard.IMINController', ['$scope', '$window', '$log', '$state', 'Notification', '$http', 'dateService', '$stateParams', '$mdDialog', '$q','POService',
            function ($scope, $window, $log, $state, Notification, $http, dateService, $stateParams, $mdDialog, $q,POService) {
                $scope.showLoader = true;
                POService.getOneGRN($stateParams.iminId).then(function(res){
                     $scope.iminData = res.data;
                });
               
                POService.getGRNItems({grnId:$stateParams.iminId}).then(function(res){
                    $scope.iminItems = res.data.results;
                    $scope.iminGridOptions.data = res.data.results;
                    $scope.showLoader = false;
                    $scope.iminGridOptions.data = $scope.iminGridOptions.data.map(function(item,$index){
                        item.displayId =  (item.po_item.item_number.split("-").pop()).split("_").pop();
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
                    columnDefs : [
                        {
                            name: 'displayId',
                            displayName: '#',
                            width: 75,
                            pinnedLeft: true,
                            enableCellEdit: false,
                            enableSorting: false,
                        },
                        {
                            field: 'imin_status.name',
                            displayName: 'Status',
                            width: 125,
                            pinnedLeft: true,
                            enableCellEdit: true,
                        },
                        {
                            field: 'po_item.title',
                            displayName: 'Title',
                            width: 150,
                            pinnedLeft: true,
                            enableCellEdit: false,
                            enableSorting: false,
                        },
                        {
                            field: 'po_item.description',
                            displayName: 'Description',
                            width: 200,
                            pinnedLeft: true,
                            enableCellEdit: false,
                            enableSorting: false,
                        },
                        {
                            field: 'po_item.selected_quantity',
                            displayName: 'Quantity',
                            width: 100,
                            pinnedLeft: true,
                            enableSorting: true,
                            enableCellEdit: false,
                            visible:!$scope.reverseGrnData
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
                            field: 'reversed_quantity',
                            displayName: 'Quantity Reversed',
                            width: 100,
                            pinnedLeft: true,
                            enableSorting: true,
                            enableCellEdit: false,
                            visible:$scope.reverseGrnData
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
                            enableCellEdit: false,
                        },
                        {
                            field: 'serial',
                            displayName: 'Serial',
                            width: 100,
                            pinnedLeft: true,
                            enableCellEdit: false,
                        }, 
                        {
                            field: 'manufacturer',
                            displayName: 'Manufacturer',
                            width: 125,
                            pinnedLeft: true,
                            enableCellEdit: false,
                        },
                        {
                            field: 'production_date',
                            displayName: 'Production Date',
                            width: 125,
                            pinnedLeft: true,
                            enableCellEdit: false,
                        },
                        {
                            field: 'expiry_date',
                            displayName: 'Expiry Date',
                            width: 100,
                            pinnedLeft: true,
                            enableCellEdit: false,
                        },
                        {
                            field: 'delivery_date',
                            displayName: 'Delivery Date',
                            width: 125,
                            pinnedLeft: true,
                            enableCellEdit: false,
                        },
                        {
                            field: 'yard_receipt_date',
                            displayName: 'Yard Receipt Date',
                            width: 125,
                            pinnedLeft: true,
                            enableCellEdit: false,
                        },
                        {
                            field: 'inspected_remarks',
                            displayName: 'Remarks',
                            width: 125,
                            pinnedLeft: true,
                            enableCellEdit: false,
                            visible:$scope.showsave
                        }
                    ]
                };


                $scope.cancel = function(){
                    $state.go("buyerDashboard.imin.list");
                };

            }]);
})();