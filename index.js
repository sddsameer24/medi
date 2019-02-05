'use strict';


const AWS = require('aws-sdk');
var AmazonCognitoIdentity = require('amazon-cognito-identity-js');
const request = require('request-promise');
var CognitoUserPool = AmazonCognitoIdentity.CognitoUserPool;
var AuthenticationDetails = AmazonCognitoIdentity.AuthenticationDetails;
var CognitoUser = AmazonCognitoIdentity.CognitoUser;

const fetch = require("node-fetch");
const dynamo = new AWS.DynamoDB.DocumentClient();
var uuid = require('uuid');
const tableName = process.env.TABLE_NAME;
const cognitoIdentityService = new AWS.CognitoIdentityServiceProvider({apiVersion: '2016-04-19', region: 'us-east-1'});

//*/ get reference to S3 client 
var s3 = new AWS.S3();
// API Gateway's Lambda proxy integration requires a
// Lambda function to return JSON in this format;
// see the Developer Guide for further details
const createResponse = (statusCode, body) => {
    
    // to restrict the origin for CORS purposes, replace the wildcard
    // origin with a specific domain name
    return {
        statusCode: statusCode,
        body: body,
        headers: {
            'Content-Type': 'application/json',
            'Access-Control-Allow-Origin': '*'
        }
    }
};


// API call to create a TODO item

exports.create = async (event) => {
    
    const options = {
        method: 'POST'
        ,json: true,
        url: "https://api.razorpay.com/v1/beta/accounts"
        ,body: {
            "name":"Gaurav Kumar",
           
            "tnc_accepted":true,
            "account_details":{
               "business_name":"Acme Corporation",
               "business_type":"individual"
            },
            "bank_account":{
               "ifsc_code":"HDFC0CAGSBK",
               "beneficiary_name":"Gaurav Kumar",
               "account_type":"current",
               "account_number":304030434
            }
         },
         auth: {
            user: "rzp_live_2UQf1SUZhEudFI",
            pass: "M2Fg4cagDOR7Q8QmkyegN3Ui"
          },
          form: {
            'grant_type': 'client_credentials'
          },
        //  headers: {
        //     headers: {
        //         'Authorization': btoa('zp_live_2UQf1SUZhEudFI:M2Fg4cagDOR7Q8QmkyegN3Ui'),
        //         "Content-Type": "application/json"
        //       }
        // }
      };
      try {
        const response = await request(options);
        console.log("1111", response)
        //return (response.id == 5);
      }
      catch (error) {
        return false;
      }
    // let params = {
    //     TableName: tableName,
    //     Item: JSON.parse(event.body)
    // };
    // let data;
    
    // try {
    //     data = await dynamo.put(params).promise();
    // }
    // catch(err) {
    //     console.log(`CREATE ITEM FAILED FOR todo_id = ${params.Item.todo_id}, WITH ERROR: ${err}`);
    //     return createResponse(500, err);
    // }

    // console.log(`CREATE ITEM SUCCEEDED FOR todo_id = ${params.Item.todo_id}`);
    // return createResponse(200, `TODO item created with todo_id = ${params.Item.todo_id}\n`);
};

