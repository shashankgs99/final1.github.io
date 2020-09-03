(function () {
    var app = angular.module('app');
    app.controller('user.list', ['$scope', '$window', '$modal', '$log', '$state', 'Notification', 'UserService', '$http', 's3Service', 'dateService', '$rootScope', '$stateParams',
        function ($scope, $window, $modal, $log, $state, Notification, UserService, $http, s3Service, dateService, $rootScope, $stateParams) {


            function getId() {
                return $scope.current_user.data.id;
            }


      $scope.editUser = function(table_changes){
        $scope.user = table_changes;
        if(table_changes.length === 0){
            Notification.error({
                message:'Please select atleast one item to edit',
                positionX:'right',
                positionY:'top'
            });
            return;
        }
        if(table_changes.length > 1){
            Notification.error({
                message:'Please select one item to edit',
                positionX:'right',
                positionY:'top'
            });
            return;
        }
        $state.go('adminDashboard.user.editUser', { userId: table_changes[0][4] });
        
        };

        $scope.viewUser = function (table_changes) {
            $scope.user = table_changes;
            if (table_changes.length === 0) {
                Notification.error({
                    message: 'Please select atleast one item to view',
                    positionX: 'right',
                    positionY: 'top'
                });
                return;
            }
            if (table_changes.length > 1) {
                Notification.error({
                    message: 'Please select one item to view',
                    positionX: 'right',
                    positionY: 'top'
                });
                return;
            }
            $state.go('adminDashboard.user.view', { userId: table_changes[0][4] });
        };

        

            $scope.addUser = function () {
                $state.go('adminDashboard.user.addNewUser');
            };

            // $scope.editUser = function (data) {
            //     $state.go('adminDashboard.user.editUser', { userId: data[0][4] });

            // };
            
            // $scope.viewUser = function (data) {
            //     $state.go('adminDashboard.user.view', { userId: data[0][4] });
            // };


            $scope.addMultipleUsers = function () {
                $state.go('adminDashboard.user.addMultipleUsers');
            };

            $scope.backTouserList = function(){
                $state.go('adminDashboard.user.list');
            };

        }]);
})();
