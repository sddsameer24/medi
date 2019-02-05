'use strict';

const AWS = require('aws-sdk');
AWS.config.update({region: 'us-east-1'});
const dynamo = new AWS.DynamoDB.DocumentClient({apiVersion: '2012-08-10'});
const bcrypt = require('bcrypt-nodejs');
const crypto = require('crypto');
const jwt = require('jsonwebtoken');
const v = require('node-input-validator');
var validator = require('validator');
const request = require("request");
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
function tokenIssue(payload){
    
    const secret = 'harimohanchcoco';
    let authsec = parseInt(Math.random()*10000000000000);
    let token = jwt.sign({ ...payload, authsec }, secret, { expiresIn: 10800 });
    return token;
}
function doRequest(url) {
    return new Promise(function (resolve, reject) {
      request(url, function (error, res, body) {
        if (!error && res.statusCode == 200) {
          resolve(body);
        } else {
          reject(error);
        }
      });
    });
  }
// async function verify(payload){
//     let { Authorization } = payload.headers;
   
//    if(Authorization){
//     const secret = 'harimohanchcoco';
//     //  const verify = (Authorization, cb) => jwt.verify(Authorization, secret, {}, cb);
//     // console.log("jwts", verify());
//         let params = {
//             TableName: "Tokens",
//             Key: {
//                 "hash": Authorization
//                }
               
//         };
//         try {
//             let user = await dynamo.get(params).promise();
//             console.log("useruser", user);
//             if(user.Item){
//                 return {status: true, ...user.Item}
//             } else{
//                 return { status: false, error:"session expire" };
//             }
            
    
//         } catch(e){
//             return { status: false, error:"session expire" };
//         }
//    } else {
//     return { status: false, error:"session expire" };
//    }
   

//    return { status: false, error:"session expire" };
    
    
    
// }



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
function phonenumber(inputtxt){
  let phoneno = /^\d{10, 10}$/;
  if(inputtxt+"".match(phoneno)){
      return true;
        }
      
      
        return false;
      
}

//validate password
function passwordValid(inputtxt){

    let phoneno = /^[A-Za-z0-9@_]{6,20}$/;
    if(inputtxt.match(phoneno)){
        return true;
          }
          return false;    
  }

//validate otp 
function otpValid(otp){
    return true
}  
 //password hashing sha256 
  function passwordHashing(password){
//     const hash = sign.sign(password, 'hex');
// console.log("hash", hash);
// console.log("hash1", hash1);
var hash = crypto.createHash('sha256').update(password).digest('base64');
 console.log("hash", hash);
    return hash;
};


// API call to create a TODO item

exports.getPayment = async (req, context, callback) => {
    let body = urlDecode(req.body);
   
   
     const { pay_id } = body;
     
    
		if (pay_id) {
			
			try {
                let params = {
                    TableName: "Users",
                    Key: {
                        "UserId": username
                       }
                       
                };
                try {
                    let user = await dynamo.get(params).promise();

			
                    if(!user.Item){
                        var userAddParams = {
                            TableName : 'Users',
                            Item: {
                                UserId: username,
                                password: passwordHashing(password),
                                createdAt: Math.round(+new Date()/1000).toString(),
                                modifiedAt: Math.round(+new Date()/1000).toString()
                            },
                           
                          };

                          let addUser = await dynamo.put(userAddParams).promise();
                          console.log("addUseraddUser", addUser);
                          //let otp = '123456'//parseInt(Math.random()*1000000);
                          let otp = parseInt(Math.random()*1000000);
                          let text = "your OTP "+otp
                        
                          let password = 'Logis986';
                          let from = 'UNISOL';
                          let category = '';
                          let  to = username;
                          var url = "http://www.myvaluefirst.com/smpp/sendsms?dlr-mask=1&dlr-url&text="+text+"&category="+category+"&username="+"logisyhttp"+"&password="+password+"&to="+to+"&from="+from;
                            let sms  = await doRequest(url);
                          console.log("otpotp", otp);
                         let otpHsh = passwordHashing(username+otp); 
                         let createdAt = Math.round(+new Date()/1000).toString();
                         let timeLimit = 15*60*60;
                       
                         var userTokenParams = {
                            TableName : 'Tokens',
                            Item: {
                                hash: otpHsh,
                                createdAt: createdAt,
                                timeLimit: timeLimit,
                                try: 0
                            },
                           
                          };

                          let addToen = await dynamo.put(userTokenParams).promise();
                          console.log("addToen", addToen);
                        return createResponse(200,  { status: true, error:null, user: {UserId: username} });
                      

                    }
                    return createResponse(200,  { status: false, error:"User already exit." });
                    
                } catch (e){
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


exports.createOrder = async (req, context, callback) => {
    let body = urlDecode(req.body);
   
   
     const { pay_id } = body;
     
    
		if (pay_id) {
			
			try {
                let params = {
                    TableName: "Users",
                    Key: {
                        "UserId": username
                       }
                       
                };
                try {
                    let user = await dynamo.get(params).promise();

			
                    if(!user.Item){
                        var userAddParams = {
                            TableName : 'Users',
                            Item: {
                                UserId: username,
                                password: passwordHashing(password),
                                createdAt: Math.round(+new Date()/1000).toString(),
                                modifiedAt: Math.round(+new Date()/1000).toString()
                            },
                           
                          };

                          let addUser = await dynamo.put(userAddParams).promise();
                          console.log("addUseraddUser", addUser);
                          //let otp = '123456'//parseInt(Math.random()*1000000);
                          let otp = parseInt(Math.random()*1000000);
                          let text = "your OTP "+otp
                        
                          let password = 'Logis986';
                          let from = 'UNISOL';
                          let category = '';
                          let  to = username;
                          var url = "http://www.myvaluefirst.com/smpp/sendsms?dlr-mask=1&dlr-url&text="+text+"&category="+category+"&username="+"logisyhttp"+"&password="+password+"&to="+to+"&from="+from;
                            let sms  = await doRequest(url);
                          console.log("otpotp", otp);
                         let otpHsh = passwordHashing(username+otp); 
                         let createdAt = Math.round(+new Date()/1000).toString();
                         let timeLimit = 15*60*60;
                       
                         var userTokenParams = {
                            TableName : 'Tokens',
                            Item: {
                                hash: otpHsh,
                                createdAt: createdAt,
                                timeLimit: timeLimit,
                                try: 0
                            },
                           
                          };

                          let addToen = await dynamo.put(userTokenParams).promise();
                          console.log("addToen", addToen);
                        return createResponse(200,  { status: true, error:null, user: {UserId: username} });
                      

                    }
                    return createResponse(200,  { status: false, error:"User already exit." });
                    
                } catch (e){
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