exports.SheduleReport = async (event) => {
    
    // let params = {
    //     TableName: tableName,
    //     Item: JSON.parse(event.body)
    // };
    // let data;
    var params = {
        UserPoolId: 'us-east-1_w0s5qrtaE' /* required */
      };
      let Orgsparams = {
        TableName: 'OrgsTable'
    };

    let jobsPosted = {
        TableName: 'postjobs'
    };

    let Userparams = {
        TableName: 'UserTable'
    };

    let appliedJobsParamas = {
        TableName: 'AppliedTable'
    }
    
    try {
        
        let users = await cognitoIdentityService.describeUserPool(params).promise();
        let totalUsers =  users.UserPool.EstimatedNumberOfUsers;

    
    let Orgs = await dynamo.scan(Orgsparams).promise();
    let totalOrgs = Orgs.Items.length;
    let totalActiveOrgs = Orgs.Items.filter(item=>item.OrgsStatus == true).length;
    
    let UsersTable = await dynamo.scan(Userparams).promise();
    let activeUser = UsersTable.Items.filter(item=>item.proUser == true).length;
    let appliedJobs = await dynamo.scan(appliedJobsParamas).promise();
    let totalAppliedUser = appliedJobs.Items.length;

    let Jobs = await dynamo.scan(jobsPosted).promise();
    let totalJobs = Jobs.Items.length;
    let PARTTIMEJOBS = Jobs.Items.filter(item=>item.jobCategory == "PARTTIME").length;
    let EMERGENCYJOBS = Jobs.Items.filter(item=>item.jobCategory == "EMERGENCY").length;
    let FULLTIMEJOBS = Jobs.Items.filter(item=>item.jobCategory == "FULLTIME").length;

    let PENDING = Jobs.Items.filter(item=>item.jobStatus == "PENDING").length;
    let ACCEPTED = Jobs.Items.filter(item=>item.jobStatus == "ACCEPTED").length;
    let COMPLETED = Jobs.Items.filter(item=>item.jobStatus == "COMPLETED").length;
    let POSTED = Jobs.Items.filter(item=>item.jobStatus == "POSTED").length;
    let COMMUTE = Jobs.Items.filter(item=>item.jobStatus == "COMMUTE").length;
    let APPLIED = Jobs.Items.filter(item=>item.jobStatus == "APPLIED").length;
        //console.log("usersusersusers", Jobs);
        //users.UserPool.EstimatedNumberOfUsers)
        let output = "Total Users = "+totalUsers+", total Active User = "+activeUser+", Total Orgs = "+totalOrgs+", Total Active Orgs = "+totalActiveOrgs+", Total Jobs = "+totalJobs+", Total Applied User = "+totalAppliedUser+", ";
        let jobs = " FULL TIME JOBS = "+FULLTIMEJOBS+", EMERGENCY JOBS = "+EMERGENCYJOBS+", PART TIME JOBS = "+PARTTIMEJOBS+", COMPLETED = "+COMPLETED+", PENDING = "+PENDING+", COMMUTE = "+COMMUTE+", ACCEPTED = "+ACCEPTED+", APPLIED = "+APPLIED+", POSTED = "+POSTED;
       

        //exports.handler =   (event, context, callback) => {
        let username = 'logisyhttp';
        let password = 'Logis986';
        let from = 'UNISOL';
        let category = 'bulk';
        let  to = "919784359717";
        var d = new Date(); // for now

        let  text1 = output+jobs+" Sent time "+d.getHours()+":"+d.getMinutes()+":"+d.getSeconds();
        var url = "http://www.myvaluefirst.com/smpp/sendsms?dlr-mask=1&dlr-url&text="+text1+"&category="+category+"&username="+username+"&password="+password+"&to="+to+"&from="+from;
        var options = {
          host: url,
          port: 80,
          path: '/',
          method: 'GET'
        };
        try{
            const response = await fetch(url);
    //const json = await response.json();
    
            console.log("respresp", response);
           // console.log("outtttt", response);
             return createResponse(200, output+jobs);
        } catch(err){
            console.log('errrrr', err)
            return err
        }
       
       // data = await dynamo.put(params).promise();
    }
    catch(err) {
        // console.log(`CREATE ITEM FAILED FOR todo_id = ${params.Item.todo_id}, WITH ERROR: ${err}`);
        // return createResponse(500, err);
    }

    // console.log(`CREATE ITEM SUCCEEDED FOR todo_id = ${params.Item.todo_id}`);
    
};




exports.createSubcription = async (event) => {
    console.log("kjhiujojolj", event.body);
    let id = uuid.v1();
    let params = {
        TableName: 'subcription',
        Item: {id:id, ...JSON.parse(event.body)}
    };
    let data;
    
    try {
        data = await dynamo.put(params).promise();
    }
    catch(err) {
        console.log(`CREATE ITEM FAILED FOR todo_id = ${params.Item.todo_id}, WITH ERROR: ${err}`);
        return createResponse(500, err);
    }

    console.log(`CREATE ITEM SUCCEEDED FOR todo_id = ${params.Item.todo_id}`);
    return createResponse(200, `TODO item created with todo_id = ${params.Item.todo_id}\n`);
};

