(function () {
    var app = angular.module('app');
    app.controller('ReportsController', ['$scope', '$log', '$state', '$http', '$mdDialog', 'PurchaseRequisitionService', 'Notification','$stateParams','MessageService','POService','ProjectService','CustomerService','CsvService','CompanyService','UserService',
        function ($scope,$log, $state, $http, $mdDialog,PurchaseRequisitionService, Notification,$stateParams,MessageService,POService,ProjectService,CustomerService,CsvService,CompanyService,UserService) {
            $scope.pr = {};
            $scope.piFilter = {};
            
            POService.getSupplierValue({company:$scope.current_user.data.company.id}).then(function(res){
             $scope.POSuppliersPriceList = res.data;
             $scope.supplierLabels=[];
             $scope.supplierValues =[];
             $scope.POSuppliersPriceList.map(function(item){
                 $scope.supplierLabels = $scope.supplierLabels.concat(Object.keys(item));
                 $scope.supplierValues = $scope.supplierValues.concat(Number(Object.values(item)));
             });
            });

            POService.getProjectValue({company:$scope.current_user.data.company.id}).then(function(res){
                $scope.POProjectPriceList = res.data;
                $scope.Projectlabels=[];
                $scope.projectValues =[];
                $scope.POProjectPriceList.map(function(item){
                    $scope.Projectlabels = $scope.Projectlabels.concat(Object.keys(item));
                    $scope.projectValues = $scope.projectValues.concat(Number(Object.values(item)));
                });
            });

            POService.getBuyerValues({company:$scope.current_user.data.company.id}).then(function(res){
                $scope.POBuyerPriceList = res.data;
                $scope.buyerLabels=[];
                $scope.buyerValues =[];
                $scope.POBuyerPriceList.map(function(item){
                    $scope.buyerLabels = $scope.buyerLabels.concat(Object.keys(item));
                    $scope.buyerValues = $scope.buyerValues.concat(Number(Object.values(item)));
                });
            });

            $scope.colors = [ '#803690', '#004F8A', '#DCDCDC', '#46BFBD', '#FDB45C', '#949FB1', '#4D5360'];
            var formatDate = {
                    createDateAsUTC: function(date) {
                        if(date){
                            date = new Date(date);
                            return new Date(Date.UTC(date.getFullYear(), date.getMonth(), date.getDate(), date.getHours(), date.getMinutes(), date.getSeconds()));
                        }
                    },
                    getDays:function(){
                        return ["31","28","31","30","31","30","31","31","30","31","30","31"];
                    },
                    addDays:function addDays(theDate, days) {
                        return new Date(theDate.getTime() + days*24*60*60*1000);
                    },
                    getQuarter:function getQuarter(month){
                        var rem            = month%3;
                        
                        var quarterMonth   = (rem===0)?month-2:month-rem;
                        quarterMonth       = (month<3)?1:quarterMonth;
                        var year           = (new Date()).getFullYear();
    
                        return moment(new Date(year + '-' + quarterMonth + '-1')).format('YYYY-MM-DD');
                    },
                    getLastQuarter:function getLastQuarter(month){
                        var quarterMonth = 12;
                        var year           = (new Date()).getFullYear();
                        if(month>3){
                            var rem            = month%3;
                            quarterMonth   = month-rem;
                        }else{
                            year = year-1;
                        }
                        return moment(new Date(year+"-"+(quarterMonth-2)+"-1")).format('YYYY-MM-DD');
                    },
                    format:function(dateFormat,dateObj){
                        var momentDate = moment(dateObj);
                        var formatedDate = momentDate.format(dateFormat);
                        return formatedDate;
                    },
                    dateDiff:function(date1,date2,format){
                        var dateOne = moment(date1);
                        var dateTwo = moment(date2);
                        return dateTwo.diff(dateOne,"days");
                    },
                    getYesterday:function(){
                        var date = new Date();
                        date.setDate(date.getDate()-1);
                        return date.getFullYear() + "-"+(date.getMonth()+1)+"-"+date.getDate();
                    },
                    getDayBefor:function getDayBefore(today,days){
                        return today.setDate(today.getDate()-days);
                    },
                    getRecentMonday:function getRecentMonday(d){
                        d = new Date(d);
                        var day = d.getDay(),
                        diff = d.getDate() - day + (day === 0 ? -6:1); // adjust when day is sunday
                        return new Date(d.setDate(diff));
                    },
                    isLeapYear:function isLeapYear(year)
                    {
                        return ((year % 4 === 0) && (year % 100 !== 0)) || (year % 400 === 0);
                    },
                    getTimestampObject:function(loadState){
                        var params = {};
                        var month = null;
                        var year = null;
                        var lastDay = null;
    
                        if(loadState==="today"){
                            var start    = this.createDateAsUTC(new Date(moment().format('YYYY-MM-DD')+" 00:00:000")).getTime();
                            var until    = this.createDateAsUTC(new Date()).getTime();
                        }else if(loadState==="yesterday"){
                            var start    = new Date(this.getYesterday()+" 00:00:000").getTime();
                            var until    = new Date(this.getYesterday()+" 23:59:59").getTime();
                        }else if(loadState==="current-week"){
                            var start    = new Date(moment(this.getRecentMonday(new Date())).format("YYYY-MM-DD")+" 00:00:000").getTime(); 
                            var until    = new Date().getTime();
                        }else if(loadState==="last-week"){
                            var until    = new Date(moment(new Date(this.getDayBefor(this.getRecentMonday(new Date()),1))).format('YYYY-MM-DD')+" 23:59:59").getTime();
                            var start    = new Date(moment(new Date(this.getDayBefor(this.getRecentMonday(new Date()),7))).format('YYYY-MM-DD')+" 00:00:00").getTime();
                        }else if(loadState==="current-month"){
                            month           = (new Date()).getMonth()+1;
                            year            = (new Date()).getFullYear();
                            var start    = new Date(moment(new Date(year+"-"+month+"-1")).format('YYYY-MM-DD')+" 00:00:000").getTime();
                            var until    = new Date().getTime();
                        }else if(loadState==="last-month"){
                            month           = (new Date()).getMonth()+1;
                            year            = (new Date()).getFullYear();
                            if(month===1){
                                year = year-1;
                                month = 12;
                            }else{
                                month = month-1;
                            }
                            var start    = new Date(moment(new Date(year+"-"+month+"-1")).format('YYYY-MM-DD')+" 00:00:000").getTime();
                            lastDay         = (this.isLeapYear(year) && month===2)? 29:this.getDays()[month-1];
                            var until    = new Date(moment(new Date(year+"-"+month+"-"+lastDay)).format('YYYY-MM-DD')+" 23:59:59").getTime();
                        }else if(loadState==="current-quarter"){
                            month           = (new Date()).getMonth()+1;
                            var start    = new Date(this.getQuarter(month)+" 00:00:00").getTime();
                            var until    = new Date().getTime();
                        }else if(loadState==="last-quarter"){
                            month           = (new Date()).getMonth()+1;
                            var lastQuarter = (new Date(this.getQuarter(month))).getMonth()+1;
                            year            = (new Date(this.getQuarter(month))).getFullYear();
                            var lastQuarterEnd = (lastQuarter===1)?12:lastQuarter-1;
                            lastDay         = (this.isLeapYear(year) && lastQuarterEnd===2)? 29:this.getDays()[lastQuarterEnd-1];
                            var until    = new Date(moment(new Date(year+"-"+(lastQuarterEnd)+"-"+lastDay)).format('YYYY-MM-DD')+" 23:59:59").getTime();
                            var start    = new Date(moment(new Date(this.getLastQuarter(lastQuarter))).format('YYYY-MM-DD')+" 00:00:000").getTime();
                        }else if(loadState==="current-year"){
                            var currentYear = (new Date()).getFullYear();
                            var start    = new Date(moment(currentYear+"-1-1").format('YYYY-MM-DD')+" 00:00:000").getTime();
                            var until    = new Date().getTime();
                        }else if(loadState==="last-year"){
                            var lastYear = (new Date()).getFullYear()-1;
                            var start    = new Date(moment(lastYear+"-1-1").format('YYYY-MM-DD')+" 00:00:000").getTime();
                            var until    = new Date(moment(lastYear+"-12-31").format('YYYY-MM-DD')+" 23:59:59").getTime();
                        }else{
                            var start    = new Date(moment().format('YYYY-MM-DD')+" 00:00:000").getTime();
                            var until    = new Date().getTime();
                        }

                        var date = new Date(start).toISOString();
                        // var dateString = new Date(date.getTime() - (date.getTimezoneOffset() * 60000))
                        // .toISOString()
                        //                 .split("T")[0];
                        params.created__gte = date.replace(/['"]+/g, '');

                        var date2 = new Date(until).toISOString();
                        // var dateString2 = new Date(date2.getTime() - (date2.getTimezoneOffset() * 60000))
                        //                 .toISOString()
                        //                 .split("T")[0];
                        params.created__lte = date2.replace(/['"]+/g, '');
                        return params;
                    }
            };
       
            $scope.filter = {}; 

            $scope.timelineList = [{id:1,name:"Today",value:"today"},
                                    {id:1,name:"Yesterday",value:"yesterday"},
                                    {id:2,name:"Current Week",value:"current-week"},
                                    {id:3,name:"Last Week",value:"last-week"},
                                    {id:4,name:"Current Month",value:"current-month"},
                                    {id:5,name:"Last Month",value:"last-month"},
                                    {id:6,name:"Current Quarter",value:"current-quarter"},
                                    {id:7,name:"Last Quarter",value:"last-quarter"},
                                    {id:8,name:"Current Year",value:"current-year"},
                                    {id:9,name:"Last Year",value:"last-year"}
                                  ];

            $scope.uiGridOptions = {
                enableCellEditOnFocus: true,
                enableColumnResizing: true,
                enableFiltering: true,
                enableGridMenu: true,
                showGridFooter: true,
                showColumnFooter: true,
                fastWatch: true,
                rowIdentity: getRowId,
                getRowIdentity: getRowId,
                importerDataAddCallback: function importerDataAddCallback(grid, newObjects) {
                    $scope.myData = $scope.data.concat(newObjects);
                },
                columnDefs: [
                    {
                        field: 'created',
                        displayName: 'Date',
                        width: 150,
                        pinnedLeft: true,
                        enableCellEdit: true,
                        enableSorting: true
                    },
                    {
                        field: 'enquiry_number',
                        displayName: 'Enq #',
                        width: 200,
                        pinnedLeft: true,
                        enableCellEdit: true,
                        enableSorting: true
                    },
                    {
                        field: 'subject',
                        displayName: 'Enquiry Subject',
                        width: 150,
                        pinnedLeft: true,
                        enableCellEdit: true,
                        enableSorting: true
                    },
                    {
                        field: 'sentcount',
                        displayName: 'Enquiries sent(to no. of suppliers)',
                        width: 150,
                        pinnedLeft: true,
                        enableCellEdit: true,
                        enableSorting: true
                    },
                    {
                        field: 'regretedcount',
                        displayName: 'Regretted',
                        width: 150,
                        pinnedLeft: true,
                        enableCellEdit: true,
                        enableSorting: true
                    },
                    {
                        field: 'username',
                        displayName: 'Buyer',
                        width: 150,
                        pinnedLeft: true,
                        enableSorting: true,
                        enableCellEdit: false
                    },
                    {
                        field: 'enquiry_state',
                        displayName: 'Status',
                        width: 150,
                        pinnedLeft: true,
                        enableCellEdit: true
                    },
                    {
                        field: 'remarks',
                        displayName: 'Remarks',
                        width: 250,
                        pinnedLeft: true,
                        enableCellEdit: true
                    }
                ],
                onRegisterApi: function onRegisterApi(registeredApi) {
                    $scope.gridApi = registeredApi;
                }

            };

            ProjectService.getMainProjects().then(function (data) {
                $scope.projectsInfo = data.data;
                $scope.projectNames =[];
                $scope.projectsInfo.forEach(function (item) {
                    $scope.projectNames.push({ id: item.id, label: item.name });
                });
                $scope.projectNames = _.uniqBy($scope.projectNames, 'id');
            });

            function LoadEnquiriesData(){
                $scope.uiGridOptions.data = [];
                MessageService.getEnquirySent().then(function (data) {
                    $scope.uiGridOptions.data = data.data.results;
                    $scope.uiGridOptions.data = $scope.uiGridOptions.data.map(function(item){
                        item.username = `${item.owner.first_name} ${item.owner.last_name}`;
                        return item;
                    });
                });
            }

            if($scope.current_user && $scope.current_user.data && $scope.current_user.data.company){
                LoadEnquiriesData();
                $scope.buyersList = [];
                UserService.get({ company: $scope.current_user.data.company.id }).then(function (data) {
                    $scope.userData = data.data.results;
                    if (data.data.results.length) {
                        $scope.userData.map(function(item){
                            if(item.is_buyer){
                                item.username = `${item.first_name} ${item.last_name}`;
                                $scope.buyersList.push(item);
                            }
                        });
                    }
                }); 
            }

            $scope.applyFilter = function(data){
                if(Object.keys(data).length){
                    if(data && data.time){
                        var datevalues = formatDate.getTimestampObject(data.time);
                        data = Object.assign(data, datevalues);
                    }
                    MessageService.getEnquirySent(data).then(function(res){
                        $scope.uiGridOptions.data = [];
                        $scope.uiGridOptions.data = res.data.results;
                         $scope.uiGridOptions.data = $scope.uiGridOptions.data.map(function (item) {
                             item.username = `${item.owner.first_name} ${item.owner.last_name}`;
                             return item;
                         });
                     });
                }
            };
            
            $scope.clearFilter = function(type){
               
                if(type == 'PR'){
                    $scope.pr = {};
                    $scope.PRGridOptions.data = [];
                }else if(type == 'PRPIE'){
                    MessageService.statusCount().then(function (res) {
                        $scope.statusCount = res.data;
                        $scope.labels = [];
                        $scope.data = [];
                        $scope.statusCount.map(function (item) {
                            $scope.labels = $scope.labels.concat(Object.keys(item));
                            $scope.data = $scope.data.concat(Object.values(item));
                        });
                    });
                }else{
                    $scope.filter = {};
                    LoadEnquiriesData();
                }
            }


            function getRowId(row) {
                return row.id;
            }

            $scope.PRGridOptions = {
                data: $scope.items,
                enableCellEditOnFocus: true,
                enableColumnResizing: true,
                enableFiltering: true,
                enableGridMenu: true,
                showGridFooter: true,
                showColumnFooter: true,
                fastWatch: true,
                rowIdentity: getRowId,
                getRowIdentity: getRowId,
                importerDataAddCallback: function importerDataAddCallback(grid, newObjects) {
                    $scope.myData = $scope.data.concat(newObjects);
                },
                columnDefs: [
                    {
                        name: 'displayId',
                        displayName: 'S.No',
                        width: 150,
                        pinnedLeft: true,
                        enableSorting: true,
                    },
                    {
                        field: 'title',
                        displayName: 'Title',
                        width: 150,
                        pinnedLeft: true,
                        enableSorting: true
                    },
                    {
                        field: 'description',
                        displayName: 'Description',
                        width: 200,
                        pinnedLeft: true,
                        enableSorting: true
                    },
                    {
                        field: 'notes',
                        displayName: 'Item Note',
                        width: 100,
                        pinnedLeft: true,
                        enableSorting: true
                    },
                    {
                        field: 'buyer_part_number',
                        displayName: 'Buyer part Number',
                        width: 100,
                        pinnedLeft: true,
                        enableSorting: true
                    },
                    {
                        field: 'supplier_part_number',
                        displayName: 'Supplier Part Number',
                        width: 100,
                        pinnedLeft: true,
                        enableSorting: true
                    },
                    {
                        field: 'quantity_remaining',
                        displayName: 'Available Quantity',
                        width: 100,
                        pinnedLeft: true,
                        enableSorting: true,
                    },
                    {
                        field: 'selected_quantity',
                        displayName: 'Selected Quantity',
                        width: 100,
                        pinnedLeft: true,
                        enableSorting: true,
                    },
                    {
                        field: 'unit_measure',
                        displayName: 'Unit Of Measure',
                        width: 100,
                        pinnedLeft: true,
                    },
                    {
                        field: 'unit_price',
                        displayName: 'Unit Price',
                        width: 100,
                        pinnedLeft: true,
                    },
                    {
                        field: 'price_basis',
                        displayName: 'Price Basis',
                        width: 125,
                        pinnedLeft: true,
                    },
                    {
                        field: 'delivery_date',
                        displayName: 'Delivery Date',
                        width: 125,
                        pinnedLeft: true,
                    },
                    {
                        field: 'delivery_basis',
                        displayName: 'Delivery Basis',
                        width: 100,
                        pinnedLeft: true,
                    },
                    {
                        field: 'buyer_notes',
                        displayName: 'Buyer Notes',
                        width: 150,
                        pinnedLeft: true,
                    },
                    {
                        field: 'vat',
                        displayName: 'VAT',
                        width: 70,
                        pinnedLeft: true,
                    },
                    {
                        field: 'other_charges',
                        displayName: 'Other Charges',
                        width: 70,
                        pinnedLeft: true,
                    },
                    {
                        field: 'group.group_number',
                        displayName: 'PR Group',
                        width: 150,
                        pinnedLeft: true,
                    },
                    {
                        field: 'secondary_units',
                        displayName: 'Secondary Units',
                        width: 100,
                        pinnedLeft: true,
                    },
                    {
                        field: 'conversion_rate',
                        displayName: 'Conversion Rate',
                        width: 100,
                        pinnedLeft: true,
                    }
                ],
                onRegisterApi: function onRegisterApi(registeredApi) {
                    $scope.gridApi = registeredApi;
                }

            };


            $scope.PRFilter = function(data){
                PurchaseRequisitionService.get(data).then(function(res){
                   $scope.PRGridOptions.data = res.data.results;
                });
            };  

            MessageService.statusCount().then(function(res){
                 $scope.statusCount = res.data;
                 $scope.labels=[];
                 $scope.data =[];
                 $scope.statusCount.map(function(item){
                     $scope.labels = $scope.labels.concat(Object.keys(item));
                     $scope.data = $scope.data.concat(Object.values(item));
                 });
            });

            $scope.PIChartFilter = function(data){
                if(Object.keys(data).length){
                    if(data && data.time){
                        var datevalues = formatDate.getTimestampObject(data.time);
                        data = Object.assign(data, datevalues);
                    }
                    MessageService.statusCount(data).then(function(res){
                        $scope.statusCount = res.data;
                        $scope.labels=[];
                        $scope.data =[];
                        $scope.statusCount.map(function(item){
                            $scope.labels = $scope.labels.concat(Object.keys(item));
                            $scope.data = $scope.data.concat(Object.values(item));
                        });
                     });
                }
            };
        }]);
})();
