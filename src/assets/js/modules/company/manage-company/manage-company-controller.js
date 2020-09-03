(function(){
  var app = angular.module('app');
app.controller('layout.standard.managecompanyController', 
['$scope', 'CompanyService', '$timeout', '$state', 's3Service','$window', '$stateParams', '$filter','UserService','dateService','Notification','$mdDialog','TaxService','BankService','$log',
function ($scope, CompanyService, $timeout, $state, s3Service, $window, $stateParams, $filter,UserService,dateService,Notification,$mdDialog,TaxService,BankService,$log) {
  var company;    
 // $scope.yearOfEstablishment = new Date();
 $scope.BackToListPageDetails = false;
  $scope.countryCode = "+91";
  $scope.deleteTaxData =[];
  $scope.companyData = {role_type : []};
  $scope.companycatalogs = [];
  $scope.taxData = [];
  $scope.companyAboutusImages = [];
  $scope.companyAttachments = [];
  $scope.catalogsInfo = [];
  $scope.catalogImages = [];
  // $scope.attachmentsContent = {};
  // $scope.logoContent = {};
  $scope.dropdownSettings = { scrollableHeight: '200px', scrollable: true,
    smartButtonMaxItems: 3,
    smartButtonTextConverter: function (itemText, originalItem) {
      return itemText;
    },
    showCheckAll: false,
    showUncheckAll: false
  };
 
  $scope.aboutUsInfo = [];
  
  $scope.bank ={};
  $scope.bankData =[];
  $scope.deleteBankData=[];

  TaxService.getTaxTypes().then(function(data){
     $scope.taxTypeList = data.data.results;
  });

  $scope.removeBankDetails = function(data,$index){
    $scope.bankData.splice($index,1);
    $scope.deleteBankData.push(data);
  };

  $scope.AddAboutUsImages = function(){
    var file={};
    file.remove = true;
    $scope.aboutUsInfo.push(file);
  };
  $scope.AddCatalogs = function(){
    var file={};
    file.remove = true;
    $scope.catalogsInfo.push(file);
  };
  
  $scope.getAboutUs = function(){
    CompanyService.getAboutusText({companyId:$stateParams.supplierId}).then(function(response){
      $scope.companyData.aboutus_text = response.data;
    });
  };
  
  $scope.uploadAboutUs = function(file,$index){
    var upload = false;
    var path = 'user/' + $scope.current_user.data.id + '/company/companyImages';

    // s3Service.uploadFile(path, file, function (url) {
     
    //   if ($scope.companyImages.length) {
    //     $scope.companyImages.forEach(function (item) {
    //       if (item.index == $index) {
    //         upload = true;
    //         item.url = url;
    //       }
    //     });
    //     if(!upload) {
    //       $scope.companyImages.push({ url: url, index: $index });
    //     }
    //   } else {
    //     $scope.companyImages.push({ url: url, index: $index });
    //   }

    //     Notification.success({
    //       message: 'Successfully uploaded file',
    //       positionX: 'right',
    //       positionY: 'top'
    //     });
    // }, function (error) {
    //   $scope.disabled = false;
    //   errorCallback(error);
    // });
    s3Service.uploadFile(path, file, function (url) {
      if (url) {
        $scope.companyAttachments.push(url);
        $scope.$apply();
        Notification.success({
          message: 'Successfully uploaded file',
          positionX: 'right',
          positionY: 'top'
        });
        document.getElementById("company-attachment").value = null;

      }
    });
  }
  $scope.removeAboutUs = function(files,index){
     files.splice(index,1);
     $scope.companyImages.splice(index,1);
  };

 
  $scope.uploadCatalogs = function(file,$index){
    var upload = false;
    var path = 'user/' + $scope.current_user.data.id + '/company/companyImages';

    // s3Service.uploadFile(path, file, function (url) {
     
    //   if ($scope.catalogImages.length) {
    //     $scope.catalogImages.forEach(function (item) {
    //       if (item.index == $index) {
    //         upload = true;
    //         item.url = url;
    //       }
    //     });
    //     if(!upload) {
    //       $scope.catalogImages.push({ url: url, index: $index });
    //     }
    //   } else {
    //     $scope.catalogImages.push({ url: url, index: $index });
    //   }

    //     Notification.success({
    //       message: 'Successfully uploaded file',
    //       positionX: 'right',
    //       positionY: 'top'
    //     });
    // }, function (error) {
    //   $scope.disabled = false;
    //   errorCallback(error);
    // });
    s3Service.uploadFile(path, file, function (url) {
      if (url) {
        $scope.catalogImages.push(url);
        $scope.$apply();
        Notification.success({
          message: 'Successfully uploaded file',
          positionX: 'right',
          positionY: 'top'
        });
        document.getElementById("company-attachment").value = null;

      }
    });
  };

  $scope.removeTaxDetails = function($index,details){
    $scope.taxData.splice($index,1);
    $scope.deleteTaxData.push(details);
  }

  $scope.uploadTaxUrl = function(file,details){
    var path = 'company/' + $scope.companyData.id + '/taxDetails';
    s3Service.uploadFile(path, file, function (url) { 
       details.url = url;
       Notification.success({
        message: 'Successfully uploaded file',
        positionX: 'right',
        positionY: 'top'
      });
    });
  };

  $scope.removeCatalogs = function(files,index){
       files.splice(index,1);
      //  $scope.catalogImages.splice(index,1);
  };

  if($state.current.name.includes('adminDashboard')){
    $scope.hideBackToDetails = true;
  }

  $scope.removeFile = function (files, index) {
    $scope.companyImagesToUpload.splice(index, 1);
    $scope.companyImages.splice(index,1);
  };

  $scope.removeUploadedCatalogs = function(files,index){
    $scope.companycatalogs.splice(index,1);
  };

  CompanyService.get().then(function(data){
    $scope.companysData = data.data.results;
  },function(err){
    console.log(err);
  });
    if($scope.companyItem){ 
      $scope.adminCompanyId = $scope.companyItem[0][4];
       getCompanyDetails($scope.companyItem[0][4]);
  }

  $scope.customButtonText = { buttonDefaultText: 
    'Select all applicable'};
  
  CompanyService.getCurrencyType().then(function(data){
    //console.log(data.data.results);
    $scope.currencyTypeList = data.data.results;
  }, function(err){
    console.log(err);
  });

  $scope.previewCompany = function(){
    var companyName = $scope.companyData.company_name;
    companyName = companyName.replace(/ +/g, "-");
    return $state.href('layout.standard.companyIntro.intro', {companyId:$scope.companyData.id,companyName:companyName,description:$scope.companyData.aboutus_text});
  };

  $scope.removeImage = function(files,index){
    $scope.companyAboutusImages.splice(index, 1);
    //$scope.companyData.aboutus_images.splice(index,1);
  };

  if($stateParams.supplierId){
    getCompanyDetails($stateParams.supplierId);
    
  }

  function getCompanyDetails(companyId) {
 
    BankService.get({company : companyId}).then(function(result){
      if(result.data.results.length){
        $scope.bankData = result.data.results;
      }
    });
    TaxService.get({company : companyId}).then(function(res){
     $scope.taxData = res.data.results;
     $scope.taxData = $scope.taxData.map(function (item) {
          if (item.tax_type) {
            $scope.taxTypeList.map(function (tax) {
              if (item.tax_type === tax.id) {
                item.taxType = tax;
              }
            });
          }
          if(item.valid_date){
            item.validDate = dateService.convertDateToJS(item.valid_date);
          }
         
          if(item.issue_date){
            item.issueDate = dateService.convertDateToJS(item.issue_date);
          }
          return item;
      });
    });

    CompanyService.getOne(companyId).then(function (data) {
      $scope.companyData = data.data;
      if(!$scope.companyData.countryCode1){
        $scope.companyData.countryCode1 = $scope.current_user.data.country_code;
      }
      if(!$scope.companyData.phonenumber1){
        $scope.companyData.phonenumber1 = $scope.current_user.data.contact_no;
      }
      if(!$scope.companyData.emailid1){
        $scope.companyData.emailid1 = $scope.current_user.data.email;
      }
      if ($scope.companyData.establishment_type_other) {
        $scope.establishmentType = $scope.companyData.establishment_type_other;
      }else{
        $scope.establishmentType = $scope.companyData.establishment_type;
      }

      if($scope.companyData.aboutus_images){
        $scope.companyAboutusImages = [];
        $scope.companyData.aboutus_images.forEach(function (item) {
        
          var aboutUsImage = item.split('/');
          $scope.companyAboutusImages.push({name:aboutUsImage.pop(),path:item});
        });
      }

      if($scope.companyData.catalogs){
        $scope.companycatalogs = [];
        $scope.companyData.catalogs.forEach(function (item) {
          var catalog = item.split('/');
          $scope.companycatalogs.push({name:catalog.pop(),path:item});
        });
      }

      if ($scope.companyData.company_type_other) {
        $scope.companyType = $scope.companyData.company_type_other;
      }else{
        $scope.companyType = $scope.companyData.company_type;
      }

      if ($scope.companyData.establishment_year) {
        $scope.companyData.yearOfEstablishment = dateService.convertDateToJS($scope.companyData.establishment_year);
      }
      if($scope.companyData.revenue_currency === null){
        $scope.companyData.revenue_currency = 'INR';
      }
      if($scope.companyData.profit_currency === null){
        $scope.companyData.profit_currency = 'INR';
      }
      $scope.companyData.is_buyer = 'true';
      if($scope.companyData.attachments){
        var splitAttachment = $scope.companyData.attachments.split('/');
        $scope.attachmentName = splitAttachment.pop();
      }
      if ($scope.companyData.catalogs) {
        $scope.catalogNames = [];
        $scope.companyData.catalogs.forEach(function (item) {
          var catalogAttachment = item.split('/');
          $scope.catalogNames.push({fileName:catalogAttachment.pop(),filePath:item});
        });
      }
      if($scope.companyData.role_type){
        $scope.companyData.role_type = $scope.companyData.role_type.map(function(item){
          return {
            id: item,
            label: $scope.activitiesTwoOptions.filter(function(type){ return type.id===item;})[0].label
          };
        });
      }else{
        $scope.companyData.role_type = [];
      }
      if($scope.companyData.project_company && $scope.companyData.project_company.length){
         $scope.companyData.projects = $scope.companyData.project_company;
      }
      if($scope.companyData.company_testimonials && $scope.companyData.company_testimonials.length){
        $scope.companyData.testimonials = $scope.companyData.company_testimonials;
      }
      if($scope.companyData.customer_company && $scope.companyData.customer_company.length){
        $scope.companyData.customers = $scope.companyData.customer_company;
      }
      
    });      
  } 

  UserService.getRoleTypes().then(function(roledata){
    if(roledata.data.count > 0){
      $scope.activitiesTwoOptions = roledata.data.results.map(function(item){
        return {'id':item.id,'label':item.role_type_name};
      });
    }
    if($stateParams.companyId){
      CompanyService.getOne($stateParams.companyId).then(function(supp){
        company = supp.data;
        if(supp.data.company){
          getCompanyDetails(supp.data.company);
        }
      });
    }else if($scope.current_user.data.company && $scope.current_user.data.company.company_name && $state.current.name.includes('supplierDashboard')){
      getCompanyDetails($scope.current_user.data.company.id);      
    }else if($scope.current_user.data.company && !$scope.current_user.data.company.company_name  && $state.current.name.includes('supplierDashboard')){
       $scope.companyData.company_name = $scope.current_user.data.company.company_name;
    }else if($scope.current_user.data.company  && $state.current.name.includes('buyerDashboard')){
      getCompanyDetails($scope.current_user.data.company.id);   
   }
  });
  
  $scope.tinymceOptions = {
    plugins: 'link image code media table paste',
    toolbar: 'undo redo | bold italic | alignleft aligncenter alignright | code'
  };

  tinymce.init({
    selector: '#companytext',
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

  $scope.FileUpload = function (file, type) {
    var path = 'user/' + $scope.current_user.data.id + '/company/'+type;
    
    s3Service.uploadFile(path, file, function (url) {
      console.log('Uploaded file successfully');
      if (type === 'logo') {
        $scope.companyData.logo = url;
      } else {
        $scope.companyData.attachments = url;
      }
      Notification.success({
        message:'Successfully uploaded file',
        positionX:'right',
        positionY:'top'
      });
    }, function (error) {
      errorCallback(error);
    });

  };
  
  $scope.addAddress = function(){
    var addresses = {};
    if(!$scope.companyData.addresses){
      $scope.companyData.addresses = [];
    }
    $scope.companyData.addresses.push(addresses);
  };

  $scope.addContact = function (ev) {

    $mdDialog.show({
      controller: 'customer.contacts',
      templateUrl: 'assets/js/modules/customer/create-customer/customer-contact.html',
      parent: angular.element(document.body),
      targetEvent: ev,
      clickOutsideToClose: true,
      locals: {
        $dialogScope: {
          type: "Add"
        }
      }
    }).then(function (res) {
      if (res) {
        if(!$scope.companyData.contact){
          $scope.companyData.contact = [];
        }
        $scope.companyData.contact.push(res);
      }
    });

  };

  $scope.EditContact = function (ev, data, $index) {
    $mdDialog.show({
      controller: 'customer.contacts',
      templateUrl: 'assets/js/modules/customer/create-customer/customer-contact.html',
      parent: angular.element(document.body),
      targetEvent: ev,
      clickOutsideToClose: false,
      locals: {
        $dialogScope: {
          contactsData: data,
          type: (data && data.id) ? "Edit" : "Modification"
        }
      }
    }).then(function (res) {
      if (res) {
        if (res.type == "Edit") {
          $scope.companyData.contact[$index] = res;
        } else {
          $scope.companyData.contact[$index] = res;
        }
      }
    });
  };

  $scope.CreateAddress = function (ev) {
    $mdDialog.show({
      controller: 'customer.addresses',
      templateUrl: 'assets/js/modules/customer/add-address/customer-address.html',
      parent: angular.element(document.body),
      targetEvent: ev,
      clickOutsideToClose: false,
      locals: {
        $dialogScope: {
          type: "Add"
        }
      }
    }).then(function (res) {
      if (res) {
        if (Object.keys(res).length) {
          if(!$scope.companyData.addresses){
            $scope.companyData.addresses = [];
          }
          $scope.companyData.addresses.push(res);
        }
      }
    });
  };

  $scope.OpenDialog = function (ev,source) {
    $mdDialog.show({
      controller: 'company.CustomerController',
      templateUrl: 'assets/js/modules/company/company-customer/company-customer.html',
      parent: angular.element(document.body),
      targetEvent: ev,
      clickOutsideToClose: false,
      locals: {
        $dialogScope: {
          type: "Add",
          source:source,
          userData : $scope.current_user.data
        }
      }
    }).then(function (res) {
      if (res) {
        if (Object.keys(res).length && res.type == 'Add' && source == 'customer') {
          if(!$scope.companyData.customers){
            $scope.companyData.customers = [];
          }
          $scope.companyData.customers.push(res);
        }
        if (Object.keys(res).length && res.type == 'Add' && source == 'project') {
          if(!$scope.companyData.projects){
            $scope.companyData.projects = [];
          }
          $scope.companyData.projects.push(res);
        }
        if (Object.keys(res).length && res.type == 'Add' && source == 'testimonial') {
          if(!$scope.companyData.testimonials){
            $scope.companyData.testimonials = [];
          }
          $scope.companyData.testimonials.push(res);
        }
      }
    });
  };

  $scope.EditDialog = function(ev,data,$index,source){
      $mdDialog.show({
        controller: 'company.CustomerController',
        templateUrl: 'assets/js/modules/company/company-customer/company-customer.html',
        parent: angular.element(document.body),
        targetEvent: ev,
        clickOutsideToClose: false,
        locals: {
          $dialogScope: {
            type: "Edit",
            source:source,
            userData : $scope.current_user.data,
            customerData : angular.copy(data)
          }
        }
      }).then(function (res) {
        if (res) {
          if(source == 'customer'){
            if(res.type == "Edit" && res && res.id) {
              $scope.companyData.customers = $scope.companyData.customers.map(function (item) {
                if (item.id == res.id) {
                    item = res;
                }
                return item;
              });
            }else{
              $scope.companyData.customers[$index] = res;
            }
          }else if(source == 'project'){
              if(res.type == "Edit" && res && res.id) {
                $scope.companyData.projects = $scope.companyData.projects.map(function (item) {
                  if (item.id == res.id) {
                      item = res;
                  }
                  return item;
                });
              }else{
                $scope.companyData.projects[$index] = res;
              }
          }else{
            if(source == 'testimonial'){
              if(res.type == "Edit" && res && res.id) {
                $scope.companyData.testimonials = $scope.companyData.testimonials.map(function (item) {
                  if (item.id == res.id) {
                      item = res;
                  }
                  return item;
                });
              }else{
                $scope.companyData.testimonials[$index] = res;
              }
            }
          }
         
        }
      });
  };

  $scope.deleteCustomer = function(index){
      $scope.companyData.customers.splice(index,1);
  };

  $scope.deleteProject = function(index){
    $scope.companyData.projects.splice(index,1);
  };

  $scope.deleteTestimonials = function(index){
    $scope.companyData.testimonials.splice(index,1);
  };

  $scope.EditAddress = function (ev, data, $index) {
    $mdDialog.show({
      controller: 'customer.addresses',
      templateUrl: 'assets/js/modules/customer/add-address/customer-address.html',
      parent: angular.element(document.body),
      targetEvent: ev,
      clickOutsideToClose: false,
      locals: {
        $dialogScope: {
          addressInfo: data,
          type: (data && data.id) ? "Edit" : "Modification"
        }
      }
    }).then(function (res) {
      if (res) {
        if (res.type == "Edit") {
          $scope.companyData.addresses = $scope.companyData.addresses.map(function (item) {
            if (item.id == res.id) {
              item = res;
            }
            return item;
          });
        } else {
          $scope.companyData.addresses[$index] = res;
        }
      }
    });
  };


  $scope.deleteAddress = function(index){
    $scope.companyData.addresses.splice(index,1);
  };

  $scope.deleteContacts = function(index){
    $scope.companyData.contact.splice(index,1);
  };

  $scope.saveCompanyInfo = function (data) {
    $scope.disabled = true;
    $scope.showload = 'false';
    data.aboutus_images = [];
    if($scope.taxData.length){
      var error;
      $scope.taxData.map(function (tax) {
        if (error) {
          return;
        }
        if (!tax.taxType) {
          Notification.success({
            message: 'please select tax type in tax details',
            positionX: 'right',
            positionY: 'top'
          });
          error = true;
          return;
        }
        if (!tax.number) {
          Notification.success({
            message: 'please enter number in tax details',
            positionX: 'right',
            positionY: 'top'
          });
          error = true;
          return;
        }

      });
    }
    if(!$scope.companyData.addresses){
      $scope.companyData.addresses  = [];
    }
    if(angular.isDate($scope.companyData.yearOfEstablishment)){
      data.establishment_year = dateService.convertDateToPython($scope.companyData.yearOfEstablishment);
    }else {
      data.establishment_year = null;
    }
    if(data.role_type && data.role_type.length){
      data.role_type = data.role_type.map(function(item){ return item.id;});
    }
    if(!data.revenue){
      data.revenue="0";
    }
    if(!data.profit){
      data.profit="0";
    }
    if(!data.catalogs){
       data.catalogs = [];
    }
    if(data.customers && data.customers.length){
      data.customers = data.customers.map(function(item){
          if(item && item.id){
            delete item.id;
          }
          item.customer_company = data.id;
          return item;
      });
    }
    if(data.projects && data.projects.length){
      data.projects = data.projects.map(function(item){
          if(item && item.id){
            delete item.id;
          }
          item.company = data.id;
          return item;
      });
    }
    if(data.testimonials && data.testimonials.length){
      data.testimonials = data.testimonials.map(function(item){
          if(item && item.id){
            delete item.id;
          }
          item.company = data.id;
          return item;
      });
    }
    if($scope.companyAttachments.length){
      data.aboutus_images = $scope.companyAttachments;
    }
    if ($scope.companyAboutusImages) {
      $scope.companyAboutusImages = $scope.companyAboutusImages.map(function(image){
             return image.path;
      });
      data.aboutus_images.length ? data.aboutus_images = data.aboutus_images.concat($scope.companyAboutusImages) : data.aboutus_images = $scope.companyAboutusImages;
        
    }

    if($scope.catalogImages.length){
      data.catalogs = $scope.catalogImages;
    }
    if($scope.companycatalogs){
      $scope.companycatalogs= $scope.companycatalogs.map(function(item){
        return item.path;
      });
      data.catalogs.length ? data.catalogs = data.catalogs.concat($scope.companycatalogs) : data.catalogs = $scope.companycatalogs;
    }
         
    if(data.id){
      CompanyService.update(data.id, data).then(function (data) {
        $scope.success = true;
        var tax;
        console.log('data saved');
        if($scope.deleteTaxData.length){
           DeleteTaxList();
        }
        if($scope.deleteBankData.length){
           DeleteBankList();
        }
        if($scope.taxData.length || $scope.bankData.length){
           if($scope.taxData.length){
            tax = true;
           }
           $scope.bankData.length ? SaveBankDetails(data,tax) : SaveTaxDetails(data);
        }else{
          RedirectPage(data);
        }
      },function (err) {
          $scope.disabled = false;
          $scope.error = err.data;
          Notification.error({
            message: err.data,
            positionX: 'right',
            positionY: 'top'
          });
          console.log(err);
        });
    }else{
      data.contact = [];
      if($state.current.name.includes('adminDashboard')){
       CompanyService.post(data).then(function(company){
          $scope.success = true;
          $scope.showload = 'false';
          Notification.success({
            message:'SuccessFully Created Company',
            positionX:'right',
            positionY:'top'
          });
          $timeout( function(){
            $window.location.reload();
        }, 1200 );
          $state.go("adminDashboard.company.list");
          $scope.show.edit = true;            
          $scope.editOne = false;
        },function(error){
          $scope.disabled = false;
          $scope.showload = 'false';
          Notification.error({
            message:error,
            positionX:'right',
            positionY:'top'
          });
          console.log('error occured: '+error);
        });
       
      }
      else{
        CompanyService.post(data).then(function(company){
          $scope.success = true;
          $scope.showload = 'false';
          Notification.success({
            message:'Created company. Please login.',
            positionX:'right',
            positionY:'top'
          });
          console.log('Created company');
          UserService.update($scope.current_user.data.id,{company:company.data.company_name}).then(function(){
            $timeout( function(){
              $state.go($state.$current.parent.name+'.view',{companyId: company.data.id});
            }, 1200 );
          });         
        },function(error){
          $scope.disabled = false;
          $scope.showload = 'false';
          Notification.error({
            message:error,
            positionX:'right',
            positionY:'top'
          });
          console.log('error occured: '+error);
        } );
      }  
    }
  };

  $scope.editDetails = function(){
    if($state.current.name.includes('adminDashboard')){
      $state.go($state.$current.parent.name + '.edit', {supplierId: $state.params.supplierId});
    }else{
      $state.go($state.$current.parent.name + '.edit', {companyId: $state.params.companyId});
    }
  };
 
  function SaveTaxDetails(companyInfo){
    var arr=[];
    $scope.taxData.map(function (item) {
      item.company = companyInfo.data.id;
      if(angular.isDate(item.validDate)){
        item.valid_date = dateService.convertDateToPython(item.validDate);
      }
      if(angular.isDate(item.issueDate)){
        item.issue_date = dateService.convertDateToPython(item.issueDate);
      }
      if(item && item.id){
        TaxService.update(item.id,item).then(function (result) {
            $log.log("updated Tax details");
        });
      }else{
         arr.push(item)
      }
    });
    if(arr.length){
      TaxService.post(arr).then(function(resp){
        RedirectPage(companyInfo);
      });
    }else{
       RedirectPage(companyInfo);
    }
   
  }

  function DeleteTaxList(){
    var arr=[];
    $scope.deleteTaxData.map(function(item){
      if(item.id){
        TaxService.delete(item.id).then(function(resp){
          arr.push(resp.data);
          if($scope.deleteTaxData.length === arr.length){
              $log.log("successfully deleted");
          } 
       },function(error){
              $log.error(error);
       });
      }
    })
  }

  function DeleteBankList(){
    var arr=[];
    $scope.deleteBankData.map(function(item){
      if(item.id){
        BankService.delete(item.id).then(function(resp){
          arr.push(resp.data);
          if($scope.deleteBankData.length === arr.length){
              $log.log("successfully deleted");
          } 
       },function(error){
              $log.error(error);
       });
      }
    })
  }

  function SaveBankDetails(data,value){
    var arr =[];
    var res=[];
    $scope.bankData.map(function(bank){
       if(bank && bank.id && bank.content == "modified"){
              BankService.update(bank.id,bank).then(function(results){
                res.push(results.data);
                if($scope.bankData.length == res.length){
                  if(value){
                    SaveTaxDetails(data);
                  }else{
                    RedirectPage(data);
                  }
                }
              });
       }else{
         if(!bank.content && !bank.id){
            arr.push(bank);
         }
       }

       if(arr.length){
        BankService.post(arr).then(function(results){
          if(value){
            SaveTaxDetails(data);
          }else{
            RedirectPage(data);
          }
        });
       }else{
        RedirectPage(data);
      }
    });
  }

  function RedirectPage(data){
      Notification.success({
        message: 'Successfully updated company.',
        positionX: 'right',
        positionY: 'top'
      });
    if ($state.current.name.includes('adminDashboard')) {
      $state.go("adminDashboard.company.list");
    }
    if ($state.current.name.includes('supplierDashboard')) {
      $scope.showload = 'false';
      company = $scope.current_user.data.company;   
      company.company_name = data.data.company_name;
      console.log('Successfully created company');
      $state.go($state.$current.parent.name + '.view', { companyId: $state.params.companyId });
    }
    if ($state.current.name.includes('buyerDashboard')) {
      $scope.showload = 'false';
      company = $scope.current_user.data.company;   
      company.company_name = data.data.company_name;
      console.log('Successfully created company');
      $state.go($state.$current.parent.name + '.view', { companyId: $state.params.companyId });
    }
  }

  $scope.backToDetails = function(){
    if($state.current.name.includes('adminDashboard')){
      $state.go("adminDashboard.company.list");
    }else{
      $state.go($state.$current.parent.name + '.view', {companyId: $state.params.companyId});
    }
  };

  $scope.establishmentTypeOther = true;
  $scope.establishmentTypeClicked = function(establishment_type) {
    if (establishment_type == "Other"){
      $scope.establishmentTypeOther = true;
    }else{
      $scope.establishmentTypeOther = false;
      $scope.companyData.establishment_type_other = null;
    }
  }
  $scope.companyTypeOther = true;
  $scope.companyTypeClicked = function(company_type) {
    if (company_type == "Other"){
      $scope.companyTypeOther = true;
    }else{
      $scope.companyTypeOther = false;
      $scope.companyData.company_type_other = null;
    }
  }
  
  $scope.companyImages = [];
  

  // $scope.uploadFiles = function(files,type){
  //   $scope.saveFile =  true;
  //   $scope.disabled =  true;
    
  //   $scope.companyImages = [];
  //   $scope.filesLength = files.length;
  //   files.forEach(function(file){
  //       uploadMultipleFilesFn(file,type);
  //   });
  //   files = [];
  // };

// $scope.uploadCatalogImages = function(files,type){
//     $scope.saveImages = true;
//     $scope.disabled =  true;
//     $scope.companyImages = [];
//     $scope.imagesLength = files.length;
//     files.forEach(function(file){
//       uploadMultipleCatalogsFn(file,type);
//     });
   
//     files = [];
//   };

  // $scope.uploadFiles = function (files) {
  //   files.forEach(function (file) {
  //     uploadMultipleFilesFn(file);
  //   });
  //   if($scope.companyData.aboutus_images){
  //     if($scope.companyData.aboutus_images.length){
  //       $scope.companyImages = $scope.companyImages.concat($scope.companyData.aboutus_images);
  //      }
  //   }
   
  //   files = [];
  // };

  // function uploadMultipleFilesFn(file) {
  //   var path = 'user/' + $scope.current_user.data.id + '/company/companyImages';

  //   s3Service.uploadFile(path, file, function (url) {
  //     $scope.companyImages.push(url);
  //     if($scope.companyImages.length === $scope.filesLength){
  //       $scope.disabled = false;
  //       Notification.success({
  //         message: 'Successfully uploaded file',
  //         positionX: 'right',
  //         positionY: 'top'
  //       });
  //     }
     
     
  //     $scope.companyImagesToUpload = [];
  //   }, function (error) {
  //     $scope.disabled = false;
  //     errorCallback(error);
  //   });
  // }

  // $scope.uploadCatalogImages = function (files) {
  //   files.forEach(function (file) {
  //     uploadMultipleCatalogsFn(file);
  //   });
  //   if($scope.companyData.catalogs){
  //     $scope.catalogImages = $scope.catalogImages.concat($scope.companyData.catalogs);
  //   }
  //   files = [];
  // };

  // function uploadMultipleCatalogsFn(file) {
  //   var path = 'user/' + $scope.current_user.data.id + '/company/companyAttachments';

  //   s3Service.uploadFile(path, file, function (url) {
  //     $scope.catalogImages.push(url);
  //     if($scope.imagesLength === $scope.catalogImages.length){
  //       $scope.disabled =  false;
  //       Notification.success({
  //         message: 'Successfully uploaded file',
  //         positionX: 'right',
  //         positionY: 'top'
  //       });
  //       $scope.catalogImagesToUpload = [];
  //     }
    
  //   }, function (error) {
  //     $scope.disabled =  false;
  //     errorCallback(error);
  //   });
  // }

  if($state.current.name.includes('adminDashboard')){
    $scope.BackToListPageDetails = true;
    
     // 
   }

  $scope.cancelPage = function () {
    if ($state.current.name.includes("adminDashboard.company.view")) {
      $state.go("adminDashboard.company.list");
    } else {
      $state.go("adminDashboard.user.list");
    }
  };
     
  $scope.cancelMultiple = function(){
     $state.go("adminDashboard.company.list");
  };

  $scope.EditTax = function(ev,data,$index){
    $mdDialog.show({
      controller: 'TaxController',
      templateUrl: 'assets/js/modules/customer/tax-details/tax-details.html',
      parent: angular.element(document.body),
      targetEvent: ev,
      clickOutsideToClose: false,
      locals: {
        $dialogScope: {
          taxInfo: $scope.taxData,
          tax : data,
          taxTypeList:$scope.taxTypeList,
          companyId:$scope.companyData.id,
          type : (data && data.id) ? "Edit" : "Modification"
        }
      }
    }).then(function (res) {
      if (res) {
        if (res.type == "Edit") {
          $scope.taxData = $scope.taxData.map(function(item){
               if(item.id == res.id){
                    item = res;
               }
               return item;
          });
        } else {
          $scope.taxData[$index] = res; 
        }
      }
    });
  };


  $scope.AddTax = function(ev){
    $mdDialog.show({
      controller: 'TaxController',
      templateUrl: 'assets/js/modules/customer/tax-details/tax-details.html',
      parent: angular.element(document.body),
      targetEvent: ev,
      clickOutsideToClose: false,
      locals: {
        $dialogScope: {
          type:"Add",
          bankInfo: $scope.taxData,
          taxTypeList:$scope.taxTypeList,
          companyId:$scope.companyData.id
        }
      }
    }).then(function (res) {
      if (res) {
        $scope.taxData.push(res);
      }
    });
  };

  $scope.AddBankDetails = function(ev){
    $mdDialog.show({
      controller: 'BankController',
      templateUrl: 'assets/js/modules/customer/bank-details/bank-details.html',
      parent: angular.element(document.body),
      targetEvent: ev,
      clickOutsideToClose: false,
      locals: {
        $dialogScope: {
          type:"Add",
          companyId:$scope.companyData.id
        }
      }
    }).then(function (res) {
      if (res) {
        $scope.bankData.push(res);
      }
    });
  };

  $scope.EditBankDetails = function(ev,data,$index){
    $mdDialog.show({
      controller: 'BankController',
      templateUrl: 'assets/js/modules/customer/bank-details/bank-details.html',
      parent: angular.element(document.body),
      targetEvent: ev,
      clickOutsideToClose: false,
      locals: {
        $dialogScope: {
          type : (data && data.id) ? "Edit" : "Modification",
          companyId:$scope.companyData.id,
          account : data
        }
      }
    }).then(function (res) {
      if (res) {
        if (res.type == "Edit") {
          $scope.bankData = $scope.bankData.map(function(item){
               if(item.id == res.id){
                    item = res;
               }
               return item;
          });
        } else {
          $scope.bankData[$index] = res; 
        }
      }
    });
  };
 
  
}])
.controller('layout.standard.toManageCompanyController', ['$scope', '$timeout', '$state', '$window', 'CompanyService', '$stateParams','Notification', 
function($scope, $timeout, $state, $window, CompanyService, $stateParams,Notification){

  $scope.clickEdit = function(){
      $scope.show.edit=true
      $scope.cancelEdit();
  };

  $scope.addMultipleCompanies = function(){
    $state.go("adminDashboard.company.multipleCompanies");
  };
 
  // $scope.cancelMultiple = function(){
  //    $state.go("adminDashboard.company.list");
  // };

  $scope.clickView = function(){
    $scope.cancelEdit();
  };

  $scope.editCompanyInfo = false; 
  $scope.selectedSupplier = "";
  if(window.innerWidth > 425){
    $scope.hideMore = true;
  }
  $scope.viewCompany = function(table_changes){
    $scope.companyItem = table_changes;
    if(table_changes.length === 0){
        Notification.error({
            message:'Please select atleast one item to view',
            positionX:'right',
            positionY:'top'
        });
        return;
    }
    if(table_changes.length > 1){
      Notification.error({
        message:'Please select only one item to view',
        positionX:'right',
        positionY:'top'
    });
    return;
    }
    $state.go("adminDashboard.company.view",{supplierId : table_changes[0][4]});    
};



$scope.createCompany = function(){
    $state.go("adminDashboard.company.create");
};

$scope.cancelEdit = function(){
    $scope.show.edit = true;            
    $scope.editOne = false;
};

$scope.cancelView = function(){
  $scope.editCompanyInfo = true;            
  $scope.editOne = false;
  $scope.show = {edit : false}; 

};
$scope.cancelCompanyEdit = function(){
  $scope.editCompanyInfo = false;            
  $scope.editOne = true;
  $scope.show = {edit : false}; 

};

  CompanyService.get().then(function(data){
    console.log(data.data.results);
    $scope.companysData = data.data.results;
  },function(err){
    console.log(err);
  });
  

  $scope.onCategoryChange = function(selectedcompany){
    var params = {companyId: selectedcompany.id};
    $state.go($state.$current.parent.name + '.company.view', params);
    console.log(selectedcompany);
  };

}]);
})();