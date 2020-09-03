(function () {
  var app = angular.module('app');
  app.controller('layout.standard.purchaseRequisition', ['$scope', '$window', '$modal', '$log', '$state', 'Notification', 'UserService', '$http', 's3Service', 'dateService', '$rootScope', '$stateParams', 'PurchaseRequisitionService','PRGroupService','ProjectService','$mdDialog',
    function ($scope, $window, $modal, $log, $state, Notification, UserService, $http, s3Service, dateService, $rootScope, $stateParams, PurchaseRequisitionService,PRGroupService,ProjectService,$mdDialog) {

      $scope.projectNames = [];
      $scope.selectedPR = [];
      $scope.currentPage = 1;
      $scope.maxSize = 10;
      $scope.showLoader = true;

      $scope.selectedValue = function (data, index, value) {
        if (value) {
          $scope.selectedPR.push(data);
        } else {
          $scope.selectedPR.map(function (item, index) {
            if (item.id === data.id) {
              $scope.selectedPR.splice(index, 1);
              $scope.selectedPR.length - 1;
            }
          });
        }
      };

      $scope.viewPRItems = function (ev, data) {
        var items;
        PurchaseRequisitionService.get({ groupId: data.id }).then(function (resp) {
          items = resp.data.results;
          $mdDialog.show({
            controller: 'layout.standard.viewMTOData',
            templateUrl: 'assets/js/modules/manage-enquiry/view-mto-data.html',
            parent: angular.element(document.body),
            targetEvent: ev,
            clickOutsideToClose: true,
            locals: {
              $dialogScope: {
                items: items,
                disableSave: true,
                showmtoList: false,
                group_number : data.group_number,
                visible:false
              }
            }
          }).then(function (res) {
            if (res && res.delete) {
              $timeout(function () {
                $window.location.reload();
              }, 2250);
            }
          }, function () {
          });
        })
      };

      $scope.deletePR = function (purchase, $index) {
        $scope.showLoader = true;
        var results = [];
        var itemsList = [];
        purchase.map(function(item){
           PurchaseRequisitionService.get({ groupId: item.id }).then(function (data) {
              results.push(data.data.results);
              itemsList = itemsList.concat(data.data.results);
              if(results.length == purchase.length){
                deleteRecords(itemsList,purchase);
              }
           },function(err){
            $scope.showLoader = false;
           });
        });

       

        // var enquiry = false;
        // var res = [];
        // if (purchase.length === 0) {
        //  
        // }
        // if (purchase.length > 1) {
        //   Notification.error({
        //     message: 'Please select one item to edit',
        //     positionX: 'right',
        //     positionY: 'top'
        //   });
        //   return;
        // }
        // var groupId = purchase[0].id;
        
        // PurchaseRequisitionService.get({ groupId: purchase[0].id }).then(function (data) {
        //   var results = data.data.results;
        //   if (results.length) {
        //       results.forEach(function (item) {
        //         PurchaseRequisitionService.delete(item.id).then(function (data) {
        //           res.push(data.data);
        //           if (purchase.length == res.length) {
        //             PRGroupService.delete(groupId).then(function (res) {
        //               $scope.selectedPR=[];
        //               Notification.success({
        //                 message: 'Successfully deleted',
        //                 positionX: 'right',
        //                 positionY: 'top'
        //               });
        //               $scope.setPage($scope.currentPage);
        //             });
        //           }
        //         });
        //       });
        //   } else {
        //     

        //   }
        // });
      };

      function deleteRecords(data, total) {
        var deletedItems = [];
        data.map(function (rec) {
          PurchaseRequisitionService.delete(rec.id).then(function (resp) {
            deletedItems.push(resp.data);
            if (deletedItems.length == data.length) {
              $scope.showLoader = false;
              total.map(function (item) {
                PRGroupService.delete(item.id).then(function (res) {
                  $scope.selectedPR = [];
                  Notification.success({
                    message: 'Successfully deleted',
                    positionX: 'right',
                    positionY: 'top'
                  });
                  $scope.setPage($scope.currentPage);
                });
              });
            }
          });
        });
      }

      $scope.addPR = function () {
        if ($state.current.name.includes("adminDashboard")) {
          $state.go("adminDashboard.purchaseRequisition.add");
        } else {
          $state.go("buyerDashboard.purchaseRequisition.add");
        }
      };


      $scope.$on('PRData', function (event, data) {
        if (data) {
          loadPRList(data);
        }
      });

      $scope.setPage = function (pageNo) {
        $scope.currentPage = pageNo;
        loadPRList({ page_size: 10, page: pageNo });
      };

      function loadPRList(data) {
        PRGroupService.get(data).then(function (response) {
          $scope.count = response.data.count;
          $scope.showLoader = false;
          $scope.PRList = response.data.results;
          $scope.PRList = $scope.PRList.map(function (item) {
            if (item.attachment) {
              item.fileName = item.attachment.split("/").pop();
            }
            item.selected = false;
            return item;
          });
        });
      }
      loadPRList();

      $scope.EditPR = function(data){
        if (data.length === 0) {
          Notification.error({
            message: 'Please select atleast one item to edit',
            positionX: 'right',
            positionY: 'top'
          });
          return;
        }
        if (data.length > 1) {
          Notification.error({
            message: 'Please select one item to edit',
            positionX: 'right',
            positionY: 'top'
          });
          return;
        }
        if ($state.current.name.includes("adminDashboard")) {
          $state.go("adminDashboard.purchaseRequisition.edit",{PRId:data[0].id});
        } else {
          $state.go("buyerDashboard.purchaseRequisition.edit",{PRId:data[0].id});
        }
      };

    }]);
})();