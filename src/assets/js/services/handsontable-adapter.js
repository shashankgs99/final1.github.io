 (function(){
  var app = angular.module('app');
  app.service('HandsonApiAdapter',['Miscellaneous',function(Miscellaneous){
    
    var service = {};


    // Configuring

    // -- Should be depreceated in future
    service.generateColHeaders = function(data){
      
      var first_record = data[0];
      var colHeaders = Object.keys(first_record);
      for(var i=0;i<colHeaders.length;i+=1){
        colHeaders[i] = Miscellaneous.humanize(colHeaders[i]);
      };
      return colHeaders;
    };
    service.generateColInfoArray = function(data,readOnly){
      var mapping = { // Django type to Handsontable cell type
        string: "text",
        boolean: "checkbox",
        number: "numeric"
      };
      var first_record = data[0];
      var colHeaders = Object.keys(first_record);
      var colInfoArray = colHeaders.map(function(v) { // Iterate through all keys (ColHeaders) and pass it as v to function
        var dict = {};
        dict.width = 100; //default width
        dict.data = v;
        // readOnly
        if (readOnly) {dict.readOnly = true;};
        // default readOnly Columns
        if (v=='url' || v=='id') {dict.readOnly = true; dict.width=50;};
        dict.type = mapping[typeof first_record[v]];
        
        return dict;
      });

      return colInfoArray;
    };

    
    var getPkAsFistColumn = function(data){
      // find element
      var new_data = [];

      for(var i=0;i<data.length;i+=1){
        if(data[i].is_primary_key){
          new_data.unshift(data[i]);
        }else{
          new_data.push(data[i]);
        }
      };
      return new_data;
    };

    var excludeFields = function(data,excludes){
      excludes = excludes.split(',');
      var new_data = [];

      for(var i=0;i<data.length;i+=1){
        var exclude_flag = false;

        for (var j=0;j<excludes.length;j+=1){
          if(data[i].name == excludes[j]){
            exclude_flag = true;
          }
        };
        if(!exclude_flag){new_data.push(data[i]);};
      };
      
      return new_data;
    };
    var includeFields = function(data,includes){
      var field = JSON.parse(includes); // Assuming only 1 field is passed
      
      var new_data = [];
      new_data = data;
      new_data.unshift(field);

      return new_data;
    };
    // -- New
    
    service.generateColHeadersFromSchema = function(data, excludes, includes, serviceName,presentPage){
      data = getPkAsFistColumn(data);
      if(excludes){data = excludeFields(data, excludes);};
      if(includes){data = includeFields(data, includes);};
      // if(presentPage){
      //   var col1 = [];
      //   var col2 = [];
      //   var col3 = [];
      //   data.forEach(function (item) {
      //     if (item.name.includes("is_")) {
      //       col1.push(item);
      //     } else if (item.name.includes("created")) {
      //       col2.push(item);
      //     } else {
      //       col3.push(item);
      //     }
      //   });
      //   data = [];
      //   Array.prototype.push.apply(col3, col1);
      //   Array.prototype.push.apply(col3, col2);
      //   // var number = col3[7];
      //   // var code = col3[8];
      //   // col3[7] = code;
      //   // col3[8] = number;
      //   data = col3;
      // }
      if(serviceName === 'UserService'){
        var col1 = [];       
        var col2 = [];
        for(var i=0;i<data.length;i+=1){
          if(data[i].name === 'is_superuser' || data[i].name === 'is_staff' || data[i].name === 'is_active' || 
             data[i].name === 'is_email_verified' || data[i].name === 'image' || data[i].name === 'is_seller' || 
             data[i].name === 'is_buyer' || data[i].name === 'created' || data[i].name === 'is_admin_supplier' || 
             data[i].name === 'is_verified'){
            col1.push(Miscellaneous.humanize(data[i].name));
          }else{
            if(data[i].name === 'location_country'){
              col2.push("Country");
            }else if(data[i].name === 'location_city'){
              col2.push("City");
            }else{
              col2.push(Miscellaneous.humanize(data[i].name));
            }
          }
        }
        col2.unshift(" ");
        //col2.splice.apply(col2,[5,0].concat(col1));
        var result = col2.concat(col1);
        col2 = result;
        // var number = col2[7];
        // var code = col2[8];
        // col2[7] = code;
        // col2[8] = number;
        return col2;
      }else if(serviceName === 'CustomerService' || serviceName == "BuyerSupplierService"){
        var colHeaders = [];
        var col1=[];
        var txt = '';
        colHeaders.push(txt);
        for(var i=0;i<data.length;i+=1){
          if(data[i].name === 'created_date'){
            col1.push(data[i].name);
          }else{
            colHeaders.push(Miscellaneous.humanize(data[i].name));
          }
        };
        colHeaders = colHeaders.concat(col1);
        return colHeaders;
      }else {
        var colHeaders = [];
        var txt = '';
        colHeaders.push(txt);
        for(var i=0;i<data.length;i+=1){
          if(data[i].name === 'sub_sub_category'){
            colHeaders.push('Secondary Sub Category');
          }else if(data[i].name === 'sub_sub_sub_category'){
            colHeaders.push('Tertiary Sub Category');
          }else if(data[i].name === 'stock_or_inventory'){
            colHeaders.push('Item type');
          }else{
            colHeaders.push(Miscellaneous.humanize(data[i].name));
          }
        };
        colHeaders = colHeaders.concat(col1);
        return colHeaders;
      }
    };
    service.generateColInfoArrayFromSchema  = function(data, readOnly, excludes, includes,serviceName,editData,presentPage,disableColumns){
      data = getPkAsFistColumn(data);
      if(excludes){data = excludeFields(data, excludes);};
      if(includes){data = includeFields(data, includes);};
      // if(presentPage){
      //   var col1 = [];
      //   var col2 = [];
      //   var col3 = [];
      //   data.forEach(function (item) {
      //     if (item.name.includes("is_")) {
      //       col1.push(item);
      //     } else if (item.name.includes("created")) {
      //       col2.push(item);
      //     } else {
      //       col3.push(item);
      //     }
      //   });
      //   data = [];
      //   Array.prototype.push.apply(col3, col1);
      //   Array.prototype.push.apply(col3, col2);
        
      //   // var number = col3[7];
      //   // var code = col3[8];
      //   // col3[7] = code;
      //   // col3[8] = number;
      //   data = col3;
      // }
      
      var mapping = { // Django fields to Handsontable fields
        TextField: "text",
        CharField: "text",
        ForeignKey: "text",
        BooleanField: "checkbox",
        BigIntegerField: "numeric",
        IntegerField: "numeric",
        AutoField: "numeric",
        TimeField: "time",
        DateField: "date"
      };
     data.unshift({type:'BooleanField',name:'active',});
      var colInfoArray = data.map(function(v){ // Iterate through all individual field in schema
        var dict = {};
        dict.width = 130; //default width
        dict.data = v.name;
        dict.type = 'text'; // assign default which will be changed in next call
       if(mapping[v.type]){dict.type = mapping[v.type]}
       if(serviceName === "InventoryService" || serviceName === "DirectoryService"){
        if(v.name == 'description'){
          { dict.width=250};
        }
       }
       if(serviceName === 'CompanyService'){
        if(v.name == 'aboutus_text'){
          { dict.width=250};
          // data.forEach(function(item){
          //     // {dict.height= 40};
          //     rowHeights: [50];
          
        }
      }
       if(v.name == 'active'){dict.width=50}; // use mapping
        if(readOnly) {dict.readOnly = true;}; // readOnly
        if(editData){
          if(v.name == 'sub_category' || v.name == 'sub_sub_category' ||  v.name == 'sub_sub_sub_category' || v.name == 'sub_category' || v.name == 'category' ||  v.name == 'state' ||  v.name == 'country' || v.name =='city' ) {dict.readOnly = true; dict.width=50;}; // default readOnly Columns
           if(v.name == 'active'){ dict.width=50};
           if(v.name == 'description'){
            { dict.width=250};
          }
        }
        if(disableColumns){
          if(v.name == 'category' || v.name == 'city'){dict.readOnly = true; dict.width=50};
          if(v.name == 'description'){
            { dict.width=250};
          }
        }
        if(v.forced_write) {dict.readOnly = false;}; // forced write access
        if(v.name=='url' || v.name=='id' || v.name=='created_date' || v.name=='updated_date' || v.name=='created' || v.name=='updated') {dict.readOnly = true; dict.width=50;}; // default readOnly Columns
        // handle choices | editing source
        if(v.choices){
          if(v.choices.length>0 & !readOnly & !v.auto_created){ // Excludes Foreign Key Reference using autocreated
            dict.type = 'autocomplete';
            dict.source = v.choices.map(function(v){return v[0];});
            dict.width = 150;
            dict.strict = true;
          };
        };
        // Make autogenerated readonly
        if(v.auto_created){dict.readOnly = true; };
        // custom handlers | editing renderer
        if(v.type=='FileField'){dict.renderer = 'my.img.renderer';dict.editor = 'my.img.editor';};
        if(v.type=='ManyToManyField' & !v.auto_created){
          dict.renderer = 'my.manyToMany.renderer';
          dict.editor = 'my.manyToMany.editor';
          dict.source = v.choices.map(function(v){return v[0];});
        };
        return dict;
      });
      if(serviceName === 'UserService'){
        var col1 = [];       
        var col2 = [];
        for(var i=0;i<colInfoArray.length;i+=1){
          var data = colInfoArray[i].data;
          if(data === 'is_superuser' || data === 'is_staff' || data === 'is_active' || data === 'is_email_verified' || 
             data === 'image' || data === 'is_seller' || data === 'is_buyer' || data === 'created' || 
             data === 'is_admin_supplier' || data === 'is_verified'){
            col1.push(colInfoArray[i]);
          }else{
            col2.push(colInfoArray[i]);
          }
        }
        var result = col2.concat(col1);

        col2 = result;
        // var number = col2[7];
        // var code = col2[8];
        // col2[7] = code;
        // col2[8] = number;
        // col2.splice.apply(col2,[5,0].concat(col1));
         return col2;
      }
      if(serviceName === 'CustomerService' || serviceName == "BuyerSupplierService"){
        var col1 = [];       
        var col2 = [];
        for(var i=0;i<colInfoArray.length;i+=1){
          var data = colInfoArray[i].data;
          if(data === 'created_date'){
            col1.push(colInfoArray[i]);
          }else{
            col2.push(colInfoArray[i]);
          }
        }
          var result = col2.concat(col1);
          col2 = result;
          return col2;
      }
      return colInfoArray;
    };

    // Collate Changes 
    
    // This piece of code will take the changes captued by Handsontable 
    // and will convert it into a dictionary format
    // THIS IS DEPENDENT ON onAfterChange event in controller for POST or PUT CLASSIFICATION
    service.postOrPut = function(changes){
      
      // declare variables
      var post_or_put = {};
      post_or_put.post = [];
      post_or_put.put = [];

      for(var i=0; i<changes.length; i+=1){ // Iterate through all the changes, covert it into dict from array & classify
        var single_change = changes[i];
        
        var single_change_dict = {};
        single_change_dict['row'] = single_change[0];
        single_change_dict[single_change[1]] = single_change[3];

        
        if(single_change[4]){ // single_change[4] provides Primary Key which comes from HandsonTable after change
          single_change_dict['id'] = single_change[4];
          post_or_put.put.push(single_change_dict);
        }
        else{
         post_or_put.post.push(single_change_dict); 
        }
      };

      return post_or_put; 
    };

    // Posted records

    service.postRecords = function(posts){
      
      var post_records = [];
      
      for(var i=0; i<posts.length; i+=1){ // Iterate over posts

        var pre_existing_id = false; // Pre exisiting row flag

        // Optional for loop to avode duplicates
        for(var j=0;j<post_records.length;j+=1){ // Iterate over all dicts to combine de-dup dicts on row no
           if(post_records[j]['row'] == posts[i]['row']){ // Check with 4th index with contains columns
             pre_existing_id = true; // Found pre exisiting row
             delete posts[i]['row'];
             post_records[j] = angular.merge({},post_records[j],posts[i]);
           }
         };

        if(!pre_existing_id){ // Default route if no pre existing row found
           post_records.push(posts[i]);
        };
      };
      return post_records;
    };

    // Putted recors

    service.putRecords = function(puts){

      var put_records = [];
      
      for(var i=0; i<puts.length; i+=1){ // Iterate over puts
        
        

        var pre_existing_id = false; // Pre exisiting row flag

        // Optional for loop to avode duplicates
        for(var j=0;j<put_records.length;j+=1){ // Iterate over all dicts to combine de-dup dicts on row no
           if(put_records[j]['id'] == puts[i]['id']){ // Check with 4th index with contains columns
             pre_existing_id = true; // Found pre exisiting row
             delete puts[i]['id'];
             delete puts[i]['row'];
             angular.extend(put_records[j],puts[i]);
           }
         };

        if(!pre_existing_id){ // Default route if no pre existing row found
           put_records.push(puts[i]);
        };
      };

      return put_records; // Array of JavaScript Objects
    };

    // Collate Delete records & DELETE REQUEST

    service.deleteRecords = function(deletes){
      return deletes;
    };

    // end
    return service;

  }]);
})();