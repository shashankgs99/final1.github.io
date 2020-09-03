(function () {
  var app = angular.module('app');
  app.controller('InvoiceController', ['$scope', '$window', '$modal', '$log', '$state', 'Notification', '$http', 's3Service', 'CustomerService', '$rootScope', '$stateParams', 'InvoiceService', '$mdDialog', 'InvoicePackingService',
    function ($scope, $window, $modal, $log, $state, Notification, $http, s3Service, CustomerService, $rootScope, $stateParams, InvoiceService, $mdDialog, InvoicePackingService) {

      $scope.selectedInvoice = [];
      $scope.showLoader = true;
      loadInvoiceList({ page_size: 10, page: 1 });
      $scope.currentPage = 1;
      $scope.maxSize = 10;


      function NumInWords(number) {
        const first = ['', 'one ', 'two ', 'three ', 'four ', 'five ', 'six ', 'seven ', 'eight ', 'nine ', 'ten ', 'eleven ', 'twelve ', 'thirteen ', 'fourteen ', 'fifteen ', 'sixteen ', 'seventeen ', 'eighteen ', 'nineteen '];
        const tens = ['', '', 'twenty', 'thirty', 'forty', 'fifty', 'sixty', 'seventy', 'eighty', 'ninety'];
        const mad = ['', 'thousand', 'million', 'billion', 'trillion'];
        let word = '';

        for (let i = 0; i < mad.length; i++) {
          let tempNumber = number % (100 * Math.pow(1000, i));
          if (Math.floor(tempNumber / Math.pow(1000, i)) !== 0) {
            if (Math.floor(tempNumber / Math.pow(1000, i)) < 20) {
              word = first[Math.floor(tempNumber / Math.pow(1000, i))] + mad[i] + ' ' + word;
            } else {
              word = tens[Math.floor(tempNumber / (10 * Math.pow(1000, i)))] + '-' + first[Math.floor(tempNumber / Math.pow(1000, i)) % 10] + mad[i] + ' ' + word;
            }
          }

          tempNumber = number % (Math.pow(1000, i + 1));
          if (Math.floor(tempNumber / (100 * Math.pow(1000, i))) !== 0) word = first[Math.floor(tempNumber / (100 * Math.pow(1000, i)))] + 'hunderd ' + word;
        }
        return word;
      }

      $scope.$on('InvoiceFilters', function (event, data) {
        if (data) {
          loadInvoiceList(data);
        }
      });

      $scope.selectedValue = function (data, index, value) {
        if (value) {
          $scope.selectedInvoice.push(data);
        } else {
          $scope.selectedInvoice.splice(index, 1);
        }
      };

      $scope.AddInvoice = function () {
        if ($state.current.name.includes("supplierDashboard")) {
          $state.go("supplierDashboard.invoice.create");
        } else {
          $state.go("buyerDashboard.invoice.create");
        }
      };

      $scope.setPage = function (pageNo) {
        $scope.currentPage = pageNo;
        loadInvoiceList(10, pageNo);
      };

      function loadInvoiceList(data) {
        InvoiceService.get(data).then(function (data) {
          $scope.showLoader = false;
          $scope.count = data.data.count;
          $scope.invoiceList = data.data.results;
        }, function (err) {
          $scope.showLoader = false;
        });
      }

      $scope.EditInvoice = function (data) {
        if ($scope.selectedInvoice.length > 1) {
          Notification.error({
            message: 'please select one item to edit',
            positionX: 'right',
            positionY: 'top'
          });
          return;
        }
        if ($scope.selectedInvoice.length < 1) {
          Notification.error({
            message: 'please select atleast one item to edit',
            positionX: 'right',
            positionY: 'top'
          });
          return;
        }
        $state.go("supplierDashboard.invoice.edit", { invoiceId: $scope.selectedInvoice[0].id });
      };

      $scope.Viewinvoice = function (data) {
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
        $state.go("supplierDashboard.invoice.view", { invoiceId: data.id });
      };


      $scope.PackingList = function (data, ev) {
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


        InvoicePackingService.get({ invoice: data[0].id }).then(function (response) {
          $scope.count = response.data.count;
          $scope.packingItems = response.data.results;
          if ($scope.packingItems.length) {
            data.packingItems = $scope.packingItems;
            PrintPackingItems(data);
          } else {
            InvoiceService.getInvoiceItems({ invoice: data[0].id }).then(function (res) {
              $scope.invoiceItems = res.data.results;
              if ($scope.invoiceItems.length) {
                $scope.invoiceItems = $scope.invoiceItems.map(function (item) {
                  item.invoice = data[0].id;
                  return item;
                });
                return $mdDialog.show({
                  controller: 'layout.invoice.PackingListController',
                  templateUrl: 'assets/js/modules/invoice/packing-list/invoice-packing-list.html',
                  parent: angular.element(document.body),
                  targetEvent: ev,
                  multiple: true,
                  clickOutsideToClose: true,
                  locals: {
                    $dialogScope: {
                      items: $scope.invoiceItems
                    }
                  }
                }).then(function (data) {
                  if (data) {

                  }
                }, function (err) {

                });
              } else {
                Notification.error({
                  message: 'No Items in invoice',
                  positionX: 'right',
                  positionY: 'top'
                });
                return;
              }


            });
          }
        });


        // return $mdDialog.show({
        //   controller: 'layout.invoice.PackingListController',
        //   templateUrl: 'assets/js/modules/invoice/packing-list/invoice-packing-list.html',
        //   parent: angular.element(document.body),
        //   targetEvent: ev,
        //   multiple: true,
        //   clickOutsideToClose: true,
        //   locals: {
        //     $dialogScope: {
        //      // items: $scope.invoiceItems
        //     }
        //   }
        // }).then(function (data) {
        //   if (data) {
        //   }
        // }, function (err) {

        // });
      };


      // Print Packing Items
      function PrintPackingItems(items) {
        var data = items[0];
        var listno = data.invoice_number.split("-");
        var pllist_no = "PL-" + listno[1] + "-" + listno[2];
        console.log(pllist_no);
        var plData = {
          pl_number: pllist_no,
          invoice_number: data.invoice_number,
          invoice_date: data.invoice_date,
          supplier_name: data.invoice_from_name,
          invoice_from_address: {
            addressline1: data.invoice_from_address.addressline1,
            addressline2: data.invoice_from_address.addressline2,
            cityname: data.invoice_from_address.cityname,
            state: data.invoice_from_address.state,
            country: data.invoice_from_address.country
          },
          buyer_name: data.invoice_to_name,
          ship_to_name: data.invoice_ship_to_name
        };

        if (data.invoice_ship_to_address) {
          var invoice_ship_to_address = {
            addressline1: data.invoice_ship_to_address.addressline1,
            addressline2: data.invoice_ship_to_address.addressline2,
            cityname: data.invoice_ship_to_address.cityname,
            state: data.invoice_ship_to_address.state,
            country: data.invoice_ship_to_address.country
          }
          plData.invoice_ship_to_address = invoice_ship_to_address;
        }

        if (data.invoice_to_address) {
          var invoice_to_address = {
            addressline1: data.invoice_to_address.addressline1,
            addressline2: data.invoice_to_address.addressline2,
            cityname: data.invoice_to_address.cityname,
            state: data.invoice_to_address.state,
            country: data.invoice_to_address.country
          }
          plData.invoice_to_address = invoice_to_address;
        }

        if ($scope.current_user.data.company) {
          if ($scope.current_user.data.company.logo) {
            plData.logo = $scope.current_user.data.company.logo;
          }
          if ($scope.current_user.data.company.addresses) {
            if ($scope.current_user.data.company.addresses.length) {
              $scope.current_user.data.company.addresses.map(function (item) {
                if (item.id == data.so.supplier_address) {
                  plData.company_addressline1 = item.addressline1;
                  plData.company_addressline2 = item.addressline2;
                  plData.company_city = item.cityname;
                  plData.company_state = item.state;
                  plData.company_country = item.country;

                }
              });
            }

          }
          plData.company_name = $scope.current_user.data.company.company_name;

        }
        plData.items = items.packingItems;
        plData.so_number = data.so.so_number;
        plData.so_date = data.so.so_date;

        var body = { plData: plData };

        $http.post('/backend/print-packing-items/', body)
          .then(function (response) {
            $scope.tempalte = response.data;
            OpenPLTemplate($scope.tempalte);
            Notification.success({
              message: 'Successfully Printed',
              positionX: 'right',
              positionY: 'top'
            });
          }).catch(function (error) {
            Notification.error({
              message: 'Not Successfully Printed',
              positionX: 'right',
              positionY: 'top'
            });
          });

      }

      function OpenPLTemplate(data) {
        var content = window.open("", "newWindow", "width=1200,height=800");
        content.document.body.innerHTML = data;
      }


      // Print Invoice Form

      $scope.PrintInvoice = function (info) {
        if (info.length > 1) {
          Notification.error({
            message: 'please select one item',
            positionX: 'right',
            positionY: 'top'
          });
          return;
        }
        if (info.length < 1) {
          Notification.error({
            message: 'please select atleast one item',
            positionX: 'right',
            positionY: 'top'
          });
          return;
        }
        var data = info[0];

        var invoiceData = {
          invoice_number: data.invoice_number,
          invoice_date: data.invoice_date,
          order_number: data.order_number,
          order_date: data.order_date,
          total_price: data.total_price.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ","),
          vat_value: data.vat_value,
          total_price_with_tax: data.total_price_with_tax,
          created: data.created,
          invoice_from_address: {
            addressline1: data.invoice_from_address.addressline1,
            addressline2: data.invoice_from_address.addressline2,
            cityname: data.invoice_from_address.cityname,
            state: data.invoice_from_address.state,
            country: data.invoice_from_address.country
          },
          invoice_title: data.invoice_title,
          invoice_type: data.invoice_type,
        };

        if (data.invoice_from_name) {
          invoiceData.invoice_from_name = data.invoice_from_name;
        }
        if (data.invoice_to_name) {
          invoiceData.invoice_to_name = data.invoice_to_name;
        }
        if (data.invoice_ship_to_name) {
          invoiceData.invoice_ship_to_name = data.invoice_ship_to_name;
        }
        if (data.payment_terms) {
          invoiceData.payment_terms = data.payment_terms;
        }
        if (data.payment_through) {
          invoiceData.payment_through = data.payment_through;
        }
        if (data.invoice_from_contact_details) {
          invoiceData.invoice_from_contact = data.invoice_from_contact_details;
        }
        if (data.invoice_ship_to_contact_details) {
          invoiceData.invoice_ship_to_contact_details = data.invoice_ship_to_contact_details;
        }
        if (data.invoice_to_contact_details) {
          invoiceData.invoice_to_contact_details = data.invoice_to_contact_details;
        }
        if (data.invoice_ship_to_address) {
          var invoice_ship_to_address = {
            addressline1: data.invoice_ship_to_address.addressline1,
            addressline2: data.invoice_ship_to_address.addressline2,
            cityname: data.invoice_ship_to_address.cityname,
            state: data.invoice_ship_to_address.state,
            country: data.invoice_ship_to_address.country
          }
          invoiceData.invoice_ship_to_address = invoice_ship_to_address;
        }
        if (data) {
          var invoice_to_address = {
            addressline1: data.invoice_to_address.addressline1,
            addressline2: data.invoice_to_address.addressline2,
            cityname: data.invoice_to_address.cityname,
            state: data.invoice_to_address.state,
            country: data.invoice_to_address.country
          }
          invoiceData.invoice_to_address = invoice_to_address;
        }
        if ($scope.current_user.data.company) {
          if ($scope.current_user.data.company.logo) {
            invoiceData.logo = $scope.current_user.data.company.logo;
          }
          if ($scope.current_user.data.company.addresses) {
            if ($scope.current_user.data.company.addresses.length) {
              $scope.current_user.data.company.addresses.map(function (item) {
                if (item.id == data.so.supplier_address) {
                  invoiceData.company_addressline1 = item.addressline1;
                  invoiceData.company_addressline2 = item.addressline2;
                  invoiceData.company_city = item.cityname;
                  invoiceData.company_state = item.state;
                  invoiceData.company_country = item.country;

                }
              });
            }
          }
          invoiceData.company_name = $scope.current_user.data.company.company_name;

        }
        invoiceData.totalPriceInWords = NumInWords(parseInt(invoiceData.total_price_with_tax)),
          invoiceData.total_price_with_tax = data.total_price_with_tax.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");

        invoiceData.items = data.invoice_items;
        invoiceData.items = invoiceData.items.map(function (item) {
          item.so_serial_number = Number((item.so_item.item_number.split("-").pop()).split("_").pop());
          return item;
        });
        if (data.bank_details.length) {
          invoiceData.beneficiary_name = data.bank_details[0].beneficiary_name;
          invoiceData.branch_address = data.bank_details[0].branch_address;
          invoiceData.bank_name = data.bank_details[0].bank_name;
          invoiceData.account_number = data.bank_details[0].account_number;
          invoiceData.city = data.bank_details[0].city;
          invoiceData.country = data.bank_details[0].country;
          invoiceData.iban_code = data.bank_details[0].iban_code;
          invoiceData.ifsc_code = data.bank_details[0].ifsc_code;
          invoiceData.micr_code = data.bank_details[0].micr_code;
          invoiceData.pin_code = data.bank_details[0].pin_code;
          invoiceData.swift_number = data.bank_details[0].swift_number;
          invoiceData.state = data.bank_details[0].state;
        }
        invoiceData.so_number = data.so.so_number;
        invoiceData.so_date = data.so.so_date;
        invoiceData.currency = data.so.currency;

        var body = { invoiceData: invoiceData };

        $http.post('/backend/print-invoice/', body)
          .then(function (response) {
            $scope.tempalte = response.data;
            OpenTemplate($scope.tempalte);
            Notification.success({
              message: 'Successfully Printed',
              positionX: 'right',
              positionY: 'top'
            });
          }).catch(function (error) {
            Notification.error({
              message: 'Not Successfully Printed',
              positionX: 'right',
              positionY: 'top'
            });
          });

      };

      function OpenTemplate(data) {
        var content = window.open("", "newWindow", "width=1200,height=800");
        content.document.body.innerHTML = data;
      }


    }]);
})();

