(function () {
    var app = angular.module('app');
    app.controller('layout.standard.MRListController', ['$scope', '$q', '$log', '$state', '$http', '$mdDialog', 'SalesOrderService', 'Notification','$stateParams','MRService','POService',
        function ($scope,$q,$log, $state, $http, $mdDialog,SalesOrderService, Notification,$stateParams,MRService,POService) {
            
            $scope.currentPage = 1;
            $scope.maxSize = 10;
            $scope.filter = {};
            $scope.selectedMR =[];
            LoadMRList({ page_size: 10, page: 1 });
            $scope.params ={};
            $scope.showLoader = true;
            $scope.AddMR = function(){
                $state.go('storeDashboard.materialRequisition.create');
            };

            if($scope.current_user && $scope.current_user.data){
                SalesOrderService.get({supplier_company_id:$scope.current_user.data.company.id}).then(function(res){
                    $scope.SOList = res.data.results;
                });
            }

            $scope.toHelp = function(){
                $state.go("layout.standard.help.stroes",{type:'material-requistion'});
            };

            MRService.getRequestType().then(function(result){
                $scope.requestType = result.data.results;
            });

            var selectionCellTemplate = '<div class="ngCellText ui-grid-cell-contents" ng-click="grid.appScope.rowClick(row)">' +
           '<div>{{COL_FIELD}}</div>' +
           '</div>';
            

            $scope.MRGridList = {
                enableFiltering: true,
                showColumnFooter: true,
                rowIdentity: function (row) {
                    return row.id;
                },
                columnDefs: [
                    {
                        name: 'id',
                        displayName: 'MR#',
                        width: 100,
                        pinnedLeft: true,
                        enableCellEdit: false,
                        enableSorting: true,
                        cellTemplate: selectionCellTemplate
                    },
                    {
                        name: 'created',
                        displayName: 'Date',
                        width: 100,
                        pinnedLeft: true,
                        enableCellEdit: false,
                        enableSorting: true,
                        cellTemplate: selectionCellTemplate
                    },
                    {
                        field: 'owner.fullName',
                        displayName: 'Requested By',
                        width: 150,
                        pinnedLeft: true,
                        enableCellEdit: false,
                        enableSorting: true,
                        cellTemplate: selectionCellTemplate
                    },
                    {
                        field: 'request_type.name',
                        displayName: 'Request Type',
                        width: 150,
                        pinnedLeft: true,
                        enableCellEdit: false,
                        enableSorting: true,
                        cellTemplate: selectionCellTemplate
                    },
                    {
                        field: 'purpose.name',
                        displayName: 'Purpose',
                        width: 200,
                        pinnedLeft: true,
                        enableCellEdit: false,
                        enableSorting: true,
                        cellTemplate: selectionCellTemplate
                    },
                    {
                        field: 'order_reference.so_number',
                        displayName: 'Order Reference',
                        width: 200,
                        pinnedLeft: true,
                        enableSorting: false,
                        enableCellEdit: false,
                        cellTemplate: selectionCellTemplate
                    },
                    {
                        field: 'destination_type.name',
                        displayName: 'Destination Type',
                        width: 150,
                        pinnedLeft: true,
                        enableCellEdit: false,
                        cellTemplate: selectionCellTemplate
                    }
                ]
              }; 

            $scope.EditMR = function(data){
                if (data.length > 1) {
                    Notification.error({
                        message: 'please select one item',
                        positionX: 'right',
                        positionY: 'top'
                    });
                    return;
                }
                if (data.length < 1) {
                    Notification.error({
                        message: 'please select atleast one item',
                        positionX: 'right',
                        positionY: 'top'
                    });
                    return;
                }
                if(data){
                   $state.go('storeDashboard.materialRequisition.edit',{MRId:data[0].id});
                }
            };

            $scope.rowClick = function (row) {       
               $state.go("storeDashboard.materialRequisition.view",{MRId:row.entity.id});
            };

            $scope.setPage = function (pageNo) {
                $scope.currentPage = pageNo;
                if(Object.keys($scope.params).length){
                    $scope.params.page_size = pageNo;
                    $scope.params.page = 1;
                    LoadMRList($scope.params);
                }else{
                    LoadMRList({ page_size: 10, page: pageNo });
                }
                
            };

            function LoadMRList(data){
                MRService.get(data).then(function(res){
                    $scope.count = res.data.count;
                    $scope.MRData = res.data.results;
                    $scope.MRGridList.data = [];
                    $scope.showLoader = false;
                    $scope.MRGridList.data = res.data.results;
                    $scope.MRGridList.data =  $scope.MRGridList.data.map(function(item){
                        item.owner.fullName = `${item.owner.first_name} ${item.owner.last_name}`;
                        return item;
                    });
                    $scope.MRGridList.data = _.sortBy($scope.MRGridList.data,'id');
                });
            }

            $scope.clearFilters = function(){
                $scope.filter = {};
                LoadMRList({ page_size: 10, page: 1 });
            };

            $scope.selectedValue = function (data, index, value) {
                if (value) {
                  $scope.selectedMR.push(data);
                }else{
                  $scope.selectedMR.map(function (item, index) {
                    if (item.id === data.id) {
                      $scope.selectedMR.splice(index, 1);
                      $scope.selectedMR.length - 1;
                    }
                  });
                }
            };

            // $scope.ViewMR = function(data){
            //     if(data){
            //         $state.go('supplierDashboard.stores.view',{storeId:data[0].id});
            //     }
            // };

            $scope.DeleteMR = function(data){
                if (data.length > 1) {
                    Notification.error({
                        message: 'please select one item',
                        positionX: 'right',
                        positionY: 'top'
                    });
                    return;
                }
                if (data.length < 1) {
                    Notification.error({
                        message: 'please select atleast one item',
                        positionX: 'right',
                        positionY: 'top'
                    });
                    return;
                }
                MRService.delete(data[0].id).then(function(res){
                    Notification.success({
                        message: 'successfully deleted',
                        positionX: 'right',
                        positionY: 'top'
                    }); 
                    LoadMRList({ page_size: 10, page: 1 });
                });
            }

            $scope.applyFilters = function(data){
                $scope.params ={};
                if(data.date_from){
                    var date = new Date(data.date_from);
                    var dateString = new Date(date.getTime() - (date.getTimezoneOffset() * 60000))
                        .toISOString();
                    var result = dateString.replace(/['"]+/g, '');
                    $scope.params.created__gte = result;
                }
                if(data.date_to){
                    var date = new Date(data.date_to);
                    var dateString = new Date(date.getTime() - (date.getTimezoneOffset() * 60000))
                        .toISOString()
                        // .split("T")[0];
                    var result = dateString.replace(/['"]+/g, '');
                    $scope.params.created__lte = result;
                }
                if(data.so_number){
                    $scope.params.order_reference__so_number = data.so_number;
                }
                if(data.request_type){
                    $scope.params.request_type__id = data.request_type;
                }
                if($scope.current_user && $scope.current_user.data.company){
                    $scope.params.company__id = $scope.current_user.data.company.id;
                }
                $scope.params.page_size = 10;
                $scope.params.page = 1;
                $scope.MRGridList.data =[];
                LoadMRList($scope.params);
            };

            
        }]);
})();