exports.createInquery = async (event) => {
    let id = uuid.v1();
    let params = {
        TableName: 'inquery',
        Item: {id:id, ...JSON.parse(event.body)}
    };
    let data;
    
    try {
        data = await dynamo.put(params).promise();
    }
    catch(err) {
        console.log(`CREATE ITEM FAILED FOR todo_id = ${params.Item.todo_id}, WITH ERROR: ${err}`);
        return createResponse(500, err);
    }

    console.log(`CREATE ITEM SUCCEEDED FOR todo_id = ${params.Item.todo_id}`);
    return createResponse(200, `TODO item created with todo_id = ${params.Item.todo_id}\n`);
};



// API call to retrieve all TODO items

exports.getAll = async (event) => {



    const options = {
        method: 'POST'
        ,json: true,
        url: "https://api.razorpay.com/v1/beta/accounts"
        ,body: {
            "name":"hari boss Kumar",
           "email":"harimohaffnaaanan@gmail.com",
            "tnc_accepted":true,
            "account_details":{
               "business_name":"Acme Corporation",
               "business_type":"individual"
            },
            "bank_account":{
               "ifsc_code":"HDFC0CAGSBK",
               "beneficiary_name":"Gaurav Kumar",
               "account_type":"current",
               "account_number":304030434
            }
         },
         auth: {
            user: "rzp_live_2UQf1SUZhEudFI",
            pass: "M2Fg4cagDOR7Q8QmkyegN3Ui"
          },
          
        //  headers: {
        //     headers: {
        //         'Authorization': btoa('zp_live_2UQf1SUZhEudFI:M2Fg4cagDOR7Q8QmkyegN3Ui'),
        //         "Content-Type": "application/json"
        //       }
        // }
      };
      try {
        const response = await request(options).promise();
        console.log("111ff1", response);
        return createResponse(200, JSON.stringify(response) + '\n');
        //return (response.id == 5);
      }
      catch (error) {
        console.log(error);
        return createResponse(200, JSON.stringify(error) + '\n');
      }
   
    
};


exports.imageView = (event, context, callback) => {
    var params = {
  "Bucket": "mediclare-documents",
  "Key": event.queryStringParameters.key  
    };

    var urlParams = {
        "Bucket": "mediclare-documents",
        "Key": "1538198908193.jpeg"  
          };
    var urlParams = {Bucket: 'mediclare-documents', Key: '1538198908193.jpeg'};
s3Bucket.getSignedUrl('getObject', urlParams, function(err, url){
  console.log('the url of the image is', url);
  if(err) {
    callback(err, null);
} else {
    let response = {
 "statusCode": 200,
 "headers": {
     "my_header": "my_value"
 },
 "body": url,
 "isBase64Encoded": false
};
    callback(null, response);
}
})

    // s3.getObject(params, function(err, data){
    //    if(err) {
    //        callback(err, null);
    //    } else {
    //        let response = {
    //     "statusCode": 200,
    //     "headers": {
    //         "my_header": "my_value"
    //     },
    //     "body": JSON.stringify(data),
    //     "isBase64Encoded": false
    // };
    //        callback(null, response);
    // }
    // });
    
};


// API calls related to active TODO items

exports.getActive = async (event) => {
    
    
    var params = {
        UserPoolId: 'us-east-1_w0s5qrtaE' /* required */
      };
      
    let data;
    
    try {
        data = await cognitoIdentityService.describeUserPool(params).promise();
    }
    catch(err) {
        console.log(`GET ACTIVE ITEMS FAILED, WITH ERROR: ${err}`);
        return createResponse(500, err);
    }
    
    if (!data) {
        console.log('NO ACTIVE ITEMS FOUND FOR GET ACTIVE API CALL');
        return createResponse(404, 'ITEMS NOT FOUND\n');
    }

    console.log(`RETRIEVED ACTIVE ITEMS SUCCESSFULLY WITH count = ${data.Count}`);
    return createResponse(200, JSON.stringify(data) + '\n');
};


