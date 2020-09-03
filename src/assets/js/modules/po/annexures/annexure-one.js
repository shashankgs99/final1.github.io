(function () {
    var app = angular.module('app');
    app.controller('annexure.one', ['$scope', '$window', '$log', '$state', '$http', '$mdDialog','$dialogScope','Notification','dateService',
        function ($scope, $log, $window, $state, $http, $mdDialog,$dialogScope,Notification,dateService) {

            $scope.cancel = function () {
                $scope.installmentData.entered = true;
                $mdDialog.hide($scope.installmentData);
            };
            $scope.installmentData = [];
            $scope.installmentTable = false;
            var deletedData=[];

            if($dialogScope.uploadedInfo && $dialogScope.uploadedInfo.length){
                $scope.installments = $dialogScope.uploadedInfo.length;
                $scope.installmentData = $dialogScope.uploadedInfo;
                $scope.installmentData = $scope.installmentData.map(function(item,$index){
                    if (item.expected_milestone_date && item.id) {
                        item.expected_milestone_date =  dateService.convertDateToJS(item.expected_milestone_date);
                    }
                    item.sno = $index+1;
                    return item;
                });
                $scope.installmentTable = true;
            }

            
            $scope.increaseRows = function(noOfRows){
                if(!noOfRows  || noOfRows <= 0){
                    Notification.error({
                        message: 'please enter number of installments',
                        positionX: 'right',
                        positionY: 'top'
                    }); 
                    return;
                }

                if($dialogScope.uploadedInfo && $dialogScope.uploadedInfo.length){
                    if(parseInt($scope.installments) > parseInt($scope.installmentData.length)){
                        var total =  noOfRows - $scope.installmentData.length;
                        var number = $scope.installmentData.length+1;
                        for(var i=0; i<total; i++){
                            $scope.installmentData.push({'sno':number});
                            number++;
                        }
                    }else{
                        var total =  $scope.installmentData.length - noOfRows;
                        var number = $scope.installmentData.length-1;
                        for(var i=0; i<total; i++){
                            var info=$scope.installmentData[number];
                            deletedData.push(info);
                            $scope.installmentData.splice(number,1);
                            number--;
                        }
                    }
                }else{
                    $scope.installmentTable = true;
                    $scope.installmentData = [];
                    for(var i=0; i<noOfRows; i++){
                        $scope.installmentData.push({'sno':i+1});
                    }
                }
            };     

            $scope.saveInstallments = function(data){
                $scope.installmentInfo = [];
                var formData = data;
                var totalPercentage = 0;
                if(formData.length){
                    formData.map(function(item){
                        totalPercentage += parseInt(item.percentage+"%");
                    });
                }

                if (totalPercentage === 100) {
                    var error=false;
                    data.map(function(item){
                       if(error){
                         return;
                       }
                       if(!item.credit){
                          Notification.error({
                            message:'please enter credit',
                            positionX: 'right',
                            positionY: 'top'
                          });
                          error = true;
                          return;
                       }
                       if(!item.type){
                        Notification.error({
                          message:'please select type',
                          positionX: 'right',
                          positionY: 'top'
                        });
                        error = true;
                        return;
                     }
                    });
                    if(formData.length && !error){
                        formData = formData.filter(function(record){
                            return record.percentage !== undefined && record.percentage !== null;
                        });

                        formData = formData.map(function(item,$index){
                            if(item.expected_milestone_date){
                                item.expected_milestone_date = dateService.convertDateToPython(item.expected_milestone_date);
                            }
                            var value = ($dialogScope.total/100)*parseInt(item.percentage);
                            item.value = value;
                            item.installment_number = $index+1;
                            return item;
                        });
                        if(deletedData.length){
                            formData.push({deleted:deletedData});
                        }
                        $mdDialog.hide(formData);
                    }
                } else {
                    Notification.error({
                      message:'Total percentage should be 100%',
                      positionX: 'right',
                      positionY: 'top'
                    });
                    return;
                }
                
            };

           



        }]);
})();