(function () {
    angular.module('app')
        .controller('ViewPaymentRequestController', ['$scope', '$window', '$modal', '$log', '$state', 'Notification', 'POService', '$http', 's3Service', '$stateParams', '$mdDialog', '$q',
            function ($scope, $window, $modal, $log, $state, Notification, POService, $http, s3Service, $stateParams, $mdDialog, $q) {

                POService.getOnePaymentRequest($stateParams.PRId).then(function (res) {
                    $scope.paymentData = res.data;
                });

                POService.getPaymentRequestItems({paymentRequest:$stateParams.PRId}).then(function(res){
                    $scope.grnGridOptions.data = res.data.results;
                    $scope.grnGridOptions.data = $scope.grnGridOptions.data.map(function(item,$index){
                         item.displayId = $index+1;
                         return item;
                    });
                });

                function getRowId(row) {
                    return row.id;
                }

                $scope.grnGridOptions = {
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
                LoadGRNColumns();

                function LoadGRNColumns(){
                    $scope.grnGridOptions.columnDefs = [
                        {
                            name: 'displayId',
                            displayName: '#',
                            width: 75,
                            pinnedLeft: true,
                            enableCellEdit: false,
                            enableSorting: false,
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
                        }
                    ]
                }

            }]);
})();