exports.updateActive = async (event) => {
    
    let params = {
        TableName: tableName,
        Item: JSON.parse(event.body)
    };
    let data;
    
    try {
        data = await dynamo.put(params).promise();
    }
    catch(err) {
        console.log(`UPDATE ACTIVE FAILED FOR todo_id = ${params.Item.todo_id}, WITH ERROR: ${err}`);
        return createResponse(500, err);
    }
    
    console.log(`UPDATE ACTIVE SUCCEEDED FOR todo_id = ${params.Item.todo_id}`);
    return createResponse(200, `TODO item updated with todo_id = ${params.Item.todo_id}\n`);
};


// API calls related to complete TODO items

exports.getComplete = async (event) => {
    
    let params = {
        TableName: tableName,
        FilterExpression : 'active = :active',
        ExpressionAttributeValues : {':active' : false}
    };
    
    let data;
    
    try {
        data = await dynamo.scan(params).promise();
    }
    catch(err) {
        console.log(`GET COMPLETE ITEMS FAILED, WITH ERROR: ${err}`);
        return createResponse(500, err);
    }
    
    if (!data.Items) {
        console.log('NO ITEMS FOUND FOR GET COMPLETE API CALL');
        return createResponse(404, 'COMPLETE ITEMS NOT FOUND\n');
    }

    console.log(`RETRIEVED COMPLETE ITEMS SUCCESSFULLY WITH count = ${data.Count}`);
    return createResponse(200, JSON.stringify(data.Items) + '\n');
};


exports.markComplete = async (event) => {
    
    let item = JSON.parse(event.body);
    item.active = false;

    let params = {
        TableName: tableName,
        Item: item
    };
    let data;
    
    try {
        data = await dynamo.put(params).promise();
    }
    catch(err) {
        console.log(`MARK COMPLETE FAILED FOR todo_id = ${item.todo_id}, WITH ERROR: ${err}`);
        return createResponse(500, err);
    }
    
    console.log(`MARK COMPLETE SUCCEEDED FOR todo_id = ${item.todo_id}`);
    return createResponse(200, `TODO item marked complete with todo_id = ${item.todo_id}\n`);
};


exports.deleteComplete = async (event) => {
    
    let params = {
        TableName: tableName,
        FilterExpression : 'active = :active',
        ExpressionAttributeValues : {':active' : false}
    };
    let data;
    
    // there is no batch delete in the AWS SDK for DynamoDB,
    // so we must delete completed items one by one
    try {
        data = await dynamo.scan(params).promise();
    }
    catch(err) {
        console.log(`GET ITEMS FOR DELETION FAILED, WITH ERROR: ${err}`);
        return createResponse(500, err);
    }

    if (!data.Items) {
        console.log('NO ITEMS FOUND FOR DELETION API CALL');
        return createResponse(404, 'NO ITEMS FOUND FOR DELETION\n');
    }

    console.log(`NUMBER OF ITEMS TO DELETE = ${data.Count}`);
    let ids = data.Items.map( (item) => { return item.todo_id; });
    ids.forEach( (id) => deleteIndividualItem(id) );
    return createResponse(200, `${data.Count} items submitted for deletion\n`);
};


function deleteIndividualItem(todoId) {
    
    let params = {
        TableName: tableName,
        Key: {
            todo_id: todoId
        },
        ReturnValues: 'ALL_OLD'
    };
    
    let dbDelete = (params) => { return dynamo.delete(params).promise() };
    
    dbDelete(params).then( (data) => {
        if (!data.Attributes) {
            console.log(`ITEM NOT FOUND FOR DELETION WITH ID = ${todoId}`);
            return;
        }
        console.log(`DELETED ITEM SUCCESSFULLY WITH id = ${todoId}`);
    }).catch( (err) => { 
        console.log(`DELETE ITEM FAILED FOR id = ${todoId}, WITH ERROR: ${err}`);
    });
    
}



