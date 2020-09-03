(function(){
    var app = angular.module('app');
  
    // Factory are better than Services
  
    app.factory('CsvService',['$injector',function($scope,$injector){
        var factory = {};
        factory.importData = function(industry,item){
          //$scope.industryType=industry;
          
          $scope.itemType=item;
        }

       factory.csvParser=function(strData, serviceName,supplier,strDelimiter,selectedIndustry){
              
               if(serviceName === 'DirectoryService'){
                  $scope.supplier = supplier;
               }  
               
                 // Check to see if the delimiter is defined. If not,
                // then default to comma.
                strDelimiter = (strDelimiter || ",");
        
                // Create a regular expression to parse the CSV values.
                var objPattern = new RegExp(
                    (
                        // Delimiters.
                        "(\\" + strDelimiter + "|\\r?\\n|\\r|^)" +
        
                        // Quoted fields.
                        "(?:\"([^\"]*(?:\"\"[^\"]*)*)\"|" +
        
                        // Standard fields.
                        "([^\"\\" + strDelimiter + "\\r\\n]*))"
                    ),
                    "gi"
                    );
        
        
                // Create an array to hold our data. Give the array
                // a default empty first row.
                var arrData = [[]];
        
                // Create an array to hold our individual pattern
                // matching groups.
                var arrMatches = null;
        
        
                // Keep looping over the regular expression matches
                // until we can no longer find a match.
                while (arrMatches = objPattern.exec( strData )){
        
                    // Get the delimiter that was found.
                    var strMatchedDelimiter = arrMatches[ 1 ];
        
                    // Check to see if the given delimiter has a length
                    // (is not the start of string) and if it matches
                    // field delimiter. If id does not, then we know
                    // that this delimiter is a row delimiter.
                    if (
                        strMatchedDelimiter.length &&
                        strMatchedDelimiter !== strDelimiter
                        ){
        
                        // Since we have reached a new row of data,
                        // add an empty row to our data array.
                        arrData.push( [] );
        
                    }
        
                    var strMatchedValue;
        
                    // Now that we have our delimiter out of the way,
                    // let's check to see which kind of value we
                    // captured (quoted or unquoted).
                    if (arrMatches[ 2 ]){
        
                        // We found a quoted value. When we capture
                        // this value, unescape any double quotes.
                        strMatchedValue = arrMatches[ 2 ].replace(
                            new RegExp( "\"\"", "g" ),
                            "\""
                            );
        
                    } else {
        
                        // We found a non-quoted value.
                        strMatchedValue = arrMatches[ 3 ];
        
                    }
        
        
                    // Now that we have our value string, let's add
                    // it to the data array.
                    arrData[ arrData.length - 1 ].push( strMatchedValue );
                }
                var i,j,k;
                var countBlankRows = 0;
                for(j=0; j<arrData.length;j++){
                    for( k=0;k<arrData[j].length;k++){
                        var cell = arrData[j][k];
                        if(cell !== ''){
                            break;
                        }
                    }
                    if(k===arrData[j].length){
                        countBlankRows++;
                    }else{
                      break;
                    }
                }
                
                if(countBlankRows > 0){
                    arrData.splice(0,countBlankRows);
                }
                var countBlankColumns = 0;
                for(i=0; i<arrData[0].length;i++){
                    var cell = arrData[0][i];
                    if(cell === ''){
                        countBlankColumns++;
                    }else{
                        break;
                    }
                }
                if(countBlankColumns > 0){
                    arrData.map(function(row){
                        row.splice(0,countBlankColumns);
                    });
                }
                var fieldNames = angular.copy(arrData[0]);
                fieldNames = mapFieldNames(fieldNames,serviceName);
                arrData.splice(0,1);
                
                var data = [];
                for(j=0; j<arrData.length;j++){
                    var obj = {};
                    for(k=0;k<arrData[j].length;k++)
                    {
                      if(arrData[j][k]){
                        if(arrData[j][k]){
                            obj[fieldNames[k]] = arrData[j][k];
                        }                        
                        if(selectedIndustry){
                          obj.industry=selectedIndustry.map(function(item){return item.id;});
                        }
                        if($scope.itemType){
                          obj.stock_or_inventory=$scope.itemType;
                        }
                        if($scope.supplier){  
                          obj.supplier_company = $scope.supplier;
                        }
                      }
                    }
                    data.push(obj);
                }     
                return data;
                // Return the parsed data.
            }
        
            function mapFieldNames(fieldNames,serviceName){
                var mappedFields = [];
                if(serviceName === 'InventoryService' ||serviceName  === 'DirectoryService'){
                  fieldNames.forEach(function(field){
                    field = field.toLowerCase();
                    if(field === 'category'){
                        field = 'category_name';
                    }else if(field.includes('secondary')){
                        field = 'sub_sub_category';
                    }else if(field.includes('tertiary')){
                        field = 'sub_sub_sub_category';
                    }else if(field.includes('sub')){
                        field = 'sub_category';
                    }else if(field.includes('construction')){
                        field = 'material';
                    }else if(field.includes('grade')){
                        field = 'grade';
                    }else if(field.includes('standard')){
                        field = 'standard';
                    }else if(field.includes('measure')){
                        field = 'unit_of_measure';
                    }else if(field.includes('price')){
                        field = 'unit_price';
                    }else if(field.includes('a(x)')){
                        field = 'a_b_c';                        
                    }else if(field.includes('dimension') && field.includes('a')){
                        field = 'dimension_a';
                    }else if(field.includes('dimension') && field.includes('b')){
                        field = 'dimension_b';
                    }else if(field.includes('dimension') && field.includes('c')){
                        field = 'dimension_c';
                    }else if(field.includes('unit') && field.includes('a')){
                        field = 'unit_a';
                    }else if(field.includes('unit') && field.includes('b')){
                        field = 'unit_b';
                    }else if(field.includes('unit') && field.includes('c')){
                        field = 'unit_c';
                    }else if(field.includes('total')){
                        field = 'total_quantity';
                    }else if(field.includes('sold')){
                        field = 'quantity_sold';
                    }else if(field.includes('available')){
                        field = 'available_quantity';
                    }else if(field.includes('manufacturer')){
                        field = 'manufacturer_company';
                    }else if(field.includes('rental')){
                        field = 'rental_period';
                    }else if(field.includes('supplier')){
                        field = 'supplier_company';
                    }else if(field.includes('country')){
                        field = 'country';
                    }else if(field.includes('state')){
                        field = 'state';
                    }else if(field.includes('city')){
                        field = 'city_draft';
                    }
                    mappedFields.push(field);
                });
                return mappedFields;
            }else if(serviceName === 'UserService'){
                    
                fieldNames.forEach(function (field) {
                     field = field.toLowerCase();
                    if(field.includes('password')){
                        field = 'password';
                    }else if(field.includes('superuser')){
                        field = 'is_superuser';
                    }else if(field.includes('first')&& field.includes('name')){
                        field = 'first_name';
                    }else if(field.includes('company') && field.includes('name')){
                        field = 'company';
                    }else if(field.includes('last')&& field.includes('name')){
                        field = 'last_name';
                    }else if(field.includes('staff')){
                        field = 'is_staff';
                    }else if(field.includes('active')){
                        field = 'is_active';
                    }else if(field.includes('username')){
                        field = 'username';
                    }else if(field.includes('email') && field.includes('verified')) {
                        field = 'is_email_verified';
                    }else if(field.includes('email') && field.includes('verificationhash')){
                      field = 'email_verification_hash';
                    }else if(field.includes('email')){
                        field = 'email';
                    }else if(field.includes('avatar')){
                        field = 'avatar';
                    }else if(field.includes('image')){
                        field = 'image';
                    }else if(field.includes('buyer')){
                        field = 'is_buyer';
                    }else if(field.includes('supplier') && field.includes('admin')){
                      field = 'is_admin_supplier';
                    }else if(field.includes('supplier')){
                      field = 'is_seller';
                    }else if(field.includes('verified')){
                      field = 'is_verified';
                    }else if(field.includes('phone')){
                      field = 'contact_no';
                    }else if(field.includes('country') && field.includes('code')){
                        field = 'country_code';
                    }else if(field.includes('created')){
                      field = 'created';
                    }else if(field.includes('city')){
                        field = 'location_city';
                    } else if(field.includes('country')){
                        field = 'location_country';
                    }
                    // else if(field.includes('salute')){
                    //     field = 'salute';
                    // }else if(field.includes('state')){
                    //         field = 'state';
                    //     }
                   mappedFields.push(field);
                });    
                return mappedFields;
            }
            else if(serviceName === 'CompanyService'){
                    
                fieldNames.forEach(function (field) {
                     field = field.toLowerCase();
                    if(field.includes('supplier')&& field.includes('name')){
                        field = 'company_name';
                    }else if(field.includes('logo')){
                        field = 'logo';
                    }else if(field.includes('website')){
                        field = 'website';
                    }else if (field.includes('about') && field.includes('us') && field.includes('text')) {
                        field = 'aboutus_text';
                    }else if (field.includes('about') && field.includes('us')) {
                        field = 'aboutus_text';
                    }else if (field.includes('currency')) {
                        field = 'profit_currency';
                    } else if (field.includes('establishment') && field.includes('type')) {
                        field = 'establishment_type';
                    }else if(field.includes('establishment') &&  field.includes('type') && field.includes('other') ){
                        field = 'establishment_type_other';
                    }else if(field.includes('company') && field.includes('type')){
                        field = 'company_type';
                    }else if(field.includes('role') && field.includes('type')){
                        field = 'role_type';
                    }else if(field.includes('company') && field.includes('type') && field.includes('other')){
                        field = 'company_type_other';
                    }else if(field.includes('seller')){
                        field = 'is_seller';
                    }else if(field.includes('buyer')){
                        field = 'is_buyer';
                    }else if(field.includes('establishment')&& field.includes('year')) {
                        field = 'establishment_year';
                    }else if(field.includes('revenue')){
                      field = 'revenue';
                    }else if(field.includes('revenue')&& field.includes('year')){
                        field = 'revenue_year';
                    }else if(field.includes('profit')){
                        field = 'profit';
                    }else if(field.includes('financial')&& field.includes('year')){
                        field = 'financial_year';
                    } else if (field.includes('contact') && field.includes('person')&& field.includes('email')) {
                        field = 'emailid1';
                    }else if (field.includes('contact') && field.includes('person')&& field.includes('number') && field.includes('1')){
                        field = 'phonenumber1';
                    }else if (field.includes('contact') && field.includes('person')&& field.includes('number') && field.includes('2')){
                        field = 'phonenumber2';
                    } else if (field.includes('address')) {
                        field = 'address';
                    } else if (field.includes('city')) {
                        field = 'city';
                    }else if (field.includes('state')) {
                        field = 'state';
                    }else if (field.includes('country')) {
                        field = 'country';
                    }
                    mappedFields.push(field);
                });     
                return mappedFields;
            }
            else if(serviceName === 'MessageService'){
                    
                fieldNames.forEach(function (field) {
                     field = field.toLowerCase();
                    if(field.includes('item')&& field.includes('title')){
                        field = 'title';
                    }else if(field.includes('description')){
                        field = 'description';
                    }else if(field.includes('unit')&& field.includes('price')){
                        field = 'unit_price';
                    }else if(field.includes('tertiary') && field.includes('sub')&& field.includes('category')){
                        field = 'sub_sub_sub_category';
                    }else if(field.includes('secondary') && field.includes('sub')&& field.includes('category')){
                        field = 'sub_sub_category';
                    }else if(field.includes('sub')&& field.includes('category')){
                        field = 'sub_category';
                    }else if(field.includes('category')){
                        field = 'category';
                    }else if(field.includes('unit') && field.includes('of') && field.includes('measure')){
                        field = 'unit_measure';
                    }else if(field.includes('material') &&  field.includes('of') && field.includes('construction') ){
                        field = 'material';
                    }else if(field.includes('material') && field.includes('grade')){
                        field = 'grade';
                    }else if(field.includes('dimension') && field.includes('a')){
                        field = 'dimension_a';
                    }else if(field.includes('dimension') && field.includes('b')){
                        field = 'dimension_b';
                    }else if(field.includes('dimension') && field.includes('c')){
                        field = 'dimension_c';
                    }else if(field.includes('unit') && field.includes('a')){
                        field = 'unit_a';
                    }else if(field.includes('unit') && field.includes('b')){
                        field = 'unit_b';
                    }else if(field.includes('unit') && field.includes('c')){
                        field = 'unit_c';
                    }else if(field.includes('material') && field.includes('specification') && field.includes('standard')){
                        field = 'specification';
                    }else if(field.includes('total')&& field.includes('quantity')) {
                        field = 'total_quantity';
                    }else if(field.includes('buyer')&& field.includes('notes')){
                        field = 'buyer_notes';
                    }else if(field.includes('quantity')&& field.includes('offered')){
                        field = 'quantity_offered';
                    } else if (field.includes('total') && field.includes('price')) {
                        field = 'total_price';
                    }else if (field.includes('price') && field.includes('basis')) {
                        field = 'price_basis';
                    } else if (field.includes('currency')) {
                        field = 'currency';
                    } else if (field.includes('delivery') && field.includes('basis')) {
                        field = 'deliver_basis';
                    } else if (field.includes('delivery')) {
                        field = 'delivery';
                    }else if (field.includes('supplier')&& field.includes('notes')) {
                        field = 'supplier_notes';
                    }
                    mappedFields.push(field);
                });     
                return mappedFields;
            }
            else if(serviceName === 'MTOService'){
                    
                fieldNames.forEach(function (field) {
                     field = field.toLowerCase();
                    if(field.includes('item')&& field.includes('title')){
                        field = 'title';
                    }else if(field.includes('description')){
                        field = 'description';
                    }else if(field.includes('unit')&& field.includes('price')){
                        field = 'unit_price';
                    }else if(field.includes('tertiary') && field.includes('sub')&& field.includes('category')){
                        field = 'sub_sub_sub_category';
                    }else if(field.includes('secondary') && field.includes('sub')&& field.includes('category')){
                        field = 'sub_sub_category';
                    }else if(field.includes('sub')&& field.includes('category')){
                        field = 'sub_category';
                    }else if(field.includes('category')){
                        field = 'category';
                    }else if(field.includes('unit') && field.includes('of') && field.includes('measure')){
                        field = 'unit_measure';
                    }else if(field.includes('material') &&  field.includes('of') && field.includes('construction') ){
                        field = 'material';
                    }else if(field.includes('material') && field.includes('grade')){
                        field = 'grade';
                    }else if(field.includes('dimension') && field.includes('a')){
                        field = 'dimension_a';
                    }else if(field.includes('dimension') && field.includes('b')){
                        field = 'dimension_b';
                    }else if(field.includes('dimension') && field.includes('c')){
                        field = 'dimension_c';
                    }else if(field.includes('unit') && field.includes('a')){
                        field = 'unit_a';
                    }else if(field.includes('unit') && field.includes('b')){
                        field = 'unit_b';
                    }else if(field.includes('unit') && field.includes('c')){
                        field = 'unit_c';
                    }else if(field.includes('material') && field.includes('specification') && field.includes('standard')){
                        field = 'specification';
                    }else if(field.includes('total')&& field.includes('quantity')) {
                        field = 'total_quantity';
                    }else if(field.includes('buyer')&& field.includes('notes')){
                        field = 'buyer_notes';
                    }else if(field.includes('quantity')&& field.includes('offered')){
                        field = 'quantity_offered';
                    } else if (field.includes('total') && field.includes('price')) {
                        field = 'total_price';
                    }else if (field.includes('price') && field.includes('basis')) {
                        field = 'price_basis';
                    } else if (field.includes('currency')) {
                        field = 'currency';
                    } else if (field.includes('delivery') && field.includes('basis')) {
                        field = 'deliver_basis';
                    } else if (field.includes('delivery')) {
                        field = 'delivery';
                    }else if (field.includes('supplier')&& field.includes('notes')) {
                        field = 'supplier_notes';
                    }
                    mappedFields.push(field);
                });     
                return mappedFields;
            }else if(serviceName === 'CustomerService'){
                    
                fieldNames.forEach(function (field) {
                     field = field.toLowerCase();
                    if(field.includes('customer')&& field.includes('name')){
                        field = 'name';
                    }else if(field.includes('supplier')&& field.includes('name')){
                        field = 'name';
                    }else if(field.includes('website')){
                        field = 'website';
                    }else if(field.includes('company') && field.includes('size')){
                        field = 'company_type';
                    }else if(field.includes('company') && field.includes('type')){
                        field = 'role_type';
                    }else if(field.includes('company') && field.includes('mobile') && field.includes('country')&& field.includes('code')){
                        field = 'countryCode1';
                    }else if(field.includes('company') && field.includes('mobile') && field.includes('number')){
                        field = 'phonenumber1';
                    }else if(field.includes('company') && field.includes('phone') && field.includes('country')&& field.includes('code')){
                        field = 'countryCode2';
                    }else if(field.includes('company') && field.includes('phone') && field.includes('number')){
                        field = 'phonenumber2';
                    }else if(field.includes('company') && field.includes('email')&& field.includes('1')){
                        field = 'emailid1';
                    }else if(field.includes('company') && field.includes('email')&& field.includes('2')){
                        field = 'emailid2';
                    }else if(field.includes('fb')){
                        field = 'facebook_url';
                    }else if(field.includes('twitter')){
                        field = 'twitter_url';
                    }else if(field.includes('linkedin')){
                        field = 'linkedin_url';
                    }else if(field.includes('you') && field.includes('tube')){
                        field = 'youtube_url';
                    }else if(field.includes('city')){
                        field = 'city';
                    }else if(field.includes('state')){
                        field = 'state';
                    }else if(field.includes('country')){
                        field = 'country';
                    }else if(field.includes('address')){
                        field = 'addresses';
                    }
                    mappedFields.push(field);
                });   
                return mappedFields;
            } else if(serviceName === 'CustomerContactService'){
                    
                fieldNames.forEach(function (field) {
                     field = field.toLowerCase();
                    if(field.includes('supplier')&& field.includes('name')){
                        field = 'name';
                    }else if(field.includes('customer')&& field.includes('name')){
                        field = 'name';
                    }else if(field.includes('contact') && field.includes('person') && field.includes('first') && field.includes('name')){
                        field = 'firstname';
                    }else if(field.includes('contact') && field.includes('person') && field.includes('last') && field.includes('name')){
                        field = 'lastname';
                    }else if(field.includes('contact') && field.includes('person') && field.includes('mobile') && field.includes('country')&& field.includes('code')){
                        field = 'countryCode1';
                    }else if(field.includes('contact') && field.includes('person') && field.includes('mobile')){
                        field = 'phonenumber1';
                    }else if(field.includes('contact') && field.includes('person') && field.includes('phone') && field.includes('country')&& field.includes('code')){
                        field = 'countryCode2';
                    }else if(field.includes('contact') && field.includes('person') && field.includes('phone')){
                        field = 'phonenumber2';
                    }else if(field.includes('contact') && field.includes('person') && field.includes('email')&& field.includes('1')){
                        field = 'emailid1';
                    }else if(field.includes('contact') && field.includes('person') && field.includes('email')&& field.includes('2')){
                        field = 'emailid2';
                    }else if(field.includes('address')){
                        field = 'address';
                    }else if(field.includes('city')){
                        field = 'city';
                    }else if(field.includes('state')){
                        field = 'state';
                    }else if(field.includes('country')){
                        field = 'country';
                    }
                    mappedFields.push(field);
                });   
                return mappedFields;
            } else if(serviceName === 'SupplierCategoryService'){
                    
                fieldNames.forEach(function (field) {
                    field = field.toLowerCase();
                    if(field.includes('supplier')&& field.includes('name')){
                        field = 'name';
                    }else if(field.includes('tertiary') && field.includes('sub') && field.includes('sub')){
                        field = 'sub_sub_sub_category';
                    }else if(field.includes('secondary') && field.includes('sub') && field.includes('sub')){
                        field = 'sub_sub_category';
                    }else if(field.includes('sub') && field.includes('sub')){
                        field = 'sub_category';
                    }else if(field.includes('category')){
                        field = 'parent_category';
                    }
                    mappedFields.push(field);
                });   
                return mappedFields;
            }else if(serviceName === 'SalesOrderService'){
                    
                fieldNames.forEach(function (field) {
                     field = field.toLowerCase();
                    if(field.includes('item')){
                        field = 'title';
                    }else if(field.includes('description')){
                        field = 'description';
                    }else if(field.includes('customer') && field.includes("po") && field.includes("s.no#")){
                        field = 'customer_po_number';
                    }else if(field.includes('buyer') && field.includes('part')&& field.includes('number')){
                        field = 'buyer_part_number';
                    }else if(field.includes('supplier') && field.includes('part')&& field.includes('number')){
                        field = 'supplier_part_number';
                    }else if(field.includes('quantity')&& field.includes('ordered')){
                        field = 'quantity_ordered';
                    }else if(field.includes('unit') && field.includes('measure')){
                        field = 'unit_measure';
                    }else if(field.includes('unit') && field.includes('price')){
                        field = 'unit_price';
                    }else if(field.includes('currency')){
                        field = 'currency';
                    }else if(field.includes('price') && field.includes('basis')){
                        field = 'price_basis';
                    }else if(field.includes('delivery') && field.includes('date')){
                        field = 'delivery_date';
                    }else if(field.includes('delivery') && field.includes('basis')){
                        field = 'delivery_basis';
                    }else if(field.includes('sgst')){
                        field = 'sgst';
                    }else if(field.includes('cgst')){
                        field = 'cgst';
                    }else if(field.includes('igst')){
                        field = 'igst';
                    }else if(field.includes('vat')){
                        field = 'vat';
                    }else if(field.includes('other')&& field.includes('charges')) {
                        field = 'other_charges';
                    }
                    mappedFields.push(field);
                });     
                return mappedFields;
            }
            
          }
          return factory;
     }]);
})();

