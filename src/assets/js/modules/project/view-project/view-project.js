(function () {
    angular.module('app')
        .controller('layout.ViewProjectController', ['$scope', '$window', '$modal', '$log', '$state', 'Notification', '$http', 's3Service',  'OfferService', '$rootScope', '$stateParams',  '$mdDialog', '$q','ProjectService', 
            function ($scope, $window, $modal, $log, $state, Notification, $http, s3Service, OfferService, $rootScope, $stateParams, $mdDialog, $q, ProjectService) {

                $scope.fullName = [];
                $scope.attachments = [];
                $scope.view = false;
               
                ProjectService.getOne($stateParams.projectId).then(function (data) {
                    $scope.project = data.data;
                    loadOffers();
                    if( $scope.project.customer_contacts.length){
                        $scope.project.customer_contacts = $scope.project.customer_contacts.map(function(item){
                            var name;
                            if(item.firstname){
                                name = item.firstname;
                            }
                            if(item.lastname){
                                name += item.lastname;
                            }
                            if(name){
                                item.fullName = name;
                            }
                            return item;
                        });
                    }
     
                });

                ProjectService.getProjectStatus().then(function(item){
                    $scope.projectStatus = item.data.results;
                });

                // $scope.updateStatus = function(data){
                //     $mdDialog.show({
                //         controller: 'layout.order.updateGRNItems',
                //         templateUrl: 'assets/js/modules/po/GRN/update-grn-details/update-grn-details.html',
                //         parent: angular.element(document.body),
                //         targetEvent: ev,
                //         multiple: true,
                //         clickOutsideToClose: true,
                //         locals: {
                //             $dialogScope: {
                //                 display: 'supplierProject',
                //             }
                //         }
                //     }).then(function(res){
                //         ProjectService.update(data.id,{project_status:data.project_status}).then(function (data){
                //             Notification.success({
                //                 message: 'status updated',
                //                 positionX: 'right',
                //                 positionY: 'top'
                //             });
                //             return; 
                //         });
                //     });
                // };

                $scope.viewOffers = function(){
                    var params={};
                    params.enquiry__project__name = $scope.project.name;
                    $rootScope.$broadcast("offersData", $scope.params);
                }

                function loadOffers(){
                    var params={};
                    params.enquiry__project__name = $scope.project.name;
                    OfferService.getOfferSent(params).then(function(data){
                         if(data.data.results && data.data.results.length){
                             $scope.view = true;
                         }
                    });
                }

                $scope.makeOffer = function(ev,record){   
                    if($scope.current_user && $scope.current_user.data && !$scope.current_user.data.company){
                        Notification.error({
                            message: 'Register as supplier-admin to create offer',
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
                                supplier : $scope.current_user.data.company.id,
                                userData : $scope.current_user.data
                            }
                        }
                    }).then(function (res) {
                        loadOffers();
                    }, function () {
                    });
        
                }

                $scope.BackToList = function(){
                    $state.go('supplierDashboard.projects.list');
                }

                $scope.EditProject = function(data){
                    $state.go('supplierDashboard.projects.edit',{projectId:data.id});
                }
         



            }]);
})();