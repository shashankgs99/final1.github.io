(function () {
    var app = angular.module('app');
    app.controller('user.view', ['$scope', '$window', '$modal', '$log', '$state', 'Notification', 'UserService', '$http', 's3Service', 'dateService', '$rootScope', '$stateParams',
        function ($scope, $window, $modal, $log, $state, Notification, UserService, $http, s3Service, dateService, $rootScope, $stateParams) {
            if ($stateParams.userId) {
                UserService.getOne($stateParams.userId).then(function (data) {
                    $scope.userData = data.data;
                });
            }
            // $scope.userCompany =  viewCompany();
            $scope.cancel = function () {
                $state.go('adminDashboard.user.list');
            };

            $scope.viewUserProducts = function (data) {
                //navigate to products page and filter by owner
                $state.go("adminDashboard.inventory.list",{ownerProducts : data.id});
            };

            $scope.editUser = function (data) {
                $state.go('adminDashboard.user.editUser', { userId: data.id });
            };

            $scope.viewCompanyPage = function (data){
                if(data){
                    $state.go('adminDashboard.company.view', { supplierId: data.id });
                }
               
            };


        }]);
})();
