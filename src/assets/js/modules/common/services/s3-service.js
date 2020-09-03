angular.module('app').factory('s3Service',function($log) {
    
        var s3Service = {
            uploadFile: uploadFile
        };
     
        var s3bucket;
    
        AWS.config.region = 'ap-southeast-1'; // 1. Enter your region
        
        AWS.config.update({
            accessKeyId: "AKIAIHFQ4ZES5SWHNK5Q",
            secretAccessKey: "7bwaPq8FOtGCzcJAHnuf57MF8zeF1juoF6aWUChY"                
        });
        var BUCKET_NAME ='suppliers-cave-web-upload';
        s3bucket = new AWS.S3({
            params: {
                Bucket: BUCKET_NAME
            }
        });
    
        return s3Service;
    
        function uploadFile(path,file,successCb,errorCb){
            
            
            var objKey = path+(file.name?'/'+file.name:'');
            var params = {
                Key: objKey,
                ContentType: file.type?file.type:'image',
                Body: file,
                ACL: 'public-read'
            };
    
            if(s3bucket){
                s3bucket.putObject(params, function(err, data) {
                    if (err) {
                        alert.show(err,'error');
                        errorCb(err);
                    } else {
                        var url = "https://s3.ap-southeast-1.amazonaws.com/"+BUCKET_NAME+'/'+objKey;
                        successCb(url);
                    }
                });
            }
        }
    
    });