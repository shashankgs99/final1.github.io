(function () {
    var app = angular.module('app');
    app.controller('layout.standard.viewPaymentRequestItems', ['$scope', '$window', '$mdDialog', '$log', '$state', 'Notification', 'MessageService', '$http', 's3Service', 'dateService', 'OfferService', '$rootScope', '$timeout', '$stateParams', 'MTOService', 'MTOOfferService', '$dialogScope', 'POService', '$filter','uiGridConstants',
        function ($scope, $window, $mdDialog, $log, $state, Notification, MessageService, $http, s3Service, dateService, OfferService, $rootScope, $timeout, $stateParams, MTOService, MTOOfferService, $dialogScope, POService, $filter,uiGridConstants){
           
        $scope.prGridOptions = {
            data : $dialogScope.data,
            enableCellEditOnFocus: true,
            enableColumnResizing: true,
            enableFiltering: true,
            enableGridMenu: true,
            showGridFooter: true,
            showColumnFooter: true,
            fastWatch: true,
            importerDataAddCallback: function importerDataAddCallback(grid, newObjects) {
                $scope.myData = $scope.data.concat(newObjects);
            },
            onRegisterApi: function onRegisterApi(registeredApi) {
                $scope.gridApi = registeredApi;
            }
        };   
        $scope.type = $dialogScope.type;
        if($dialogScope.type == "payment-request"){
            if($state.current.name.includes("buyerDashboard")){
                $scope.prGridOptions.data = $scope.prGridOptions.data.map(function(item){
                    item.displayId =  (item.po_item.item_number.split("-").pop()).split("_").pop();
                     return item;
                });
                loadPRColumns();
            }else{
                $scope.prGridOptions.data = $scope.prGridOptions.data.map(function(item){
                    item.total_value = item.quantity*item.so_item.unit_price;
                    if(item.so_item.installment_item_details && item.so_item.installment_item_details.length){
                        item.so_item.installment_item_details.map(function (ins) {
                                var installment = _.find($dialogScope.SOInstallments, { id:ins.installment });
                                var expectedDate = dateService.convertDateToJS(installment.expected_milestone_date);
                                var result = expectedDate.addDays(installment.credit);
                                item.payment_date = dateService.convertDateToPython(result);
                        });
                    }
                    item.displayId =  (item.so_item.item_number.split("-").pop()).split("_").pop();
                    return item;
                });
                loadSOColumns()
            }
           
        }else{
            loadPaymentDetails();
        }
        $scope.order = $dialogScope.order;

        $scope.cancel = function(){
              $mdDialog.cancel();
        };

       
        function loadPaymentDetails(){
            $scope.prGridOptions.columnDefs = [];
            $scope.prGridOptions.columnDefs =[
                {
                    name: 's_no',
                    displayName: '#',
                    width: 75,
                    type:'number',
                    pinnedLeft: true,
                    enableCellEdit: false
                },
                {
                    field: 'type',
                    displayName: 'Type',
                    width: 200,
                    pinnedLeft: true,
                    enableCellEdit: false,
                    enableSorting: true,
                },
                {
                    field: 'title',
                    displayName: 'Title',
                    width: 200,
                    pinnedLeft: true,
                    enableCellEdit: false,
                    enableSorting: true,
                },
                {
                    field: 'payment_date',
                    displayName: 'Date',
                    width: 125,
                    pinnedLeft: true,
                    enableCellEdit: false,
                },
                {
                    field: 'value',
                    displayName: 'Value',
                    width: 150,
                    pinnedLeft: true,
                    enableCellEdit: false,
                    enableSorting: true,
                },
                {
                    field: 'currency',
                    displayName: 'Currency',
                    width: 200,
                    pinnedLeft: true,
                    enableCellEdit: false,
                    enableSorting: true,
                }
            ]
        }

        function loadPRColumns(){
            $scope.prGridOptions.columnDefs = [];
            $scope.prGridOptions.columnDefs = [
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
                        field: 'po_item.unit_measure',
                        displayName: 'Unit Of Measure',
                        width: 100,
                        pinnedLeft: true,
                        enableCellEdit: false,
                    },
                    {
                        field: 'po_item.unit_price',
                        displayName: 'Item Value',
                        width: 80,
                        pinnedLeft: true,
                        enableCellEdit:false,
                    },
                    {
                        field: 'invoiced_quantity',
                        displayName: 'Item Value(Invoiced)',
                        width: 150,
                        pinnedLeft: true,
                        enableCellEdit:false,
                    },
                    {
                        field: 'invoice_value',
                        displayName: 'Invoice Value',
                        width: 200,
                        aggregationType: uiGridConstants.aggregationTypes.sum,
                        pinnedLeft: true,
                        enableCellEdit:false,
                    },
                    {
                        field: 'payment_status.name',
                        displayName: 'Payment Status',
                        width: 150,
                        pinnedLeft: true,
                        enableCellEdit:false,
                    },
                    {
                        field: 'payment_due_date',
                        displayName: 'Payment Due Date',
                        width: 150,
                        pinnedLeft: true,
                        enableCellEdit: false,
                    }
                   
                ]
        }

        function loadSOColumns(){
            $scope.prGridOptions.columnDefs = [];
            $scope.prGridOptions.columnDefs = [
                    {
                        name: 'displayId',
                        displayName: '#',
                        width: 75,
                        pinnedLeft: true,
                        enableCellEdit: false,
                        enableSorting: true,
                    },
                    {
                        field: 'so_item.title',
                        displayName: 'Title',
                        width: 150,
                        pinnedLeft: true,
                        enableCellEdit: false,
                        enableSorting: true,
                    },
                    {
                        field: 'so_item.description',
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
                        field: 'so_item.unit_measure',
                        displayName: 'Unit Of Measure',
                        width: 100,
                        pinnedLeft: true,
                        enableCellEdit: false,
                    },
                    {
                        field: 'total_value',
                        displayName: 'Item Value',
                        width: 80,
                        pinnedLeft: true,
                        enableCellEdit:false,
                    },
                    // {
                    //     field: 'invoiced_quantity',
                    //     displayName: 'Item Value(Invoiced)',
                    //     width: 150,
                    //     pinnedLeft: true,
                    //     enableCellEdit:false,
                    // },
                    // {
                    //     field: 'invoice_value',
                    //     displayName: 'Invoice Value',
                    //     width: 200,
                    //     aggregationType: uiGridConstants.aggregationTypes.sum,
                    //     pinnedLeft: true,
                    //     enableCellEdit:false,
                    // },
                    {
                        field: 'payment_status.name',
                        displayName: 'Payment Status',
                        width: 150,
                        pinnedLeft: true,
                        enableCellEdit:false,
                    },
                    {
                        field: 'payment_date',
                        displayName: 'Payment Due Date',
                        width: 150,
                        pinnedLeft: true,
                        enableCellEdit: false,
                    }
                   
                ]
        }
}]);
})();