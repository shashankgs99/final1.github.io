(function () {
    var app = angular.module('app');
    app.controller('add.MTO', ['$scope', '$window', '$modal', '$log', '$state', 'Notification', 'ProjectService', '$http', 's3Service', 'dateService', '$rootScope', '$stateParams','MTOService','MTOGroupService','$mdDialog','CsvService',
        function ($scope, $window, $modal, $log, $state, Notification, ProjectService, $http, s3Service, dateService, $rootScope, $stateParams,MTOService,MTOGroupService,$mdDialog,CsvService) {

            $scope.mto = {};
            var currentData = [];
            $scope.fileList = [];
            $scope.projectNames = [];
            $scope.uploadedFilesList = [];
            $scope.disabledData = false;
            $scope.disableImport = false;
            var fileName;
            ProjectService.getMainProjects().then(function (data) {
                $scope.projectsInfo = data.data;
                $scope.projectsInfo.forEach(function (item) {
                    $scope.projectNames.push({ id: item.id, label: item.name });
                });
                $scope.projectNames = _.uniqBy($scope.projectNames, 'id');
            });

            $scope.getFileName = function () {
                var file = document.getElementById("mto-file");
                fileName = file.value.split("\\").pop();
            };


            $scope.importData = function (csvfile) {
                currentData =[];
                if (fileName) {
                    $scope.data = CsvService.csvParser(csvfile, "MTOService");
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
                    document.getElementById("mto-file").value = null;
                    $scope.disabledData = true;
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


            $scope.save = function (data,$index) {
                var arr = [];
                if (!data.project) {
                    Notification.error({
                        message: 'please select project',
                        positionX: 'right',
                        positionY: 'top'
                    });
                    return;

                }
                var path = 'user/' + $scope.current_user.data.id + '/mto';
                s3Service.uploadFile(path, $scope.csvfile, function (url) {
                    var group = {};
                    group.project = data.subproject ? data.subproject : data.project;
                    group.description = data.notes;
                    group.attachment = url;
                    MTOGroupService.post(group).then(function (result) {
                        currentData.map(function (mto) {
                            mto.map(function (item) {
                                if (Object.keys(item).length) {
                                    item.project = data.subproject ? data.subproject : data.project;
                                    item.buyer_notes = data.notes;
                                    item.group = result.data.id;
                                    arr.push(item)
                                }
                            });
                        });
                        MTOService.post(arr).then(function(data){
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
                            $scope.uploadedFilesList.map(function (item, index) {
                                if ($index == index) {
                                    item.save = true;
                                    item.recordId = uploadedId;
                                }
                            });
                            $scope.disabledData = false;
                            $scope.disableImport = false;
                        });
                    });
                });  
        }


            $scope.ViewInfo = function (ev, $index) {
                if(!$scope.mto.project){
                    Notification.error({
                        message: 'please select project',
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
                    var project = $scope.mto.subproject ? $scope.mto.subproject : $scope.mto.project;
                    var path = 'user/' + $scope.current_user.data.id + '/mto';
                    final = info;
                    var group = {};
                    group.project = project;
                    group.description = $scope.mto.notes;
                   // group.attachment = url;
                } 
                $mdDialog.show({
                    controller: 'viewProductDatatable',
                    templateUrl: 'assets/partials/dashboard/buyer/view-product-datatable.html',
                    parent: angular.element(document.body),
                    targetEvent: ev,
                    clickOutsideToClose: true,
                    locals: {
                        $dialogScope: {
                            finalData: final,
                            fileAccess:fileAccess,
                            project : project,
                            path : path,
                            csvfile : $scope.csvfile,
                            groupData : group
                        }
                    }
                }).then(function (res) {
                    if(res && res.save){
                        $scope.disabledData = false;
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

            $scope.deleteMTO = function($index){
                var info=[];
                var data = $scope.uploadedFilesList[$index];
                var deleteRecords = data.recordId;
                if(deleteRecords){
                    deleteRecords.map(function(item){
                         MTOService.delete(item).then(function(data){
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
                     console.log("successfully deleted all records");
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

            $scope.Done = function(){
              $state.go("buyerDashboard.MTO.list");
            };

            $scope.subProjectFilter = function(project){
                $scope.subProjectNames = [];
                ProjectService.getSubProjects(project).then(function (data) {
                    $scope.sub_projects = data.data;
                    if ($scope.sub_projects) {
                        $scope.sub_projects.forEach(function (item) {
                            $scope.subProjectNames.push({ id: item.id, label: item.name });
                        });
                    }
                });
            };
          
        }]);
})();