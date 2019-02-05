'use strict';

const AWS = require('aws-sdk');
AWS.config.update({region: 'us-east-1'});
var uuid = require('uuid');
const dynamo = new AWS.DynamoDB.DocumentClient({apiVersion: '2012-08-10'});
var s3 = new AWS.S3();
const bcrypt = require('bcrypt-nodejs');
const crypto = require('crypto');
const jwt = require('jsonwebtoken');
const v = require('node-input-validator');
var validator = require('validator');
const authVerify =  require('./verify');
const tableName = process.env.TABLE_NAME;
const ddb = new AWS.DynamoDB();
const ddbGeo = require('dynamodb-geo');
const sign = crypto.createSign('SHA256');

sign.write('harimohan');
sign.end();

//*/ get reference to S3 client 

// API Gateway's Lambda proxy integration requires a
// Lambda function to return JSON in this format;
// see the Developer Guide for further details

// header response 
const createResponse = (statusCode, body) => {
    return {
        statusCode: statusCode,
        body: JSON.stringify(body),
        headers: {
            'Content-Type': 'application/json',
            'Access-Control-Allow-Origin': '*'
        }
    }
};






// url decodeing urp params
const urlDecode = (results) => {            
    var pairs = results.split('&');
    
    var result = {};
    pairs.forEach(function(pair) {
        pair = pair.split('=');
        result[pair[0]] = decodeURIComponent(pair[1] || '');
    });

    return JSON.parse(JSON.stringify(result));
}


// validate phone number













exports.addFileOrder = async (req, context, callback) => {
    console.log("aaaaaa")
    let auth = await authVerify.verify(req);
   if(!auth.status){
    return createResponse(500,  { status: false, error: auth.error});
   }

  
    let body = urlDecode(req.body);
   
     const { orderid, file } = body;
     console.log("body", body);
     let mobileNumber = auth.username;
    
		if (orderid && file) {
console.log("bbbbb")
			try {
                // let params = {
                //     TableName: "Users",
                //     Key: {
                //         "UserId": auth.username
                //        }
                       
                // };

               let fileType = file.split(";")[0].split(":")[1].split("/")[1];
               var fileName = Date.now()+"."+fileType
               let buffs = new Buffer(file.split(",")[1], 'base64');

               let putfile = await s3.putObject({
                Bucket: 'orderimage',
                Key: fileName,
                Body: buffs
              }).promise();
              let id = uuid.v1();
              var userAddParams = {
                TableName : 'fileUpload',
                Item: {
                    id,
                    type: "ORDER",
                    orderId: orderid,
                    fileName,
                    createdAt: Math.round(+new Date()/1000).toString(),
                    modifiedAt: Math.round(+new Date()/1000).toString()
                },
               
              };

              let addUser = await dynamo.put(userAddParams).promise();
return createResponse(200,  { status: true, error:"success server error" });
			} catch (err) {
                console.log("err", err);
                return createResponse(500,  { status: false, error:"Internal server error" });
				
			}
		} else {
            return createResponse(200,  { status: false, error:"Username or password both requeired" });
		}

	// 	return res.status(400).json({ msg: 'Bad Request: Email or password is wrong' });
   
    return createResponse(500,  { status: false, error:"Internal server erroreee" });
};


