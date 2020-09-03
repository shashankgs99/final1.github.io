(function () {
  var app = angular.module('app');
  app.controller('admin.projects', ['$scope', '$window', '$modal', '$timeout', '$state', 'ProjectService', 'dateService', 'Notification', 'IndustryService', 'CustomerService', '$log', '$rootScope', '$stateParams', '$mdDialog', 's3Service',
    function ($scope, $window, $modal, $timeout, $state, ProjectService, dateService, Notification, IndustryService, CustomerService, $log, $rootScope, $stateParams, $mdDialog, s3Service) {

      $scope.showLoader = false;
      $scope.disableProject = $scope.disable;
      $scope.selectedIndustry = [];
      $scope.project = { due_date: new Date() };
      $scope.clientcontacts = [];
      $scope.contractorContacts = [];
      $scope.selectedContacts = [];
      $scope.clients = [];
      $scope.contractors = [];
      $scope.attachments = [];
      $scope.fileAttachments = [];
      $scope.existingAttachments = [];
      $scope.editedAttachments = [];
      $scope.images = [];
      $scope.statusOfProject = [];
      $scope.disabledData = false;
      $scope.project = { project_date:new Date() };

      if ($stateParams.projectId) {
        $scope.showLoader = true;
        $scope.name = "Edit";
      } else {
        $scope.name = "Add";
      }

      ProjectService.getMainProjects().then(function (data) {
        $scope.projectsData = data.data;
        if ($scope.parentProject) {
          $scope.project.parent_project = $scope.parentProject;
        }
      });

      ProjectService.getProjectStatus().then(function (item) {
        $scope.projectStatus = item.data.results;
      });

      ProjectService.getProjectTypes().then(function (data) {
        projectTypes = data.data.results;
      });


      CustomerService.get({ page_size: 10000 }).then(function (data) {
         $scope.customers = data.data.results;
      });

      IndustryService.get().then(function (data) {
        $scope.industries = data.data.results;
        $scope.industries = $scope.industries.map(function (item) { return { id: item.id, label: item.industry }; });
      });

      function getUserInfo() {
        if ($scope.userInfo) {
          return $scope.userInfo;
        }
        if ($scope.current_user) {
          return $scope.current_user.data;
        }
      }

      function getCustomerData(info, type) {
        var userInfo = getUserInfo();
        CustomerService.get({ page_size: 10000 }).then(function (data) {
          var customers = data.data.results;
          $scope.customers = data.data.results;
          customers.forEach(function (item) {
            if (item.role_type.length) {
              if (item.role_type[0] == 1) {
                $scope.contractors.push(item);
              } else {
                if (item.role_type[0] == 9) {
                  $scope.clients.push(item);
                }
              }
            }
          });
          if (type === "client") {
            if ($scope.project) {
              $scope.project.customer_client = info.id;
              $scope.selectContacts({ customer_client: $scope.project.customer_client });
            } else {
              $scope.project = { customer_client: info.id };
              $scope.selectContacts({ customer_client: $scope.project.customer_client });
            }
          } else {
            if ($scope.project) {
              $scope.project.customer_contractor = info.id;
              $scope.contractor({ customer_contractor: $scope.project.customer_contractor });
            } else {
              $scope.project = { customer_contractor: info.id };
              $scope.contractor({ customer_contractor: $scope.project.customer_contractor });
            }
          }
        });
      }

      $scope.saveNewRevision = false;
      if ($stateParams.projectId) {
        $scope.saveNewRevision = true;
      }

      var projectTypes;
      if ($stateParams.projectId) {
        ProjectService.getOne($stateParams.projectId).then(function (data) {
          $scope.project = data.data;
          if ($scope.project.due_date) {
            $scope.project.due_date = dateService.convertDateToJS($scope.project.due_date);
          }
          if ($scope.project.project_date) {
            $scope.project.project_date = dateService.convertDateToJS($scope.project.project_date);
          }
          if ($scope.project.industries) {
            $scope.project.industries.forEach(function (item) {
              $scope.selectedIndustry.push({ id: item.id });
            });
          }
          if ($scope.project.project_status) {
            $scope.project.project_status = $scope.project.project_status.id;
          }
          if ($scope.project.customer) {
            $scope.project.customer_client = $scope.project.customer.id;
            $scope.selectContacts({ customer_client: $scope.project.customer_client });
          }
          // if ($scope.project.customer_contractor) {
          //   $scope.project.customer_contractor = $scope.project.customer_contractor.id;
          //   $scope.contractor({ customer_contractor: $scope.project.customer_contractor });

          // }
          if ($scope.project.customer_contacts.length) {
            var clientData = $scope.project.customer_contacts;
            $scope.project.customer_contacts = [];
            clientData.map(function (item) {
              $scope.project.customer_contacts.push(item.id);
            });
          }
          // if ($scope.project.contractor_contacts.length) {
          //   $scope.selectedContacts = [];
          //   $scope.project.contractor_contacts.map(function (item) {
          //     $scope.selectedContacts.push({ id: item.id })
          //   });
          // }
          if ($scope.project.project_type) {
            if ($scope.project.project_type.id == 1) {
              $scope.project.project_type = "Budgetary";
            } else {
              $scope.project.project_type = "Firm";
            }
          }
          if ($scope.project.attachments) {
            $scope.project.attachments.map(function (item) {
              $scope.existingAttachments.push(item.s3_url);
            });
          }
          $scope.showLoader = false;

        }, function (err) {
          $scope.showLoader = false;
        });
      }

      $scope.createClient = createClient;

      function createClient(ev, type) {

        $mdDialog.show({
          controller: 'layout.standard.createCustomer',
          templateUrl: 'assets/js/modules/customer/customer-modal.html',
          parent: angular.element(document.body),
          targetEvent: ev,
          multiple: true,
          clickOutsideToClose: true,
          locals: {
            $dialogScope: {
              userInfo: getUserInfo(),
              type: type
            }
          }
        }).then(function (res) {
          if (res) {
            getCustomerData(res, type);
          }
        }, function () {
        });

      }

      $scope.dropDownSettings = {
        smartButtonMaxItems: 3,
        smartButtonTextConverter: function (itemText, originalItem) {
          return itemText;
        },
      };

      $scope.cancelProjectInternal = function () {
        if ($state.current.name.includes("adminDashboard.projects") && $stateParams.projectId) {
          $state.go("adminDashboard.projects.list");
        } else if ($state.current.name.includes("supplierDashboard.projects") && $stateParams.projectId) {
          $state.go("supplierDashboard.projects.list");
        } else if ($state.current.name.includes("adminDashboard.enquiries.createEnquiry")) {
          $rootScope.$broadcast("projectClose");
          return;
        } else if ($state.current.name.includes("buyerDashboard.enquiries.createEnquiry")) {
          $rootScope.$broadcast("projectClose");
          return;
        }
        else if (!$stateParams.projectId) {
          if ($state.current.name.includes("adminDashboard")) {
            $state.go("adminDashboard.projects.list");
          } else {
            $state.go("supplierDashboard.projects.list");
          }
        }
      };

      $scope.selectContacts = function (data) {
        $scope.clientContacts = [];
        CustomerService.getOne(data.customer_client).then(function (data) {
          var result = data.data;
          if (result.contacts) {
            result.contacts.map(function (item) {
              var name;
              if (item.firstname) {
                name = item.firstname;
                if (item.lastname) {
                  name += " " + item.lastname;
                }
              } else {
                if (item.lastname) {
                  name = item.lastname;
                }
              }
              name ? $scope.clientContacts.push({ id: item.id, label: name }) : '';
            });
          }
        });
      }

      $scope.contractor = function (data) {
        $scope.contractorContacts = [];
        CustomerService.getOne(data.customer_contractor).then(function (data) {
          var result = data.data;
          if (result.contacts) {
            result.contacts.map(function (item) {
              var name;
              item.firstname ? name = item.firstname : '';
              item.lastname ? name += " " + item.lastname : '';
              name ? $scope.contractorContacts.push({ id: item.id, label: name }) : '';
            });
          }
        });
      }

      $scope.AddAttachments = function () {
        $scope.fileAttachments.push({});
      };

      $scope.removeAttachments = function (files, index) {
        $scope.existingAttachments.splice(index, 1);
      };

      $scope.removeAttachment = function (files, index) {
        files.splice(index, 1);
      };

      $scope.uploadAttachmentsToS3 = function (file, $index, files) {
        var path = 'user/' + $scope.current_user.data.id + '/project/projectAttachments';
        s3Service.uploadFile(path, file, function (url) {
          if (url) {
            $scope.images.push(url);
            $scope.$apply();
            Notification.success({
              message: 'Successfully uploaded file',
              positionX: 'right',
              positionY: 'top'
            });
            document.getElementById("project-image").value = null;
          }

        });

      };

      $scope.saveAsNewRevision = function (project, valid) {
        delete project.id;
        delete project.owner;
        $scope.saveProject(project, valid);
      }

      $scope.saveProject = function (project, valid) {
        $scope.submitted = true;
        if (!project.name) {
          Notification.error({
            message: 'please enter project name',
            positionX: 'right',
            positionY: 'top'
          });
          return;
        }
        if (!project.project_type) {
          Notification.error({
            message: 'please select project type',
            positionX: 'right',
            positionY: 'top'
          });
          return;
        }
        $scope.showLoader = true;
        project.attachments = [];
        if ($scope.clientcontacts.length) {
          var contacts = $scope.clientcontacts.map(function (item) {
            return item['id'];
          });
          project.customer_contacts = contacts;
        }
        if (project.customer_client) {
          project.customer = project.customer_client;
        }
        if ($scope.contractorContacts.length) {
          var contacts = $scope.contractorContacts.map(function (item) {
            return item['id'];
          });
          project.contractor_contacts = contacts;
        }
        if ($scope.selectedIndustry.length) {
          project.industries = $scope.selectedIndustry.map(function (item) { return item.id; });
        }
        
        if (angular.isDate(project.project_date)) {
          project.project_date = dateService.convertDateToPython(project.project_date);
        }
        if (angular.isDate(project.due_date)) {
          project.due_date = dateService.convertDateToPython(project.due_date);
        }
        if (project.parent_project) {
          project.parent_project = project.parent_project.id;
        }
        if ($scope.images.length) {
          project.attachments = $scope.images;
        }
        if ($scope.existingAttachments) {
          project.attachments.length ? project.attachments = project.attachments.concat($scope.existingAttachments) : project.attachments = $scope.existingAttachments;

        }
        if (project.project_status && project.project_status.id) {
          project.project_status = project.project_status.id;
        }
        if (project.project_type) {
          var types = projectTypes.filter(function (item) { return item.name === project.project_type; })
          if (types && types.length) {
            project.project_type = types[0].id;
          }
        }
        if (project.id) {
          delete project.owner;
          ProjectService.update(project.id, project).then(function (data) {
            $scope.showLoader = false;
            Notification.success({
              message: 'Successfully updated Project',
              positionX: 'right',
              positionY: 'top'
            });
            if ($state.current.name.includes("adminDashboard")) {
              $state.go("adminDashboard.projects.list");
            } else {
              $state.go("supplierDashboard.projects.list");
            }
          }, function (err) {
            $scope.showLoader = false;
            $scope.error = err.data;
            console.log($scope.error);
          });
        } else {
          if ($scope.parentProject) {
            project.parent_project = $scope.parentProject.id;
          }
          ProjectService.post(project).then(function (data) {
            $scope.showLoader = false;
            Notification.success({
              message: 'Successfully added Project',
              positionX: 'right',
              positionY: 'top'
            });
            if (($state.current.name).includes("adminDashboard.enquiries.createEnquiry")) {
              $rootScope.$broadcast("projectClose", data.data);
            } else if (($state.current.name).includes("buyerDashboard.enquiries.createEnquiry")) {
              $rootScope.$broadcast("projectClose", data.data);
            }
            else {
              if ($state.current.name.includes("adminDashboard")) {
                $state.go("adminDashboard.projects.list");
              } else {
                $state.go("supplierDashboard.projects.list");
              }
            }
          }, function (err) {
            $scope.showLoader = false;
            $scope.error = err.data;
            console.log($scope.error);
          });
        }

      };


      $scope.UpdateStatus = function (data, ev) {
          return $mdDialog.show({
            controller: 'layout.order.updateGRNItems',
            templateUrl: 'assets/js/modules/po/GRN/update-grn-details/update-grn-details.html',
            parent: angular.element(document.body),
            targetEvent: ev,
            multiple: true,
            clickOutsideToClose: true,
            locals: {
              $dialogScope: {
                display: 'project',
              }
            }
          }).then(function (res) {
            if (res) {
                if (res.status) {
                  $scope.project.project_status = res.status;
                }
            }
          });
      };

    }]);
})();