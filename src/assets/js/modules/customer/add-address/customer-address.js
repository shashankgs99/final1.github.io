(function () {
    var app = angular.module('app');
    app.controller('customer.addresses', ['$scope', '$log', '$state', '$injector', '$mdDialog','$dialogScope',
        function ($scope, $log, $state, $injector, $mdDialog,$dialogScope) {
           
            $scope.contact = {};
            if ($dialogScope.addressInfo) {
                $scope.contact = $dialogScope.addressInfo;
            }
            
            var Notification = $injector.get('Notification');
            $scope.customerAddress = function (data) {
                if(!data.nameofaddress){
                    Notification.error({
                        message: 'please enter address name',
                        positionX: 'right',
                        positionY: 'top'
                    });
                    return;
                }
                if(!data.addressline1){
                    Notification.error({
                        message: 'please enter address line 1',
                        positionX: 'right',
                        positionY: 'top'
                    });
                    return;
                }
                if(!data.cityname){
                    Notification.error({
                        message: 'please enter cityname',
                        positionX: 'right',
                        positionY: 'top'
                    });
                    return;
                }
                if ($dialogScope.type == "Add") {
                    $mdDialog.hide(data);
                }
                if ($scope.contact && $dialogScope.type == "Modification") {
                    data.type = "Modification";
                    $mdDialog.hide(data);
                }
                if ($scope.contact && $dialogScope.type == "Edit") {
                    data.type = "Edit";
                    $mdDialog.hide(data);
                }
            };

            $scope.cancel = function () {
                $mdDialog.cancel();
            };

        }]);
})();