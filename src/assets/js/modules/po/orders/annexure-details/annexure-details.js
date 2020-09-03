(function () {
    var app = angular.module('app');
    app.controller('layout.standard.annexureDetails', ['$scope', '$window', '$mdDialog', '$log', '$state', 'Notification', 'PurchaseRequisitionService', '$http', 's3Service', 'dateService', 'OfferService','$rootScope','$timeout','$stateParams','MTOService','MTOOfferService','CompanyService','$filter','$dialogScope','TaxService',
        function ($scope, $window, $mdDialog, $log, $state, Notification, PurchaseRequisitionService, $http, s3Service, dateService, OfferService,$rootScope,$timeout,$stateParams,MTOService,MTOOfferService,CompanyService,$filter,$dialogScope,TaxService) {
           
            $scope.tax={
                taxList :[]
            };
  
            PurchaseRequisitionService.getUnits().then(function (res) {
                $scope.unitsList = res.data.results;
                $scope.unitsList = _.sortBy($scope.unitsList,'id');
            });

            $scope.type = $dialogScope.type;

            // $scope.taxTypeList =[{id:1,name:'GST'},{id:2,name:'Other Charges'},{id:3,name:'VAT'}];
            $scope.taxTypeList =[{id:1,name:'VAT'},{id:2,name:'Other Charges'},];

            $scope.checkTaxValue = function(data){
                if(data.property == "CGST" && data.sgst == 0){
                    if(data.sgst <= 0){
                        Notification.error({
                            message: 'please enter valid value',
                            positionX: 'right',
                            positionY: 'top'
                        });
                        data.sgst = undefined;
                        return;
                    }
                    
                }else{
                    if(data.value <= 0){
                        Notification.error({
                            message: 'please enter valid value',
                            positionX: 'right',
                            positionY: 'top'
                        });
                        data.value = undefined;
                        return;
                    }
                }
            };

            $scope.save = function(info){
                if($dialogScope.type == 'tax'){
                    var obj={};
                    var data = info.taxList;
                    data.map(function(item){
                       if(item && item.taxType){
                            if(item.taxType.name == 'GST'){
                                if(item.value){
                                obj.cgst = item.value;
                                }
                                if(item.sgst){
                                obj.sgst = item.sgst;
                                }
                            }
                            if(item.taxType.name == 'VAT'){
                                if(item.value){
                                    obj.vat = item.value;
                                }
                            }
                            if(item.taxType.name == 'Other Charges'){
                                if(item.value){
                                    obj.other_charges = item.value;
                                }
                            }
                       }
                    });
                    if($dialogScope.type == 'secondary-units'){
                        if(info.secondary_units){
                            obj.secondary_units = info.secondary_units;
                        }
                        if(info.conversion_rate){
                            obj.conversion_rate = info.conversion_rate;
                        }
                    }
                    $mdDialog.hide(obj);
                }else{
                    $mdDialog.hide(info);
                }
               
            };

            $scope.cancel = function(){
                $mdDialog.cancel();
            };

            if($scope.type == 'tax'){
                if(!$scope.tax.taxList.length){
                    $scope.tax.taxList.push({add:true});
                }
            }

            $scope.addTax = function(){
                $scope.tax.taxList.push({remove:true});
            };

            $scope.removetax = function(index){
                $scope.tax.taxList.splice(index,1);
            };
            
            $scope.checkTaxType = function (data, index) {
                var result = angular.copy($scope.tax.taxList);
                var info = $scope.tax.taxList[index];
                info.taxType.name == 'GST' ? info.property = 'CGST' : info.property = data.name;
                result.splice(index, 1);
                if (result.length >= 1) {
                    result.map(function (item) {
                        if(item.taxType){
                            if (item.taxType.name == data.name) {
                                Notification.error({
                                    message: 'tax type is already exisited in tax details',
                                    positionX: 'right',
                                    positionY: 'top'
                                });
                                info.taxType = null;
                                info.property = null;
                                info.value = null;
                            }
                        }
                    });
                }
                if(data && data.name == 'VAT'){
                    $scope.tax.taxList.map(function(res){
                       if(res && res.taxType && res.taxType.name == 'GST'){
                            Notification.error({
                                message: 'please enter GST or VAT,not both',
                                positionX: 'right',
                                positionY: 'top'
                            });
                            info.taxType = null;
                            info.property = null;
                            info.value = null;
                       }
                    });
                }
                if(data && data.name == 'GST'){
                    $scope.tax.taxList.map(function(res){
                       if(res && res.taxType && res.taxType.name == 'VAT'){
                            Notification.error({
                                message: 'please enter GST or VAT,not both',
                                positionX: 'right',
                                positionY: 'top'
                            });
                            info.taxType = null;
                            info.property = null;
                            info.value = null;
                       }
                    });
                }
            };
          
        }]);
})();