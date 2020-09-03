(function () {
    angular.module('app')
        .controller('layout.standard.iminListController', ['$scope', '$window', '$modal', '$log', '$state', 'Notification', 'POService', '$http', 's3Service', '$stateParams', '$mdDialog', '$q',
            function ($scope, $window, $modal, $log, $state, Notification, POService, $http, s3Service,  $stateParams, $mdDialog, $q) {
               
                loadIMINList({ page_size: 10, page: 1 });
                $scope.currentPage = 1;
                $scope.maxSize = 10;
                $scope.iminList =[];
                $scope.showLoader = true;
                function loadIMINList(data) {
                    if($scope.current_user.data && $scope.current_user.data.company){
                        data.company = $scope.current_user.data.company.id;
                        POService.getGRN(data).then(function (data) {
                            $scope.count = data.data.count;
                            $scope.showLoader = false;
                            $scope.grnList = data.data.results;
                            $scope.grnList.map(function(item){
                               if(item.inspection_document_date && item.inspection_document_name && item.inspected_by){
                                   $scope.iminList.push(item);
                                   $scope.iminList = $scope.iminList.map(function(item){
                                    var verified=[];
                                    if(item.item_grn_id.length){
                                        item.item_grn_id.map(function(record){
                                            if(record.is_verified){
                                                verified.push(record);
                                            }
                                            record.po_item.displayID = (record.po_item.item_number.split("-").pop()).split("_").pop();
                                        });
                                    }
                                    item.verifed_records = verified.length;
                                    return item;
                                });
                               }
                            });
                        });
                    }
                }

                $scope.$on('IMINFilters',function(event,data){
                    if(data){
                        // data.page_size=10;
                        // data.page=1;
                        loadIMINList(data);
                    }
                });
    
                $scope.setPage = function (pageNo) {
                    $scope.showLoader = true;
                    $scope.currentPage = pageNo;
                    loadIMINList({ page_size: 10, page: pageNo });
                };
             
                $scope.ViewOrder = function(data){
                    $state.go("buyerDashboard.imin.viewIMIN",{iminId:data.id});
                };
    


            }]);
})();