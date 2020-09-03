(function () {
    var app = angular.module('app');
    app.controller('layout.standard.addPR', ['$scope', '$window', '$modal', '$log', '$state', 'Notification', 'ProjectService', '$http', 's3Service', 'dateService', '$rootScope', '$stateParams','$mdDialog','CsvService','PurchaseRequisitionService','PRGroupService',
        function ($scope, $window, $modal, $log, $state, Notification, ProjectService, $http, s3Service, dateService, $rootScope, $stateParams,$mdDialog,CsvService,PurchaseRequisitionService,PRGroupService) {

            $scope.PR = {};
            var currentData = [];
            $scope.fileList = [];
            $scope.projectNames = [];
            $scope.uploadedFilesList = [];
            $scope.disableFile = false;
            $scope.disableImport = false;
            var fileName;
            ProjectService.getMainProjects().then(function (data) {
                $scope.projectsInfo = data.data;
                $scope.projectsInfo.forEach(function (item) {
                    $scope.projectNames.push({ id: item.id, label: item.name });
                });
                $scope.projectNames = _.uniqBy($scope.projectNames, 'id');
                if($scope.PR && $scope.PR.project && $stateParams.PRId){
                    $scope.projectNames.map(function(item){
                      if(item.id == $scope.PR.project){
                        $scope.PR.project = item.id;
                      }
                    });
                    if($scope.PR.subproject){
                        $scope.subProjectFilter($scope.PR.project,$scope.PR.subproject);
                    } 
                }
            });

            PurchaseRequisitionService.getUnits().then(function(res){
                  $scope.unitsList = res.data.results;
                  $scope.unitsList = _.sortBy($scope.unitsList,'id');
            });

            $scope.getFileName = function(){
                var file = document.getElementById("PR-file");
                fileName = file.value.split("\\").pop();
            };

            $scope.importData = function(csvfile){
                currentData =[];
                if (fileName) {
                    $scope.data = CsvService.csvParser(csvfile, "MessageService");
                    $scope.data = $scope.data.filter(function(item){ return item.title !== null && item.title !== undefined;});
                    currentData.push($scope.data);
                    $scope.fileList.push($scope.data);
                    $scope.uploadedFilesList.push({
                        fileName: fileName
                    });
                    Notification.success({
                        message: 'Successfully imported file',
                        positionX: 'right',
                        positionY: 'top'
                    });
                    document.getElementById("PR-file").value = null;
                    $scope.disableFile = true;
                    $scope.disableImport = true;

                } else {
                    Notification.error({
                        message: 'please select file to import',
                        positionX: 'right',
                        positionY: 'top'
                    });
                    return;
                }
            };

            if($stateParams.PRId){
                $scope.showLoader = true;
                PRGroupService.getOne($stateParams.PRId).then(function (response) {
                    $scope.showLoader = false;
                    $scope.disableProject =  true;
                    $scope.PR = response.data;
                    if($scope.PR.project){
                        if($scope.PR.project.parent_project){
                            $scope.PR.subproject = $scope.PR.project.id;
                            $scope.PR.project = $scope.PR.project.parent_project.id;
                        }else{
                            $scope.PR.project = $scope.PR.project.id;
                        }
                    }
                    if($scope.PR.description){
                        $scope.PR.notes = $scope.PR.description;
                    }
                    if($scope.PR.attachment) {
                        $scope.PR.fileName = $scope.PR.attachment.split("/").pop();
                    }

                });
            }

            $scope.save = function(data,$index){

                var arr = [];
                if (!data.project) {
                    Notification.error({
                        message: 'please select project',
                        positionX: 'right',
                        positionY: 'top'
                    });
                    return;
                }
                if (!data.units) {
                    Notification.error({
                        message: 'please select unit',
                        positionX: 'right',
                        positionY: 'top'
                    });
                    return;
                }
                var path = 'user/' + $scope.current_user.data.id + '/PR';
                s3Service.uploadFile(path, $scope.csvfile, function (url) {
                    if($stateParams.PRId){
                        delete $scope.PR.created;
                        delete $scope.PR.owner;
                        $scope.PR.description = $scope.PR.notes;
                        PRGroupService.update($scope.PR.id,$scope.PR).then(function (result) {
                            if(currentData.length){
                                currentData.map(function (PR) {
                                    PR.map(function (item) {
                                        if (Object.keys(item).length) {
                                            item.unit_measure = data.units;
                                            item.project = $scope.PR.subproject ? $scope.PR.subproject : $scope.PR.project;
                                            item.buyer_notes = data.notes;
                                            item.group = $scope.PR.id;
                                            arr.push(item)
                                        }
                                    });
                                });
                                SavePR(arr,$index);
                            }
                        });
                    }else{
                        var group = {};
                        group.project = data.subproject ? data.subproject : data.project;
                        group.description = data.notes;
                        group.attachment = url;
                        PRGroupService.post(group).then(function (result) {
                            if(currentData.length){
                                currentData.map(function (PR) {
                                    PR.map(function (item) {
                                        if (Object.keys(item).length) {
                                            item.unit_measure = data.units;
                                            item.project = data.subproject ? data.subproject : data.project;
                                            item.buyer_notes = data.notes;
                                            item.group = result.data.id;
                                            arr.push(item)
                                        }
                                    });
                                });
                                SavePR(arr,$index);
                            }
                        });
                    }
            
                }); 
            }

            function SavePR(arr,$index){
                PurchaseRequisitionService.post(arr).then(function(data){
                    var uploadedId = [];
                    var res = data.data;
                    res.map(function (item) {
                        uploadedId.push(item.id);
                    });
                    Notification.success({
                        message: 'Successfully Saved',
                        positionX: 'right',
                        positionY: 'top'
                    });
                    if(!$stateParams.PRId){
                        $scope.uploadedFilesList.map(function (item, index) {
                            if ($index == index) {
                                item.save = true;
                                item.recordId = uploadedId;
                            }
                        });
                        $scope.disabledData = false;
                        $scope.disableImport = false;
                    }
                });
            }


            $scope.ViewInfo = function(ev, $index){
                var final = [];
                if (!$scope.PR.project) {
                    Notification.error({
                        message: 'please select project',
                        positionX: 'right',
                        positionY: 'top'
                    });
                    return;
                }
                if (!$scope.PR.units) {
                    Notification.error({
                        message: 'please select units',
                        positionX: 'right',
                        positionY: 'top'
                    });
                    return;
                }
                var final = [];
                var info = $scope.fileList[$index];
                var fileAccess = $scope.uploadedFilesList[$index];
                if(fileAccess && fileAccess.save){
                    fileAccess.save = true;
                    final = info;
                }else{
                    var project = $scope.PR.subproject ? $scope.PR.subproject : $scope.PR.project;
                    var path = 'user/' + $scope.current_user.data.id + '/PR';
                    final = info;
                    var group = {};
                    group.project = project;
                } 

                $mdDialog.show({
                    controller: 'viewProductDatatable',
                    templateUrl: 'assets/partials/dashboard/buyer/view-product-datatable.html',
                    parent: angular.element(document.body),
                    targetEvent: ev,
                    clickOutsideToClose: false,
                    locals: {
                        $dialogScope: {
                            finalData: final,
                            fileAccess:fileAccess,
                            project : project,
                            path : path,
                            csvfile : $scope.csvfile,
                            groupData : group,
                            units:$scope.PR.units
                        }
                    }
                }).then(function (res) {
                    if(res && res.save){
                        $scope.disableFile = false;
                        $scope.disableImport = false;
                        $scope.uploadedFilesList.map(function(item,index){
                           if($index == index){
                               item.save = true;
                           }
                        });
                    }
                }, function () {
                });
            }

            $scope.Done = function(){
                if($stateParams.PRId){
                    delete $scope.PR.created;
                    $scope.PR.description = $scope.PR.notes;
                    delete $scope.PR.owner;
                    PRGroupService.update($scope.PR.id,$scope.PR).then(function (result) {
                        $state.go("buyerDashboard.purchaseRequisition.list");
                    });
                }else{
                    if ($state.current.name.includes("adminDashboard")) {
                        $state.go("adminDashboard.purchaseRequisition.list");
                    } else {
                        $state.go("buyerDashboard.purchaseRequisition.list");
                    }  
                }
            };

            $scope.subProjectFilter = function(project,value){
                $scope.subProjectNames = [];
                ProjectService.getSubProjects(project).then(function (data) {
                    $scope.sub_projects = data.data;
                    if ($scope.sub_projects) {
                        $scope.sub_projects.forEach(function (item) {
                            $scope.subProjectNames.push({ id: item.id, label: item.name });
                        });
                    }
                });
                if(value){
                    $scope.subProjectNames.map(function(item){
                       if(item.id == value){
                        $scope.PR.subproject = item.id;
                       }
                    });
                    
                }
            };

            $scope.deletePR = function($index){
                var info=[];
                var data = $scope.uploadedFilesList[$index];
                var deleteRecords = data.recordId;
                if(deleteRecords){
                    deleteRecords.map(function(item){
                        PurchaseRequisitionService.delete(item).then(function(data){
                            info.push(data.data);
                            if(deleteRecords.length === info.length){
                                Notification.success({
                                    message: 'Successfully deleted',
                                    positionX: 'right',
                                    positionY: 'top'
                                  });
                            }
                         });
                     });
                     $scope.uploadedFilesList.splice($index,1);
                     $scope.fileList.splice($index,1);
                     $scope.disabledData = false;
                     $scope.disableImport = false;
                     fileName = null;
                }else{
                    $scope.disabledData = false;
                    $scope.disableImport = false;
                    $scope.fileList.splice($index,1);
                    $scope.uploadedFilesList.splice($index,1);
                    fileName = null;
                }
             };

             $scope.ViewPRData = function(ev,data){
                var items;
                PurchaseRequisitionService.get({ groupId: data.id }).then(function (data) {
                  items = data.data.results;
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
                        visible:true
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
                });
             }
             
        }]);
})();