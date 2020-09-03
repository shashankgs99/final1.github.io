(function(){
    angular.module('app')
   .controller('view.offers',['$scope', '$window', '$modal', '$log','$state','Notification','MessageService','$http','$mdDialog','OfferService','dateService','$rootScope','$stateParams','EnquiryHistoryService',
   function($scope, $window, $modal, $log, $state, Notification, MessageService, $http, $mdDialog, OfferService, dateService, $rootScope,$stateParams,EnquiryHistoryService){
    
    function getUserData(){
        if($scope.current_user){
            return $scope.current_user.data;
        }
    } 
    $scope.showSupplier = false;
    $scope.showBuyer = false;
    $scope.showAdmin = false;

    if($state.current.name.includes("supplierDashboard")){
        $scope.showSupplier = true;
    }
    if($state.current.name.includes("buyerDashboard")){
        $scope.showBuyer = true;
    }
    if($state.current.name.includes("adminDashboard")){
        $scope.showAdmin = true;
    }
    $scope.type = $stateParams.type;
    function loadData(){
        if($stateParams.offerId){
            OfferService.getOne($stateParams.offerId).then(function (data) {
                $scope.offerData = data.data;
                if ($scope.offerData.description.length > 250) {
                    $scope.readMore = false;
                    $scope.showContent();
                } else {
                    $scope.myObj = {
                        'overflow-wrap': 'break-word',
                        'text-align': 'justify'
                    };
                }
            });
        }
    }
    loadData();

     $scope.back = function(){ 
         if($state.current.name.includes("adminDashboard")){
            $state.go("adminDashboard.offers.List");
        }else if($state.current.name.includes("supplierDashboard")){
            $state.go("supplierDashboard.offers.List");
        }else{
            $state.go("buyerDashboard.offers.List");
        }
         
     };

     $scope.editOffer = function(data){
        if($state.current.name.includes("adminDashboard")){
            $state.go("adminDashboard.offers.editOffer",{offerId:data.id});
        }else if($state.current.name.includes("supplierDashboard")){
            $state.go("supplierDashboard.offers.editOffer",{offerId:data.id});
        } 
     };

     $scope.showContent = function(){
         if ($scope.readMore) {
             $scope.readMore = !$scope.readMore;
             $scope.myObj = {};
             $scope.myObj = {
                 'overflow': 'visible',
                 'height': 'auto',
                 'overflow-wrap': 'break-word',
                 'text-align': 'justify'
             };
             return;
         }
         if (!$scope.readMore) {
             $scope.readMore = !$scope.readMore;
             $scope.myObj = {};
             $scope.myObj = {
                 'height': '101px',
                 'overflow-wrap': 'break-word',
                 'overflow': 'hidden',
                 'text-align': 'justify'
             };
             return;
         }  
     };
     $scope.sendOffer = sendOffer;
            
    //  function sendOffer(size,record,data,backdrop, closeOnClick) {
    //      var params = {
    //        templateUrl: "admin-send-offer.html",
    //        resolve: {
              
    //        },
    //        controller: function ($scope, $modalInstance) {
    //          $scope.userInfo = getUserData();
    //          $scope.offer = record;         
            
    //          $scope.ok = function () {
    //            $modalInstance.close();
    //          };
 
    //          $scope.cancel = function () {
    //            $modalInstance.dismiss('cancel');
    //          };
    //        }
    //      };
 
    //      if (angular.isDefined(closeOnClick)) {
    //        params.closeOnClick = closeOnClick;
    //      }
 
    //      if (angular.isDefined(size)) {
    //        params.size = size;
    //      }
         
    //      var modalInstance = $modal.open(params);
 
    //      modalInstance.result.then(function (selectedItem) {
    //        loadData();
    //      }, function () {
    //        $log.info('Modal dismissed at: ' + new Date());
    //      });
    //    }

    function sendOffer(size,record){
        $mdDialog.show({
            controller: 'admin-send-offer',
            templateUrl: 'assets/js/modules/manage-offers/admin-send-offer/admin-send-offer.html',
            parent: angular.element(document.body),
            targetEvent: event,
            clickOutsideToClose: true,
            locals: {
                $dialogScope: {
                    userInfo:getUserData(),
                    offer : record
                }
            }
        });
    }
   
}]);
})();