(function () {
    var app = angular.module('app');
    app.controller('buyers.MTO', ['$scope', '$window', '$modal', '$log', '$state', 'Notification', 'UserService', '$http', 's3Service', 'dateService', '$rootScope', '$stateParams','MTOGroupService','MTOService','ProjectService','$mdDialog','$timeout',
        function ($scope, $window, $modal, $log, $state, Notification, UserService, $http, s3Service, dateService, $rootScope, $stateParams,MTOGroupService,MTOService,ProjectService,$mdDialog,$timeout) {
          $scope.projectNames = [];
          $scope.selectedEnquiries =[];
          var allProjects=[];
          $scope.showLoader = true;
          $scope.currentPage = 1;
          $scope.maxSize = 10;

          $scope.$on('MTOData',function(event,MTO){
            if(MTO){
              // MTO.page_size=10;
              // MTO.page=1;
              $scope.showLoader = true;
              loadMTOList(MTO);
            }
          });
         
          $scope.setPage = function (pageNo) {
            $scope.currentPage = pageNo;
            loadMTOList({ page_size: 10, page: pageNo });
          };

          function loadMTOList(data){
             MTOGroupService.get(data).then(function (data) {
                $scope.count = data.data.count;
                $scope.mtoList = data.data.results;
                $scope.showLoader = false;
                $scope.mtoList = $scope.mtoList.map(function (item) {
                  if (item.project) {
                    ProjectService.getOne(item.project).then(function (data) {
                      item.projectName = data.data.name;
                    })
                  }
                  if (item.attachment) {
                    item.fileName = item.attachment.split("/").pop();
                  }
                  return item;
                });
              });
          }

          $scope.addMTO = function(){
            $state.go("buyerDashboard.MTO.add")
          };

          ProjectService.getMainProjects().then(function (data) {
            $scope.projectsInfo = data.data;
            $scope.projectsInfo.forEach(function (item) {
                $scope.projectNames.push({ id: item.id, label: item.name });
            });
            $scope.projectNames = _.uniqBy($scope.projectNames, 'id');
            MTOGroupService.get().then(function(data){
              $scope.count = data.data.count;
              $scope.mtoList = data.data.results;
              $scope.showLoader = false;
              $scope.mtoList = $scope.mtoList.map(function (item) {
                var date =  new Date (item.created);
                item.dateFormate = date.toLocaleDateString();
                if (item.project) {
                  ProjectService.getOne(item.project).then(function (data) {
                    item.projectName = data.data.name;
                  })
                }
                if (item.attachment) {
                   item.fileName = item.attachment.split("/").pop();
                }
                 return item;
              });
            });
          });
 
          $scope.selectedValue = function (data, index, value) {
            console.log(value);
            if (value) {
              $scope.selectedEnquiries.push(data);
            } else {
              $scope.selectedEnquiries.map(function (item, index) {
                if (item.id === data.id) {
                  $scope.selectedEnquiries.splice(index, 1);
                  $scope.selectedEnquiries.length - 1;
                }
              });
            }
          };

          $scope.viewMTOItems = function(ev,data){
            var items;
            var fileAccess = {
              save :true
            }
            MTOService.get({groupId:data.id}).then(function(data){
                items = data.data.results;
                return $mdDialog.show({
                    controller: 'layout.standard.viewMTOData',
                    templateUrl: 'assets/js/modules/manage-enquiry/view-mto-data.html',
                    parent: angular.element(document.body),
                    targetEvent: ev,
                    clickOutsideToClose: true,
                    locals: {
                        $dialogScope: {
                            items: items,
                            disableSave : true,
                            showmtoList : true,
                            visible:true
                        }
                    }
            });
            
            }).then(function (res) {
               if(res && res.delete){
                 $timeout(function() {
                  $window.location.reload();
                }, 2250);
               }
            }, function () {
            });
          };

          $scope.deleteMTO = function(data,$index){
            var enquiry = false;
            if (data.length === 0) {
              Notification.error({
                message: 'Please select atleast one item to Delete',
                positionX: 'right',
                positionY: 'top'
              });
              return;
            }
            if (data.length > 1) {
              Notification.error({
                message: 'Please select one item to Delete',
                positionX: 'right',
                positionY: 'top'
              });
              return;
            }
            var groupId =  data[0].id;
            MTOService.get({groupId:data[0].id}).then(function(data){
              var results = data.data.results;
              if(results.length){
                results.forEach(function(item){
                   if(item.enquiry){
                     enquiry = true;
                   }
                });
                if(!enquiry){
                  results.forEach(function(item){
                    MTOService.delete(item.id).then(function (data) {
                        console.log("deleted each record");
                    });
                    MTOGroupService.delete(groupId).then(function(res){
                      Notification.success({
                        message: 'Successfully deleted',
                        positionX: 'right',
                        positionY: 'top'
                      });
                      $scope.selectedEnquiries =[];
                      loadMTOList({ page_size: 10, page: 1 });
                      // $timeout(function() {
                      //   $window.location.reload();
                      // }, 3000);
                    });
                  });
                }else{
                  Notification.error({
                    message: 'Already part of an enquiry cannot delete',
                    positionX: 'right',
                    positionY: 'top'
                  });
                  return;
                }
              }else{
                MTOGroupService.delete(groupId).then(function(res){
                  Notification.success({
                    message: 'Successfully deleted',
                    positionX: 'right',
                    positionY: 'top'
                  });
                  $scope.selectedEnquiries =[];
                  loadMTOList({ page_size: 10, page: 1 });
                  // $timeout(function() {
                  //   $window.location.reload();
                  // }, 3000);
                }); 
               
              }
           });
         };
          

        }]);
})();