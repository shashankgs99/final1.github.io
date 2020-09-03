(function () {
    var app = angular.module('app');
    app.controller('layout.standard.projectController', ['$scope', '$window', '$mdDialog', '$log','$state','Notification','DirectoryService','$rootScope','$stateParams','ProjectService',
    function ($scope, $window,$mdDialog, $log,  $state,Notification,DirectoryService,$rootScope,$stateParams,ProjectService) {
        //$scope.editOne = false;
        $scope.ownerId = $scope.current_user.data.id;
        $scope.params = {};
        $scope.currentPage = 1;
        $scope.maxSize = 10;
        $scope.showLoader = true;
        loadProjectData({ page_size: 10, page: 1 });
        $scope.currentPage = 1;
        $scope.maxSize = 10;
        $scope.selectedProject = [];
        $scope.supplierAccess = false;

        $scope.$on('projectFIlters',function(event,data){
            if(data){
                loadProjectData(data);
            }
        });

        if($state.current.name.includes("supplierDashboard")){
            $scope.supplierAccess = true;
        }
        
        $scope.setPage = function (pageNo) {
            $scope.currentPage = pageNo;
            loadProjectData({ page_size: 10, page: pageNo });
          };


         function loadProjectData(data){
            $scope.selectedProject = [];
            ProjectService.get(data).then(function(data){
                $scope.count = data.data.count;
                $scope.projectData = data.data.results;
                $scope.projectData = _.sortBy($scope.projectData,'created')
                $scope.showLoader = false;
            });
        }

         $scope.selectedValue = function (data, index, value) {
            if (value) {
              $scope.selectedProject.push(data);
            } else {
              $scope.selectedProject.map(function (item, index) {
                if (item.id === data.id) {
                  $scope.selectedProject.splice(index, 1);
                  $scope.selectedProject.length - 1;
                }
              });
            }
          };

        $scope.addProject = function(){
            if($state.current.name.includes("adminDashboard")){
                $state.go("adminDashboard.projects.create");
             }else{
                $state.go("supplierDashboard.projects.create");
             } 
        };
        
        if($stateParams.clientId){
            $scope.params = {};
            $stateParams.type == 1 ? $scope.params.customer_contractor = $stateParams.clientId : $scope.params.customer_client = $stateParams.clientId;
        }

        // $scope.editProject = function(table_changes){
        //     $scope.projectItem = table_changes;
        //     if(table_changes.length === 0){
        //         Notification.error({
        //             message:'Please select atleast one item to edit',
        //             positionX:'right',
        //             positionY:'top'
        //         });
        //         return;
        //     }
        //     if(table_changes.length > 1){
        //         Notification.error({
        //             message:'Please select one item to edit',
        //             positionX:'right',
        //             positionY:'top'
        //         });
        //         return;
        //     }
        //     if($state.current.name.includes("adminDashboard")){
        //        $state.go("adminDashboard.projects.edit",{projectId:table_changes[0][4]});
        //     }else{
        //        $state.go("supplierDashboard.projects.edit",{projectId:table_changes[0][4]});
        //     }
           
        // };

        $scope.editProject = function (data) {
            if (data.length > 1) {
                Notification.error({
                    message: 'please select one item',
                    positionX: 'right',
                    positionY: 'top'
                });
                return;
            }
            if (data.length < 1) {
                Notification.error({
                    message: 'please select atleast one item',
                    positionX: 'right',
                    positionY: 'top'
                });
                return;
            }
            if ($state.current.name.includes("adminDashboard")) {
                $state.go("adminDashboard.projects.edit", { projectId: data[0].id });
            } else {
                $state.go("supplierDashboard.projects.edit", { projectId: data[0].id });
            }
        };

        $scope.ViewProject = function(data){
            $state.go("supplierDashboard.projects.view", { projectId: data.id});
        }

        $scope.deleteProject = function(data){
            if (data.length < 1) {
                Notification.error({
                    message: 'please select atleast one item',
                    positionX: 'right',
                    positionY: 'top'
                });
                return;
            }
            var list =[];
            data.map(function(item){
                ProjectService.delete(data[0].id).then(function(res){
                    list.push(res.data);
                    if(list.length == data.length){
                        Notification.success({
                            message: 'Successfully deleted',
                            positionX: 'right',
                            positionY: 'top'
                          });
                          loadProjectData({ page_size: 10, page: 1 });
                          $scope.selectedProject =[];
                    }
                });
            });
        }

        $scope.cancelEdit = function(){
            if($state.current.name.includes("adminDashboard")){
                $state.go("adminDashboard.projects.list");
             }else{
                $state.go("supplierDashboard.projects.list");
             }   
        };

        function getCompanyId(){
            if($scope.current_user && $scope.current_user.data && $scope.current_user.data.company){
                return $scope.current_user.data.company.id;
            }else{
                return;
            }
        }

        function getUserData(){
            if($scope.current_user && $scope.current_user.data){
                return $scope.current_user.data;
            }
        }

        
        $scope.makeOffer = function(ev,record,data){   
            record = record[0];
            var companyId = getCompanyId();
            if(!companyId){
                Notification.error({
                    message: 'Register as supplier-admin to create offer',
                    positionX: 'right',
                    positionY: 'top'
                });
                return; 
            }
            if(record.length > 1){
                Notification.error({
                    message: 'please select one item',
                    positionX: 'right',
                    positionY: 'top'
                });
                return;
            }
            if(record.length <1){
                Notification.error({
                    message: 'please select atleast one item',
                    positionX: 'right',
                    positionY: 'top'
                });
                return;
            }
            $mdDialog.show({
                controller: 'manage.offerDialogController',
                templateUrl: 'assets/js/modules/manage-offers/offer-modal.html',
                parent: angular.element(document.body),
                targetEvent: ev,
                clickOutsideToClose: true,
                multiple:true,
                locals: {
                    $dialogScope: {
                        project : record.id,
                        supplier : companyId,
                        userData : $scope.current_user.data

                    }
                }
            }).then(function (res) {
                loadProjectData({ page_size: 10, page: 1 }); 
                $scope.selectedProject =[];
            }, function () {
            });

        };
      

    }]);
})();