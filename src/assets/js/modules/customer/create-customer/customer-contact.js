(function () {
    var app = angular.module('app');
    app.controller('customer.contacts', ['$scope', '$log', '$injector', '$http', '$mdDialog', '$dialogScope',
        function ($scope, $log, $injector, $http, $mdDialog, $dialogScope) {
            $scope.contact ={};
            if ($dialogScope.contactsData) {
                $scope.contact = $dialogScope.contactsData;
            }
            var Notification = $injector.get('Notification');
            $scope.customerContact = function (data) {
                if(!data.firstname){
                    Notification.error({
                        message: 'please enter firstname',
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