
(function () {
    var app = angular.module('app');
    app.controller('MR.ViewController', ['$scope', '$q', '$log', '$state', '$http', '$mdDialog', 'CityService', 'Notification', '$stateParams', 'StoreService', 'MRService', function ($scope, $q, $log, $state, $http, $mdDialog, CityService, Notification, $stateParams, StoreService, MRService) {
      
        MRService.getStatus().then(function(res){
            $scope.MRStatus = res.data.results;
        });

        $scope.itemsGridOptions = {
            enableCellEditOnFocus: true,
            enableColumnResizing: true,
            enableFiltering: true,
            enableGridMenu: true,
            showGridFooter: true,
            showColumnFooter: true,
            fastWatch: true,
            columnDefs:[
                {
                    name: 'inventory.id',
                    displayName: 'INV ID#',
                    width: 75,
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
                    width: 300,
                    pinnedLeft: true,
                    enableCellEdit: false,
                    enableSorting: true,
                },
                {
                    field: 'issued_quantity',
                    displayName: 'Quantity',
                    width: 125,
                    pinnedLeft: true,
                    enableCellEdit:true,
                },
                {
                    field: 'inventory.po_item.unit_measure',
                    displayName: 'Unit Of Measure',
                    width: 100,
                    pinnedLeft: true,
                    enableCellEdit: false,
                },
                {
                    field: 'issued_quantity',
                    displayName: '',
                    width: 100,
                    pinnedLeft: true,
                    enableCellEdit: false,
                    cellTemplate:'<i class="fa fa-eye font-s-20" ng-click="grid.appScope.showInventoryDetails(row)"></i>',
                }
            ]
        };

        MRService.getOne($stateParams.MRId).then(function (res) {
            $scope.MR = res.data;
        });

        MRService.getItems({mr:$stateParams.MRId}).then(function (res) {
            $scope.MRItems = res.data.results;
            $scope.itemsGridOptions.data = _.sortBy(res.data.results,'id');
        });

        $scope.ListPage = function () {
            $state.go("storeDashboard.materialRequisition.list");
        };

        $scope.showInventoryDetails = function(row){
           $state.go("storeDashboard.inventory.list",{inventoryId : row.entity.inventory});
        };

        $scope.editMR = function(data){
            $state.go("storeDashboard.materialRequisition.edit",{MRId : data.id});
        };

        $scope.save = function(data){
            var obj={};
            $scope.MRStatus.map(function(item){
               if(item.name == data){
                   obj.mr_status = item.id;
               }
            });
            obj.id = $stateParams.MRId;
            MRService.update(obj.id, obj).then(function (res) {
                var MRData = res.data;
                MRService.getOne($stateParams.MRId).then(function (res) {
                    $scope.MR = res.data;
                    if(res.data.mr_status.name == 'Returned'){
                      var obj = MRData;
                      obj.company = $scope.current_user.data.company.id;
                      obj.source_type = $scope.MR.destination_type.id;
                      obj.source_detail = $scope.MR.destination_detail;
                      obj.destination_type = $scope.MR.source_type.id;
                      obj.destination_detail = $scope.MR.source_detail;
                      MRService.post(obj).then(function (res) {
                        // $scope.MR = res.data;
                        Notification.success({
                            message: 'status changed',
                            positionX: 'right',
                            positionY: 'top'
                       });
                    },function(err){
                        $scope.disableSave = false;
                    });
                    }else{
                        Notification.success({
                            message: 'status changed',
                            positionX: 'right',
                            positionY: 'top'
                        });
                    }
                });
            });
        };

    }]);
})();