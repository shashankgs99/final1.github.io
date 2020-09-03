(function () {
    angular.module('app')
        .controller('layout.standard.grnListController', ['$scope', '$window', '$modal', '$log', '$state', 'Notification', 'POService', '$http', 's3Service', '$stateParams', '$mdDialog', '$q',
            function ($scope, $window, $modal, $log, $state, Notification, POService, $http, s3Service,  $stateParams, $mdDialog, $q) {
               
                loadGRNList({ page_size: 10, page: 1 });
                $scope.currentPage = 1;
                $scope.maxSize = 10;
                $scope.showLoader = true;
                function loadGRNList(data) {
                    if($scope.current_user.data && $scope.current_user.data.company){
                        data.company = $scope.current_user.data.company.id;
                        POService.getGRN(data).then(function (data) {
                            $scope.count = data.data.count;
                            $scope.showLoader = false;
                            $scope.grnList = data.data.results;
                        });
                    }
                }

                $scope.$on('GRNFilters',function(event,data){
                    if(data){
                        // data.page_size=10;
                        // data.page=1;
                        loadGRNList(data);
                    }
                });
    
                $scope.setPage = function (pageNo) {
                    $scope.showLoader = true;
                    $scope.currentPage = pageNo;
                    loadGRNList({ page_size: 10, page: pageNo });
                };
             
                $scope.ViewOrder = function(data){
                    $state.go("buyerDashboard.grn.viewGrn",{grnId:data.id});
                };
    


            }]);
})();