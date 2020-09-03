(function () {
    angular.module('app')
        .controller('layout.standard.PRListController', ['$scope', '$window', '$modal', '$log', '$state', 'Notification', 'POService', '$http', 's3Service', '$stateParams', '$mdDialog', '$q',
            function ($scope, $window, $modal, $log, $state, Notification, POService, $http, s3Service,  $stateParams, $mdDialog, $q) {
               
                loadPaymentRequestList({ page_size: 10, page: 1 });
                $scope.currentPage = 1;
                $scope.maxSize = 10;
                $scope.iminList =[];
                $scope.showLoader = true;
                function loadPaymentRequestList(data) {
                    if($scope.current_user.data && $scope.current_user.data.company){
                        data.company = $scope.current_user.data.company.id;
                        POService.getPaymentRequest(data).then(function(resp){
                            $scope.paymentList = resp.data.results;
                            $scope.showLoader = false;
                            $scope.paymentList = $scope.paymentList.map(function(item){
                                var total=0;
                                if(item.payment_request.length){
                                    item.payment_request.map(function(record){
                                        total ? total = Number(record.invoice_value) + total : total = Number(record.invoice_value);  
                                    });
                                }
                                item.total_price = total;
                                return item;
                            });
                        });
                    }
                }

                $scope.$on('PaymentRequestFilters',function(event,data){
                    if(data){
                        loadPaymentRequestList(data);
                    }
                });
    
                $scope.setPage = function (pageNo) {
                    $scope.showLoader = true;
                    $scope.currentPage = pageNo;
                    loadPaymentRequestList({ page_size: 10, page: pageNo });
                };
             
                $scope.ViewPR = function(data){
                    $state.go("buyerDashboard.paymentRequest.viewPR",{PRId:data.id});
                };

            }]);
})();
