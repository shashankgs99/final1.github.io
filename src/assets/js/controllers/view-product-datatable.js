(function () {
    var app = angular.module('app');
    app.controller('viewProductDatatable', ['$scope', '$window', '$modal', '$log', '$state', 'Notification', 'UserService', '$http', 's3Service', 'dateService', '$rootScope', '$stateParams','$dialogScope','MTOService','MTOGroupService','$mdDialog','PurchaseRequisitionService','PRGroupService',
        function ($scope, $window, $modal, $log, $state, Notification, UserService, $http, s3Service, dateService, $rootScope, $stateParams,$dialogScope,MTOService,MTOGroupService,$mdDialog,PurchaseRequisitionService,PRGroupService) {

           $scope.data = $dialogScope.finalData;

           if($dialogScope.units && !$scope.accessInfo){
               $scope.data =  $scope.data.map(function(item){
                  item.unit_measure = $dialogScope.units;
                  return item;
               });
           }
        
           $scope.save = function(){  
               var final = [];
               var path = $dialogScope.path;
               s3Service.uploadFile(path, $dialogScope.csvfile, function (url) {
                   $dialogScope.groupData.attachment = url;
                   var actionFn = $state.current.name.includes("MTO") ? saveMTO : savePF;
                   actionFn();
                //    actionFn(final).then(function (res) {
                //     $mdDialog.hide({save:true});
                //});
               });   
           };

           $scope.accessInfo = $dialogScope.fileAccess.save;

           $scope.cancel= function(){
            $mdDialog.cancel();
           };

           $scope.tableHeadings = ["Title","Description","Category","Sub Category","Secondary sub category","Tertiary sub category","Material Of Construction"
         ,"Material of grade","Material specification","Dimension a","Unit a","Dimension b","Unit b","Dimension c","Unit c",
         "Total quantity","Unit of measure","Buyer Notes"];

            function saveMTO(data) {
                var final=[];
                MTOGroupService.post($dialogScope.groupData).then(function (res) {
                    $scope.data.map(function (mto) {
                        delete mto.$$hashKey;
                        if (Object.keys(mto).length) {
                            mto.project = $dialogScope.project;
                            mto.group = res.data.id;
                            final.push(mto);
                        }
                    });
                    MTOService.post(final).then(function (data) {
                        Notification.success({
                            message: 'Successfully Saved',
                            positionX: 'right',
                            positionY: 'top'
                        });
                        $mdDialog.hide({save:true});
                       // return data.data;
                    });
                });
                
            } 
            
            function savePF(data) {
                var final=[];
                PRGroupService.post($dialogScope.groupData).then(function (res) {
                    $scope.data.map(function (mto) {
                        delete mto.$$hashKey;
                        if (Object.keys(mto).length) {
                            mto.project = $dialogScope.project;
                            mto.group = res.data.id;
                            final.push(mto);
                        }
                    });
                    PurchaseRequisitionService.post(final).then(function (data) {
                        Notification.success({
                            message: 'Successfully Saved',
                            positionX: 'right',
                            positionY: 'top'
                        });
                        $mdDialog.hide({save:true});
                    });
                });
                
            } 


        }]); 
})();