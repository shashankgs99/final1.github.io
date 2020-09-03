
(function () {
    var app = angular.module('app');
    app.controller('send-enquiry', ['$scope', '$window', '$modal', '$log', '$state', 'Notification', 'MessageService', '$http', 's3Service', '$stateParams', 'UserService', '$timeout',
        function ($scope, $window, $modal, $log, $state, Notification, MessageService, $http, s3Service, $stateParams, UserService, $timeout) {

            var userData;
            var directoriesData = [];
            $scope.messages_text;

            function getType() {
                var type;

                if ($stateParams.inventory && $stateParams.rental) {
                    type = "Rental";
                    return type;
                } else if ($stateParams.inventory && !$stateParams.rental) {
                    type = "Inventory";
                    return type;
                } else {
                    type = "Directory";
                    return type;
                }
            }

            var type = getType();
            $scope.fileUploads = [];
            var fileAttachments = [];
            if (!$scope.fileUploads.length) {
                var file = {};
                file.add = true;
                $scope.fileUploads.push(file);
            }

            $scope.send_enquiry_subject = "Enquiry for " + type;
            userData = $scope.userInfo;
            $scope.messages_text =  userData.signature ? ("<br/><br/>" +userData.signature) :'';
            if (userData) {
                $scope.sender_name = userData.first_name;
                $scope.sender_email = userData.email;
            }
            if ($scope.message.length) {
                var supplierEmails = $scope.message.map(function (item) {
                    return item.supplierEmail;
                });
                supplierEmails = supplierEmails.filter(function (x, i, a) {
                    return a.indexOf(x) == i;
                });
            } else {
                if ($scope.message.supplierEmail) {
                    supplierEmails = $scope.message.supplierEmail;
                } else {
                    if ($scope.message.supplier_company) {
                        var companyName = $scope.message.supplier_company.company_name?$scope.message.supplier_company.company_name:$scope.message.supplier_company;
                        UserService.getCompanyEmail({ company: companyName }).then(function (res) {
                            if (res.data && res.data.length) {
                                $scope.message.supplierEmail = res.data[0];
                            } else {
                                $scope.message.supplierEmail = "info@supplierscave.com";
                            }
                        });
                    }
                    else {
                        $scope.message.supplierEmail = "info@supplierscave.com";
                    }
                }
            }

            $scope.AddUploadFiles = function () {
                var file = {};
                file.remove = true;
                $scope.fileUploads.push(file);
            };
            $scope.removeFiles = function (files, index) {
                files.splice(index, 1);
                fileAttachments.splice(index, 1);
            };
            $scope.uploadFile = function (file, $index) {
                var upload = false;
                var currentUserId = userData.id;
                var path = 'user/' + currentUserId + '/directory/multiFile';

                s3Service.uploadFile(path, file, function (url) {
                    if (fileAttachments.length) {
                        fileAttachments.forEach(function (item) {
                            if (item.index == $index) {
                                upload = true;
                                item.url = url;
                            }
                        });
                        if (!upload) {
                            fileAttachments.push({ url: url, index: $index });
                        }
                    } else {
                        fileAttachments.push({ url: url, index: $index });
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
            directoriesData.push($scope.message);
            $scope.tinymceOptions = {
                resize: false,
                width: 1160,
                height: 130,
                plugins: 'print textcolor',
                toolbar: "undo redo styleselect bold italic print forecolor backcolor",
                setup: function (ed) {
                    ed.on('NodeChange', function (e) {
                        $scope.messages_text = ed.getContent();
                    });
                }
            };

            $scope.message.supplier = supplierEmails;

            $scope.send = function (sender_email, sender_mobile, send_enquiry_subject, messages_text, Emails, items) {
                if (!messages_text) {
                    Notification.error({
                        message: 'Please Enter Message',
                        positionX: 'right',
                        positionY: 'top'
                    });
                    return;
                }
                var emailBody = {};
                if (fileAttachments.length) {
                    emailBody.attachments = fileAttachments.map(function (item) {
                        var atch = {};
                        if(item.url) {
                          atch.url = item.url;
                          atch.fileName = item.url.split('/').pop();
                        }
                        return atch;
                    });
                }   

                if(messages_text){
                    emailBody.message = messages_text; 
                }
                
                emailBody.subject = send_enquiry_subject;
                emailBody.buyer = {
                    name: $scope.userInfo.first_name + ' ' +$scope.userInfo.last_name,
                    email: $scope.userInfo.email,
                    companyName: $scope.userInfo.company?$scope.userInfo.company.company_name:null
                }
          
                var result = _.groupBy($scope.message, 'supplierEmail');

                var suppliers = [];
                var products = [];

                for (var key in result) {
                    var item = {};
                    var inventory = [];
                    item.subject = send_enquiry_subject;
                    item.message = messages_text;
                    item.sender = userData.id;
                    var demo = result[key];
                    demo.forEach(function (item) {
                        inventory.push(item.id);
                    });
                    if ($stateParams.inventory) {
                        item.inventory = inventory;
                    } else {
                        item.directory = inventory;
                    }

                    item.sender_email = sender_email;
                    item.sender_mobile = sender_mobile;
                    item.supplier_company = result[key][0].supplier_company.id;
                    if(fileAttachments.length){
                        item.attachments = fileAttachments.map(function(item){ return item.url;});
                    }                    
                    products.push(item);

                    // for email
                    var supplier = {};
                    supplier.email = key;
                    if(demo[0].supplier_company && demo[0].supplier_company.company_name){
                        supplier.name = demo[0].supplier_company.company_name;
                    }else{
                        supplier.name = "Supplierscave.com";
                    }
                    supplier.itemsCount = demo.length;
                    supplier.items = demo.map(function(prod){
                        var item = {};
                        item.title = prod.title;
                        item.category = prod.category.category_id;
                        var type = getType();
                        if(type === 'Directory'){
                            item.url = '/directory/details/'+prod.id;
                        }else if(type === 'Inventory'){
                            item.url = '/inventory/details/'+prod.id;
                        }else if(type === 'Rental'){
                            item.url = '/rental/details/'+prod.id;
                        }
                        return item;
                    });
                    suppliers.push(supplier);
                };

                $http.get('/sendgrid/send-Enquiry/',
                {
                    params: {
                        suppliers: JSON.stringify(suppliers),
                        emailBody: emailBody
                    }
                }).then(function (response) {
                    Notification.success({
                        message: 'Sent email to the Email Address specified',
                        positionX: 'right',
                        positionY: 'top'
                    });                    

                    MessageService.post(products).then(function (result) {
                        Notification.success({
                            message: 'Message Sent',
                            positionX: 'right',
                            positionY: 'top'
                        });
                        $timeout(function () {
                            $window.location.reload();
                        }, 3000);
                    });
                    $scope.ok();
                }).catch(function (error) {
                    Notification.error({
                        message: 'Something went wrong. Please try again.',
                        positionX: 'right',
                        positionY: 'top'
                    });
                });

            };
            $scope.SelectedRows = function (sender_name, sender_email, send_enquiry_subject, messages_text, supplierEmail) {
                var uploadedFiles;
                var producturl;
                var messages = [];
                var emailBody = {};
                var message= {};
                if (!messages_text) {
                    Notification.error({
                        message: 'Please Enter Message',
                        positionX: 'right',
                        positionY: 'top'
                    });
                    return;
                }
                if (fileAttachments.length) {
                    emailBody.attachments = fileAttachments.map(function (item) {
                        var atch = {};
                        if (item.url) {
                            atch.url = item.url;
                            atch.fileName = item.url.split('/').pop();
                        }
                        return atch;
                    });
                }
                emailBody.message = messages_text;
                emailBody.subject = send_enquiry_subject;
                emailBody.buyer = {
                    name: $scope.userInfo.first_name + ' ' + $scope.userInfo.last_name,
                    email: $scope.userInfo.email,
                    companyName: $scope.userInfo.company ? $scope.userInfo.company.company_name : null
                }

                // for email
                var supplier = {};
                supplier.email = supplierEmail;
                supplier.name = $scope.message.supplier_company ? ($scope.message.supplier_company.company_name ? $scope.message.supplier_company.company_name : $scope.message.supplier_company) : 'Supplierscave.com';
                supplier.itemsCount = 1;
                var type = getType();
                if (type === 'Directory') {
                    producturl = '/directory/details/' + $scope.message.id;
                }else if(type === 'Inventory') {
                    producturl = '/inventory/details/' + $scope.message.id;
                }else if(type === 'Rental'){
                    producturl = '/rental/details/' + $scope.message.id;
                }
                supplier.items = [{
                    title: $scope.message.title,
                    category: $scope.message.category.category_id,
                    url: producturl
                }];
                
                if (fileAttachments.length) {
                    uploadedFiles = fileAttachments.map(function (item) { return item.url; });
                }

                if ($stateParams.inventory) {
                    message.inventory = directoriesData.map(function (item) { return item.id; });
                } else {
                    message.directory = directoriesData.map(function (item) { return item.id; });
                }

                message.subject = send_enquiry_subject;
                message.message = messages_text;
                message.sender = userData.id;
                message.sender_name = sender_name;
                message.sender_email = sender_email;
                message.supplier_company = $scope.message.supplier_company.id ? $scope.message.supplier_company.id : $scope.message.supplier_company_id;
                message.attachments = uploadedFiles;
                
                messages.push(message);
                $http.get('/sendgrid/send-Enquiry-single/',
                    {
                        params: {
                            supplier: JSON.stringify(supplier),
                            emailBody: emailBody,
                            supplierEmail: supplierEmail
                        }
                    }).then(function (response) {
                        Notification.success({
                            message: 'Sent email to the Email Address specified',
                            positionX: 'right',
                            positionY: 'top'
                        });
                        MessageService.post(messages).then(function (result) {
                            Notification.success({
                                message: 'Message Sent',
                                positionX: 'right',
                                positionY: 'top'
                            });
                            $timeout(function () {
                                $window.location.reload();
                            }, 1200);
                        });
                    }).catch(function (error) {
                        Notification.error({
                            message: 'Something went wrong. Please try again.',
                            positionX: 'right',
                            positionY: 'top'
                        });
                    });
            }
        }]);
})();