exports.addInvoiceOrder = async (req, context, callback) => {
    console.log("aaaaaa")
    let auth = await authVerify.verify(req);
   if(!auth.status){
    return createResponse(500,  { status: false, error: auth.error});
   }

  
    let body = urlDecode(req.body);
   
     const { orderid, file } = body;
     console.log("body", body);
     let mobileNumber = auth.username;
    
		if (orderid && file) {
console.log("bbbbb")
			try {
                // let params = {
                //     TableName: "Users",
                //     Key: {
                //         "UserId": auth.username
                //        }
                       
                // };

               let fileType = file.split(";")[0].split(":")[1].split("/")[1];
               var fileName = Date.now()+"."+fileType
               let buffs = new Buffer(file.split(",")[1], 'base64');

               let putfile = await s3.putObject({
                Bucket: 'orderimage',
                Key: fileName,
                Body: buffs
              }).promise();
              let id = uuid.v1();
              var userAddParams = {
                TableName : 'fileUpload',
                Item: {
                    id,
                    type: "ORDER",
                    orderId: orderid,
                    fileName,
                    createdAt: Math.round(+new Date()/1000).toString(),
                    modifiedAt: Math.round(+new Date()/1000).toString()
                },
               
              };

              let addUser = await dynamo.put(userAddParams).promise();
return createResponse(200,  { status: true, error:"success server error" });
			} catch (err) {
                console.log("err", err);
                return createResponse(500,  { status: false, error:"Internal server error" });
				
			}
		} else {
            return createResponse(200,  { status: false, error:"Username or password both requeired" });
		}

	// 	return res.status(400).json({ msg: 'Bad Request: Email or password is wrong' });
   
    return createResponse(500,  { status: false, error:"Internal server erroreee" });
};


exports.addOrder = async (req, context, callback) => {
   
    let auth = await authVerify.verify(req);;
     if(!auth.status){
      return createResponse(500,  { status: false, error: auth.error});
     }
  
    
      let body = urlDecode(req.body);
      const config = new ddbGeo.GeoDataManagerConfiguration(ddb, 'MedicineOrder');
      const myGeoTableManager = new ddbGeo.GeoDataManager(config);
       const { orgName, typeOfOrgs, location, contactName, contactMobile } = body;
       let mobileNumber = auth.username;
       
      
          if (orgName && typeOfOrgs && location) {
  
              try {
                  let params = {
                      TableName: "Users",
                      Key: {
                          "UserId": auth.username
                         }
                         
                  };
                  try {
                      let user = await dynamo.get(params).promise();
  
                      let orgsParams = {
                          TableName: "MedicineOrder",
                         
                             
                      };
                      
                      let orgs = await dynamo.scan(orgsParams).promise();
                      console.log("orgs", orgs)
                      if(user.Item){
                          let createdAt = Math.round(+new Date()/1000).toString();
                             let contactname, contactmobile; 
                          if(!!contactName){
                              contactname = contactName;
                          } else {
                              contactname = "null";
                          }
                          if(!!contactMobile){
                              contactmobile = contactMobile;
                          } else {
                              contactmobile = "null";
                          }
                            let addUser = await myGeoTableManager.putPoint({
                              RangeKeyValue: { S: orgs.Count+10001+"" }, 
                              GeoPoint: { 
                                  latitude: 51.51,
                                  longitude: -0.13
                              },
                              PutItemInput: { 
                                  Item: { 
                                      id: {S: orgs.Count+10001+""},
                                      orgName: { S: orgName }, 
                                      typeOfOrgs: { S: typeOfOrgs }, 
                                      location: { S: location }, 
                                      orgStatus: {BOOL: false},
                                      createdBy: { S: mobileNumber }, 
                                      createdAt: { S: createdAt },
                                      modifiedAt: { S: createdAt },
                                      contactName: {S:contactname},
                                      contactMobile: {S: contactmobile},
  
                                  },
                                  
                              }
                          }).promise()
                          
                           // let addUser = await dynamo.put(userAddParams).promise();
                 
                          return createResponse(200,  { status: true, org: {id: orgs.Count+10001, ...body} });
                        
  
                      }
                      return createResponse(500,  { status: false, error:"User not exit." });
                      
                  } catch (e){
                      console.log("eee", e);
                      return createResponse(500,  { status: false, error:"Somethig went wrong. Please try again" });
                      
                  }
                 
                  
  
                  
                  
  
                  
              } catch (err) {
                  return createResponse(500,  { status: false, error:"Internal server error" });
                  
              }
          } else {
              return createResponse(200,  { status: false, error:"Username or password both requeired" });
          }
  
      // 	return res.status(400).json({ msg: 'Bad Request: Email or password is wrong' });
     
      return createResponse(500,  { status: false, error:"Internal server error" });
  };