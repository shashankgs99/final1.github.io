(function () {
    var app = angular.module('app');
    app.controller('createEnquiry', ['$scope', '$window', '$modal', '$log','$state','s3Service','ProjectService','MessageService','Notification','$timeout','$stateParams','CsvService','PurchaseRequisitionService','ProjectGroupService','MTOService','$mdDialog','MTOGroupService','CustomerService',
    function ($scope, $window, $modal, $log, $state,s3Service,ProjectService,MessageService,Notification,$timeout,$stateParams,CsvService,PurchaseRequisitionService,ProjectGroupService,MTOService,$mdDialog,MTOGroupService,CustomerService) {
        $scope.arrowDirection =  true;
        $scope.fileUploads = [];
       // $scope.purchaseInfo = [];
        var currentData = [];
        $scope.fileList = [];
        $scope.viewMtoList = [];
        $scope.projectNames = [];
        $scope.uploadedFilesList = [];
        $scope.disabledData = false;
        $scope.disableImport = false;
        var fileName = null;
        var enquiryTypes;
        var projectTypes;
        $scope.enquiry = {message:''};
        
        if(!$scope.fileUploads.length){
            var file={};
            file.add = true;
            $scope.fileUploads.push(file);
        }
        if($stateParams.messageId){
            $scope.showLoader = true;
        }
        $scope.PRFiles = [];
        $scope.productFiles = [];
        var parentProject;
        var subProject;
        $scope.buttonName = 'Create Enquiry';

        ProjectService.getProjectTypes().then(function(data){
            projectTypes = data.data.results;
        });

        $scope.deleteMTO = function($index){
            var data = $scope.uploadedFilesList[$index];
            if(data && data.recordId){
                var deleteRecords = data.recordId[0];
            }
            if(deleteRecords){
                data.map(function(item){
                     MTOService.delete(item).then(function(data){
                        Notification.success({
                            message: 'Successfully deleted',
                            positionX: 'right',
                            positionY: 'top'
                          });
                     });
                 });
                 console.log("successfully deleted all records");
                 $scope.uploadedFilesList.splice($index,1);
                 $scope.fileList.splice($index,1);
                 $scope.disabledData = false;
                 $scope.disableImport = false;
                 $scope.csvfile = null;
                 fileName = null;
            }else{
                $scope.disabledData = false;
                $scope.disableImport = false;
                $scope.fileList.splice($index,1);
                $scope.uploadedFilesList.splice($index,1);
                fileName = null;
            }
         };
        
        $scope.cancelEdit = function(){
            if($state.current.name.includes("adminDashboard")){
                $state.go('adminDashboard.enquiries.list');
            }else if($state.current.name.includes("supplierDashbord")){
                $state.go('supplierDashboard.enquiries.list');
            }else if($state.current.name.includes("buyerDashboard")){
                $state.go('buyerDashboard.enquiries.list');
            } 
            // if($stateParams.messageId){
            //     $state.go('adminDashboard.enquiries.viewEnquiries',{enquiryId:$stateParams.messageId});
            // }else{
            //     $state.go('adminDashboard.enquiries.list');
            // }
        };
        function getUserInfo(){
            if($scope.current_user){
                return $scope.current_user.data;
            }
        }

        $scope.removePRFiles = function(files,index){
            $scope.PRFiles.splice(index,1);
        };

        if(!$scope.PRFiles.length){
            var file={};
            $scope.PRFiles.push(file);
        }

        if($stateParams.messageId){
            $scope.messageId = $stateParams.messageId;
            $scope.buttonName = 'Edit Enquiry';
            MTOService.get({ enquiryId : $stateParams.messageId }).then(function (data) {
                var result = data.data.results;
                if (result.length) {
                    $scope.enquiryMtoList = [];
                    result.map(function (item) {
                        if (item.group) {
                            MTOGroupService.getOne(item.group).then(function (data) {
                                $scope.enquiryMtoList.push(data.data);
                            });
                        }
                    });
                }
            });
            MessageService.getOne($stateParams.messageId).then(function(data){
                $scope.showLoader = false;
                $scope.enquiry =  data.data;
                if(data.data.project){
                    if(data.data.project.parent_project){
                        parentProject = data.data.project.parent_project;
                        subProject = data.data.project;
                    }else{
                        parentProject = data.data.project;
                    }
                    $scope.enquiry.parent_project = parentProject;                    
                    $scope.selectedProject($scope.enquiry.parent_project,'project');
                }else if(data.data.project){
                    $scope.enquiry.parent_project = parentProject;
                    $scope.selectedProject($scope.enquiry.parent_project,'project');
                }
                if($scope.enquiry.attachments){
                    $scope.enquiry.attachments.forEach(function (item) {
                        var fileAttachment = item.split('/');
                        $scope.productFiles.push({fileName:fileAttachment.pop(),filePath:item});
                    });
                }
            });
        }
        MessageService.getEnquiryTypes().then(function(data){
            enquiryTypes = data.data.results;
        });

        $scope.enquiry = {};
        $scope.uploadedFiles = [];
        
        ProjectService.getMainProjects().then(function(data){
            $scope.projects = data.data;  
            if($scope.enquiry && $scope.enquiry.parent_project){
                $scope.projects.map(function(item){
                      if(item.id == $scope.enquiry.parent_project.id){
                          $scope.enquiry.parent_project = item;
                      }
                });
            }          
        });

        $scope.AddUploadFiles = function(){
            var file={};
            file.remove = true;
            $scope.fileUploads.push(file);
        };

        $scope.removeFiles = function(files,index,removeFromS3Files){
            files.splice(index,1);
            if(removeFromS3Files){
                $scope.uploadedFiles.splice(index,1);
            }
        };

        $scope.uploadFile = function(file,$index){
            var upload = false;
            var path = 'user/' + $scope.current_user.data.id + '/enquiry/enquiryAttachments';
  
            s3Service.uploadFile(path, file, function (url) {
               if($scope.uploadedFiles.length){
                    $scope.uploadedFiles.forEach(function(item){
                    if(item.index == $index){
                        upload =  true;
                        item.url = url;
                    }
                    });
                    if(!upload){
                        $scope.uploadedFiles.push({url:url,index:$index});
                    }
               }else{
                    $scope.uploadedFiles.push({url:url,index:$index});
               }

              Notification.success({
                message: 'Successfully uploaded file',
                positionX: 'right',
                positionY: 'top'
              });
             
            }, function (error) {
              errorCallback(error);
            });

        };

        function getProjectData(info){
            $scope.getProjectMTO(info.id);
            $scope.displayProject = info;
            if($scope.displayProject.customer){
                CustomerService.getOne($scope.displayProject.customer).then(function(data){
                    $scope.displayProject.customer = data.data;
                });
            }
            if($scope.displayProject.customer_contractor){
                CustomerService.getOne($scope.displayProject.customer_contractor).then(function(data){
                    $scope.displayProject.customer_contractor = data.data;
                });
            }
            ProjectService.getMainProjects().then(function(data){
               $scope.projects = data.data;
               $scope.projects.map(function(item){
                  if(item.id == info.id){
                    $scope.enquiry.parent_project = item;
                  }
               });
               if($scope.displayProject && $scope.displayProject.project_type){
                projectTypes.map(function(item){
                    if(item.id === $scope.displayProject.project_type){
                        $scope.displayProject.project_type = item;
                    }
                 });
               }
           
            });
        }
        $scope.selectedMTOList = [];
        $scope.selectedMTOGroups =[];

        $scope.selectedMTO = function(data,$index,value){
            if(!value){
                $scope.selectedMTOGroups.push(data);
            }else{
                $scope.selectedMTOGroups.map(function(item,index){
                    if (item.id === data.id) {
                        $scope.selectedMTOGroups.splice(index, 1);
                        $scope.selectedMTOGroups.length - 1;
                    }
                });
            }
            
        };

        $scope.getFileName = function (data) {
            var file = document.getElementById("mto-file");
            fileName = file.value.split("\\").pop();
            $scope.csvfile = data;
        };
       
        $scope.importData = function (csvfile) {
            currentData=[];
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

        $scope.ViewInfo = function (ev, $index) {
            if(!$scope.enquiry.parent_project){
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
                var project = $scope.enquiry.parent_project.id;
                var path = 'user/' + $scope.current_user.data.id + '/mto';
                final = info;
                var group = {};
                group.project = project;
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
                        fileName = null;
                        $scope.disabledData = false;
                        $scope.disableImport = false;
                        $scope.uploadedFilesList.map(function (item, index) {
                            if ($index == index) {
                                item.save = true;
                            }
                        });
                    }
                  
                },function(){
            });

        }

        $scope.save = function (data,$index) {
                var arr = [];
                if (!$scope.enquiry.parent_project) {
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
                    group.project = $scope.enquiry.parent_project.id;
                   // group.description = data.notes;
                    group.attachment = url;
                    MTOGroupService.post(group).then(function (result) {
                        currentData.map(function (mto) {
                            mto.map(function (item) {
                                if (Object.keys(item).length) {
                                    item.project = $scope.enquiry.parent_project.id;
                                  //  item.buyer_notes = data.notes;
                                    item.group = result.data.id;
                                    arr.push(item);
                                }
                            });
                        });
                        MTOService.post(arr).then(function (data) {
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
                            if (!$scope.selectedMTOList.length) {
                                $scope.selectedMTOList = data.data;
                            } else {
                                $scope.selectedMTOList = $scope.selectedMTOList.concat(data.data);
                            }
            
                            $scope.uploadedFilesList.map(function (item, index) {
                                if ($index == index) {
                                    item.save = true;
                                    item.recordId = uploadedId;
                                }
                            });
                            $scope.disabledData = false;
                            $scope.disableImport = false;
                            fileName = null;
                        });
                    });
                });
            
        };

        $scope.tinymceOptions = {
            plugins: 'link image code media table paste',
            toolbar: 'undo redo | bold italic | alignleft aligncenter alignright | code'
        };
      
        tinymce.init({
            selector: '#mytextarea',
            height: 500,
            menubar: true,
            plugins: [
              'advlist autolink lists link image charmap print preview anchor textcolor',
              'searchreplace visualblocks code fullscreen',
              'insertdatetime media table contextmenu paste code help wordcount'
            ],
            toolbar: 'insert | undo redo |  formatselect | bold italic backcolor  | alignleft aligncenter alignright alignjustify | bullist numlist outdent indent | removeformat | help',
            content_css: [
              '//fonts.googleapis.com/css?family=Lato:300,300i,400,400i',
              '//www.tinymce.com/css/codepen.min.css']
        });
     
        function getSubProject(info){
            $scope.displayProject = info;
            if($scope.displayProject.customer_client){
                CustomerService.getOne($scope.displayProject.customer_client).then(function(data){
                    $scope.displayProject.customer_client = data.data;
                });
            }
            if($scope.displayProject.customer_contractor){
                CustomerService.getOne($scope.displayProject.customer_contractor).then(function(data){
                    $scope.displayProject.customer_contractor = data.data;
                });
            }
            if($scope.enquiry.parent_project){
                ProjectService.getSubProjects($scope.enquiry.parent_project.id).then(function (data) {
                    $scope.sub_projects = data.data;
                    $scope.enquiry.sub_project = info;
                    if ($scope.displayProject.project_type) {
                        projectTypes.map(function (item) {
                            if (item.id === $scope.displayProject.project_type) {
                                $scope.displayProject.project_type = item;
                            }
                        });
                    }
                });
            }
        }

        $scope.importform = function(csvfile){
            CsvService.csvParser(csvfile,$scope.serviceName);
        };

        $scope.selectedProject = function(project,type){
            $scope.selectedMTOGroups =[];
            $scope.viewMtoList=[];
            $scope.mtoSelection = false;
            $scope.getProjectMTO(project.id);  
            if(project){
                $scope.displayProject = project;
            }
            if(type==='project'){
                ProjectService.getSubProjects(project.id).then(function(data){
                    $scope.sub_projects = data.data;
                    if(parentProject && subProject){
                        $scope.enquiry.sub_project = subProject;
                        $scope.displayProject = subProject;
                    }
                });
            }      
               
        };

        $scope.getProjectMTO = function(id){
            ProjectGroupService.get({projectId:id}).then(function(data){
               $scope.MTOList = data.data.results;
               $scope.MTOList = $scope.MTOList.map(function(item){
                    item.fileName = item.attachment.split("/").pop();
                    item.checked = false;
                    item.indeterminate = false;
                    return item;
               });
            });
        };

        $scope.saveEnquiry = function(enquiry){
            var arr=[];
            var finalMtoList = [];
            var totalRecords = [];
            if ($scope.selectedMTOGroups.length) {
                if($scope.viewMtoList.length){
                    arr = _.flattenDeep([finalMtoList, $scope.selectedMTOList]);
                }
                $scope.selectedMTOGroups.map(function (item) {
                    MTOService.get({ groupId: item.id }).then(function (data) {
                        if (!finalMtoList.length) {
                            finalMtoList.push(data.data.results);
                        } else {
                            finalMtoList = finalMtoList.concat(data.data.results);
                        }
                        totalRecords = _.flattenDeep([finalMtoList, $scope.selectedMTOList,arr]);
                       
                    });
                });
            }else{
                if($scope.viewMtoList.length){
                    arr = _.flattenDeep([finalMtoList, $scope.selectedMTOList]);
                }
                totalRecords = _.flattenDeep([$scope.selectedMTOList,arr]);
            }
            
            if(!enquiry.subject){
                Notification.error({
                    message: 'Please enter subject',
                    positionX: 'right',
                    positionY: 'top'
                });
                return;
            }
            if(!enquiry.message){
                Notification.error({
                    message: 'Please enter email-body',
                    positionX: 'right',
                    positionY: 'top'
                });
                return;
            }
            enquiry.attachments = [];
            if(enquiry.id && !enquiry.edit_notes){
                Notification.error({
                    message: 'Please input edit notes to continue',
                    positionX: 'right',
                    positionY: 'top'
                });
                return;
            }
            if(enquiry.sub_project){
                enquiry.project = enquiry.sub_project.id;
                delete enquiry.sub_project;
                delete enquiry.parent_project;
            }else if(enquiry.parent_project){
                enquiry.project = enquiry.parent_project.id;
                delete enquiry.parent_project;
            }
            if($scope.uploadedFiles.length){
                $scope.uploadedFiles.forEach(function(item){
                  enquiry.attachments.push(item.url);
                });
            }
            if($scope.productFiles){
                $scope.productFiles.forEach(function(item){
                    enquiry.attachments.push(item.filePath);
                });
            }
            var enquirytype = enquiryTypes.filter(function(item){return item.name === 'Enquiry'});
            enquiry.enquiry_type = enquirytype[0].id;
            if(enquiry.owner){
                delete enquiry.owner;
            }
            delete enquiry.enquiry_state;

            if (enquiry.id) {
                if (!enquiry.supplier) {
                    delete enquiry.supplier;
                }
                if (enquiry.sender) {
                    enquiry.sender = enquiry.sender.id;
                }
                if (!enquiry.supplier_company) {
                    delete enquiry.supplier_company;
                }
                if (enquiry.supplier_company) {
                    enquiry.supplier_company = enquiry.supplier_company.id;
                }
                if (!enquiry.sender) {
                    delete enquiry.sender;
                }
                if (!enquiry.receiver) {
                    delete enquiry.receiver;
                }
                if (enquiry.project && enquiry.project.id) {
                    enquiry.project = enquiry.project.id;
                }
                MessageService.update(enquiry.id, enquiry).then(function (data) {
                    console.log("success");
                    if (totalRecords.length) {
                        totalRecords.forEach(function (item,$index) {
                            MTOService.update(item.id,{enquiry: data.data.id}).then(function (res) {
                                if($index === totalRecords.length-1){
                                    Notification.success({
                                        message: 'Successfully added MTO to enquiry',
                                        positionX: 'right',
                                        positionY: 'top'
                                    });
                                }
                            });
                        });
                    }
                    Notification.success({
                        message: 'Successfully updated enquiry',
                        positionX: 'right',
                        positionY: 'top'
                    });
                    $timeout(function () {
                        if ($state.current.name.includes("adminDashboard")) {
                            $state.go('adminDashboard.enquiries.viewEnquiries', { enquiryId: data.data.id });
                        }else if ($state.current.name.includes("supplierDashboard")) {
                            $state.go('supplierDashboard.enquiries.viewEnquiries', { enquiryId: data.data.id });
                        }else if ($state.current.name.includes("buyerDashboard")) {
                            $state.go('buyerDashboard.enquiries.viewEnquiries', { enquiryId: data.data.id });
                        }
                    }, 1000);
                }, function (err) {
                    $scope.error = err.data;
                    console.log($scope.error);
                });
            } else {
                if ($scope.current_user && $scope.current_user.data) {
                    enquiry.sender = $scope.current_user.data.id;
                }
                MessageService.post(enquiry).then(function (data) {
                    console.log(totalRecords);
                    if (totalRecords.length) {
                        totalRecords.forEach(function (item,$index) {
                            MTOService.update(item.id,{enquiry: data.data.id}).then(function (res) {
                                if($index === totalRecords.length-1){
                                    Notification.success({
                                        message: 'Successfully created enquiry',
                                        positionX: 'right',
                                        positionY: 'top'
                                    });
                                }
                            });
                        });
                    }else{
                        Notification.success({
                            message: 'Successfully created enquiry',
                            positionX: 'right',
                            positionY: 'top'
                        });
                    }
                    $timeout(function () {
                        if ($state.current.name.includes("adminDashboard")) {
                            $state.go('adminDashboard.enquiries.viewEnquiries', { enquiryId: data.data.id });
                        }else if ($state.current.name.includes("supplierDashboard")) {
                            $state.go('supplierDashboard.enquiries.viewEnquiries', { enquiryId: data.data.id });
                        }else if ($state.current.name.includes("buyerDashboard")) {
                            $state.go('buyerDashboard.enquiries.viewEnquiries', { enquiryId: data.data.id });
                        }
                    }, 1000);
                });
            }
        };
        $scope.getRequistionData = function(data){
          if($scope.purchaseInfo){
            $scope.purchaseInfo =  $scope.purchaseInfo.concat(data);
          }else{
            $scope.purchaseInfo =  data;
          }  
          
        };
        $scope.saveEnquiryNewVersion = function(enquiry){
            if(!enquiry.revision_notes){
                Notification.error({
                    message: 'Please enter new revision notes to continue',
                    positionX: 'right',
                    positionY: 'top'
                });
                return;
            }
            delete enquiry.id;
            if(!enquiry.supplier){
                delete enquiry.supplier;
            }
            if(!enquiry.supplier_company){
                delete enquiry.supplier_company;
            }
            if(!enquiry.receiver){
                delete enquiry.receiver;
            }
            $scope.saveEnquiry(enquiry);
        };

        $scope.createProject = createProject;

        // function createProject(size, backdrop, closeOnClick) {
           
        //     var params = {
        //       templateUrl: "create-project.html",
        //       resolve: {
        //           parent_project: function(){
        //               return backdrop === 'Sub-Project'?$scope.enquiry.parent_project:null;
        //           }
        //       },
        //       controller: function ($scope, $modalInstance,parent_project) {
        //         $scope.userInfo = getUserInfo();
        //         $scope.disable = true;
        //         $scope.title = backdrop;
        //         $scope.parentProject = parent_project;
        //         $scope.$on("projectClose",function(event,data){
        //             $modalInstance.dismiss('cancel');
        //             if(data){
        //                 backdrop === "Project" ? getProjectData(data) : getSubProject(data);
        //             }
        //         });
        //         $scope.ok = function () {
        //           $modalInstance.close();
        //         };
    
        //         $scope.cancel = function () {
        //           $modalInstance.dismiss('cancel');
        //         };
        //       }
        //     };
    
        //     if (angular.isDefined(closeOnClick)) {
        //       params.closeOnClick = closeOnClick;
        //     }
    
        //     if (angular.isDefined(size)) {
        //       params.size = size;
        //     }
            
        //     var modalInstance = $modal.open(params);
    
        //     modalInstance.result.then(function (selectedItem) {
              
        //     }, function () {
        //       $log.info('Modal dismissed at: ' + new Date());
        //     });
        //   }

        function createProject(ev,type){

            $mdDialog.show({
                controller: 'projectController',
                templateUrl: 'assets/js/modules/project/project-modal.html',
                parent: angular.element(document.body),
                targetEvent: ev,
                multiple: true,
                clickOutsideToClose: true,
                locals: {
                  $dialogScope: {
                    userInfo: getUserInfo(),
                    disable: true,
                    title : type,
                    parentProject : type === 'Sub-Project'?$scope.enquiry.parent_project:null
                  }  
                }
              }).then(function (res) {
                    if(res){
                        type === "Project" ? getProjectData(res) : getSubProject(res);
                    }
                }, function () {
              });
        }

        $scope.viewMtoData = function (ev, data, $index) {
            var items;
            var result = data;
            MTOService.get({ groupId: data.id }).then(function (data) {
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
                            disableSave: false,
                            visible:true
                        }
                    }
                }).then(function (res) {
                    if (res && res.length) {
                        var data = [];
                        if (res.indeterminate) {
                            $scope.MTOList = $scope.MTOList.map(function (item) {
                                if (item.id == result.id) {
                                    item.indeterminate = true;
                                    item.checked = false;
                                }
                                return item;
                            });
                        }else{
                            if (!res.indeterminate) {
                                $scope.MTOList = $scope.MTOList.map(function (item) {
                                    if (item.id == result.id) {
                                        item.indeterminate = false;
                                        item.checked = true;
                                    }
                                    return item;
                                });
                            } 
                        }
                        if ($scope.selectedMTOGroups.length) {
                            $scope.selectedMTOGroups.map(function (item) {
                                if (item.id !== res[0].group) {
                                    data.push(item);
                                }
                            });
                            $scope.selectedMTOGroups = data;
                            if (res.length) {
                                if (!$scope.viewMtoList.length) {
                                    $scope.viewMtoList.push(res);
                                } else {
                                    $scope.viewMtoList = $scope.viewMtoList.concat(res);
                                }
                            }
                        } else {
                            if (res.length) {
                                if (!$scope.viewMtoList.length) {
                                    $scope.viewMtoList.push(res);
                                } else {
                                    $scope.viewMtoList = $scope.viewMtoList.concat(res);
                                }
                            }
                        }
                    }
                }, function () {
                });

            })
        };

        $scope.remove = function (mto, $index) {
            mto.enquiry = null;
            MTOService.get({ groupId: mto.id }).then(function (data) {
                var result = data.data.results;
                result.forEach(function (item) {
                    MTOService.update(item.id, {enquiry: null}).then(function (data) {
                        console.log("successfully updated");
                    });
                });
                $scope.enquiryMtoList.splice($index, 1);
                Notification.error({
                    message: 'Successfully deleted',
                    positionX: 'right',
                    positionY: 'top'
                });
            });
        };
          
    }]);
})();