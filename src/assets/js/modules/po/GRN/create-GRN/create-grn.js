(function(){
    angular.module('app')
   .controller('layout.order.generateGRNController',['$scope', '$window', '$modal', '$log','$state','Notification','$http','dateService','POService','$dialogScope','$rootScope','$stateParams','$mdDialog','$q',
   function($scope, $window, $modal, $log, $state, Notification,$http, dateService, POService, $dialogScope, $rootScope,$stateParams,$mdDialog,$q){
  
    $scope.grn ={};
    $scope.grn.delivery_date = new Date();
    $scope.save = function(data){
       data.po = $dialogScope.orderId;
       if(!data.receipt_date){
          Notification.error({
            message: 'please select receipt date',
            positionX: 'right',
            positionY: 'top'
          });
          return;
       }
       if(data && data.document_date){
           data.document_date = dateService.convertDateToPython(data.document_date);
       }
       if(data &&data.delivery_date){
           data.delivery_date = dateService.convertDateToPython(data.delivery_date);
       }
       if(data &&data.receipt_date){
           data.receipt_date = dateService.convertDateToPython(data.receipt_date);
       }
       POService.postGRN(data).then(function(res){
          Notification.success({
            message: 'Successfully saved',
            positionX: 'right',
            positionY: 'top'
          });
          $scope.grn = res.data;
          $mdDialog.hide($scope.grn );
       });
    };
    
    $scope.cancel = function(){
       $mdDialog.cancel();
    };

}]);
})();