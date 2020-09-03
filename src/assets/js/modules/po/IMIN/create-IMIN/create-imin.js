(function(){
    angular.module('app')
   .controller('layout.order.generateIMINController',['$scope', 'dateService', '$modal', '$log','$state','Notification','$http','UserService','POService','$dialogScope','$rootScope','$stateParams','$mdDialog','$q',
   function($scope, dateService, $modal, $log, $state, Notification,$http, UserService, POService, $dialogScope, $rootScope,$stateParams,$mdDialog,$q){
     
    $scope.users =[];
    $scope.imin = $dialogScope.data;
    UserService.get({company:$dialogScope.companyId}).then(function(res){
         var usersList = res.data.results;
         usersList.map(function(item){
            var name = null;
            if(item.first_name){
                name = item.first_name;
            }
            if(item.last_name){
                name ? name = name+" "+item.last_name : name = item.last_name;
            }
            if(name){
                $scope.users.push({name: name,id:item.id});
            }
         });
    });

    $scope.save = function(record){
        var data = angular.copy(record);
        if(!data.inspection_document_name){
            Notification.error({
                message: 'please enter document name',
                positionX: 'right',
                positionY: 'top'
            });
            return;
        }
        if(!data.inspected_by){
            Notification.error({
                message: 'please select Inspected By',
                positionX: 'right',
                positionY: 'top'
            });
            return;
        }
        if(!data.inspection_document_date){
            Notification.error({
                message: 'please select document date',
                positionX: 'right',
                positionY: 'top'
            });
            return;
        }
        if(data.owner){
            delete data.owner;
        }
        data.inspection_document_date = dateService.convertDateToPython(data.inspection_document_date);
        data.inspected_by_user = data.inspected_by.id;
        data.inspected_by = data.inspected_by.name;
        Object.keys(data.po).length ? data.po = data.po.id : data.po = data.po;
        POService.updateGRN(data.id,data).then(function(res){
            Notification.success({
                message: 'successfully created',
                positionX: 'right',
                positionY: 'top'
            });
            $mdDialog.hide(res.data);
        });
    };

    $scope.cancel = function(){
        $mdDialog.cancel();
    };
   
}]);
})();