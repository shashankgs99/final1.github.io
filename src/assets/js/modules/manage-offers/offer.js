(function () {
    var app = angular.module('app');
    app.controller('admin.offers', ['$scope', '$window', '$modal', '$log','$state','Notification','MessageService','$http','s3Service','OfferService',
    function ($scope, $window, $modal, $log,  $state,Notification,MessageService,$http,s3Service,OfferService) {
        $scope.editOffer = function(table_changes){
            $scope.offerData = table_changes;
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
                    message:'Please select only one item to edit',
                    positionX:'right',
                    positionY:'top'
                });
                return;
            }
            $scope.editOne = true;
            $scope.show = {edit : false};  
        };

        $scope.viewOffer = function(data){
           $state.go("adminDashboard.offers.viewOffer",{offerId:data[0][4]});
        };
        $scope.cancelOffer = function(){
            $scope.editOne = false;
            $scope.show = {edit : true};   
        };
        
      
    }]);
})();