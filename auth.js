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
const Razorpay = require('razorpay');
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

const otpSend = async (username)=>{
    try {
    
        
    let otp = Math.floor(100000 + Math.random() * 900000)+"";
                          for (let i = 0; i < 10; i++) {
                            if (otp.length == 6) { 
                                break; 
                                
                            }
                            otp = Math.floor(100000 + Math.random() * 900000)+"";
                           
                          }
                         

                          console.log("otpotp", otp);
                          let text = "Your Mediclare verification code is "+otp
                        
                          let password = 'Logis986';
                          let from = 'UNISOL';
                          let category = '';
                          let  to = username;
                          var url = "http://www.myvaluefirst.com/smpp/sendsms?dlr-mask=1&dlr-url&text="+text+"&category="+category+"&username="+"logisyhttp"+"&password="+password+"&to="+to+"&from="+from;
                            let sms  = await doRequest(url);
                            return {staus: true, otp:otp}
                        } catch(e){
                            console.log("error Otp", e);
                            return {staus: false}
                        }
}
function tokenIssue(payload){
    
    const secret = 'harimohanchcoco';
    let authsec = parseInt(Math.random()*900000000000);
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
//                 return { status: false, error:"Session expired!" };
//             }
            
    
//         } catch(e){
//             return { status: false, error:"Session expired!" };
//         }
//    } else {
//     return { status: false, error:"Session expired!" };
//    }
   

//    return { status: false, error:"Session expired!" };
    
    
    
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

async function deviceTokenStore(item){
    console.log("eeee", item);
    const { deviceToken, os, app, username } = item;
    try {
        var userAddParams = {
            TableName : 'notification',
            Item: {
                id: deviceToken,
                os: os,
                app: app,
                username: username,
                createdAt: Math.round(+new Date()/1000).toString(),
                modifiedAt: Math.round(+new Date()/1000).toString()
            },
           
          };
    
          let addUser = await dynamo.put(userAddParams).promise();
       
            return true;
    } catch (e){
        console.log("eee", e);
     return false
    }
  
    };

// API call to create a TODO item

exports.signup = async (req, context, callback) => {
    let body = urlDecode(req.body);
   
   
     const { username, password, deviceToken, os, app } = body;
     
    console.log("body", body);
		if (username && password) {
			if (!phonenumber(username)) {
                return createResponse(200,  { status: false, error:"Invalid Username" });
            } 

            if (!passwordValid(password)) {
                return createResponse(200,  { status: false, error:"Incorrect Password" });
            } 
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
                          //let otp = '123456'//parseInt(Math.random()*900000);
                          let sms  = await otpSend(username);

                         let otpHsh = passwordHashing(username+sms.otp); 
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
                    return createResponse(200,  { status: false, error:"Username already exists!" });
                    
                } catch (e){
                    console.log("ee", e)
                    return createResponse(200,  { status: false, error:"Something went wrong. Please try again" });
                    
                }
               
				

				
				

				
			} catch (err) {
                return createResponse(500,  { status: false, error:"Internal server error" });
				
			}
		} else {
            return createResponse(200,  { status: false, error:"Username and password are required" });
		}

	// 	return res.status(400).json({ msg: 'Bad Request: Incorrect email or password' });
   
    return createResponse(500,  { status: false, error:"Internal server error" });
};

exports.resendOtp = async (req, context, callback) => {
    let body = urlDecode(req.body);
   
   
     const { username } = body;
     
    
		if (username) {
			if (!phonenumber(username)) {
                return createResponse(200,  { status: false, error:"Invalid Username" });
            } 

            
			try {
                let params = {
                    TableName: "Users",
                    Key: {
                        "UserId": username
                       }
                       
                };
                try {
                    let user = await dynamo.get(params).promise();

			
                    if(user.Item){
                        // var userAddParams = {
                        //     TableName : 'Users',
                        //     Item: {
                        //         UserId: username,
                        //         password: passwordHashing(password),
                        //         createdAt: Math.round(+new Date()/1000).toString(),
                        //         modifiedAt: Math.round(+new Date()/1000).toString()
                        //     },
                           
                        //   };

                        //   let addUser = await dynamo.put(userAddParams).promise();

                         
                            let sms  = await otpSend(username);
                            // if(!sms.status){
                            //     sms  = await otpSend(username);
                            // }
                            
                       
                         let otpHsh = passwordHashing(username+sms.otp); 
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
                          
                        return createResponse(200,  { status: true, error:null, message:'OTP sent',  user: {UserId: username} });
                      

                    }
                    return createResponse(200,  { status: false, error:"User not exit." });
                    
                } catch (e){
                    console.log("ee", e)
                    return createResponse(500,  { status: false, error:"Something went wrong. Please try again" });
                    
                }
               
				

				
				

				
			} catch (err) {
                return createResponse(500,  { status: false, error:"Internal server error" });
				
			}
		} else {
            return createResponse(200,  { status: false, error:"Username and password are required" });
		}

	// 	return res.status(400).json({ msg: 'Bad Request: Incorrect email or password' });
   
    return createResponse(500,  { status: false, error:"Internal server error" });
};



// forgot password function 


exports.forgotPassword = async (req, context, callback) => {
    let body = urlDecode(req.body);
   
   
     const { username, password, otp } = body;
     
    console.log("body", body);
		if (username && password && otp) {
			if (!phonenumber(username)) {
                return createResponse(200,  { status: false, error:"Username Invalid" });
            } 
            if (!otpValid(otp)) {
                return createResponse(200,  { status: false, error:"Incorrect Password" });
            } 
			try {
                let otpHsh = passwordHashing(username+otp); 
                console.log(otpHsh);
                let params = {
                    TableName: "Tokens",
                    Key: {
                        "hash": otpHsh
                       }
                       
                };
                try {
                    let user = await dynamo.get(params).promise();

			
                    if(user.Item){
                    
                        	let userParamsUpdate = {
				                    TableName: "Users",
			                     	Key: {
			                        		"UserId":  username 
				                          }, 
			                	   UpdateExpression: 'set #password = :password',

                                    ExpressionAttributeNames: {'#password':'password'},
                                    ExpressionAttributeValues: {
                                      ':password' : passwordHashing(password)
	                                 }}
	 
		 			let	update = await dynamo.update(userParamsUpdate).promise();
                       
                        // let user = await dynamo.delete(params).promise();
                        // let createdAt = Math.round(+new Date()/1000).toString();
                        // let timeLimit = 15*60*60;
                        // var userTokenParams = {
                        //     TableName : 'Tokens',
                        //     Item: {
                        //         hash: issue,
                        //         username: username,
                        //         createdAt: createdAt,
                        //         timeLimit: timeLimit,
                        //         try: 0
                        //     },
                           
                        //   };

                        //   let addToen = await dynamo.put(userTokenParams).promise();
                                                  
                        return createResponse(200,  { status: true, error:null, user: {UserId: username, message:"you have successfully password change"} });
                

                    }
                    return createResponse(200,  { status: false, error:"Invalid OTP!" });
                    
                } catch (e){
                    console.log("e", e)
                    return createResponse(500,  { status: false, error:"Something went wrong. Please try again" });
                    
                }
               
				

				
				

				
			} catch (err) {
                console.log("err", err)
                return createResponse(500,  { status: false, error:"Internal server error" });
				
			}
			// try {
            //     let params = {
            //         TableName: "Users",
            //         Key: {
            //             "UserId": username
            //            }
                       
            //     };
            //     try {
            //         let user = await dynamo.get(params).promise();

			
            //         if(user.Item){
                       
            //              // let addUser = await dynamo.put(userAddParams).promise();
            //              var userAddParams = {
            //                 TableName : 'Users',
            //                 Item: {
            //                     UserId: username,
            //                     password: passwordHashing(password),
            //                     createdAt: Math.round(+new Date()/1000).toString(),
            //                     modifiedAt: Math.round(+new Date()/1000).toString()
            //                 },
                           
            //               };

            //               let addUser = await dynamo.put(userAddParams).promise();
            //             //   let otp = parseInt(Math.random()*900000);
            //             //   console.log("otpotp", otp);
            //             //  let otpHsh = passwordHashing(username+otp); 
            //             //  console.log(otpHsh);
            //             //  let createdAt = Math.round(+new Date()/1000).toString();
            //             //  let timeLimit = 15*60*60;
                       
            //             //  var userTokenParams = {
            //             //     TableName : 'Tokens',
            //             //     Item: {
            //             //         hash: otpHsh,
            //             //         username: username,
            //             //         createdAt: createdAt,
            //             //         timeLimit: timeLimit,
            //             //         expireAt: createdAt+timeLimit,
            //             //         try: 0
            //             //     },
                           
            //             //   };

            //             //   let addToen = await dynamo.put(userTokenParams).promise();
                          
            //             // return createResponse(200,  { status: true, error:null, user: {UserId: username} });
                      

            //         }
            //         return createResponse(500,  { status: false, error:"Username does not exist" });
                    
            //     } catch (e){
            //         console.log("e", e);
            //         return createResponse(500,  { status: false, error:"Something went wrong. Please try again" });
                    
            //     }
               
				

				
				

				
			// } catch (err) {
            //     return createResponse(500,  { status: false, error:"Internal server error" });
				
			// }
		} else {
            return createResponse(200,  { status: false, error:"Username is required" });
		}

	// 	return res.status(400).json({ msg: 'Bad Request: Incorrect email or password' });
   
    return createResponse(500,  { status: false, error:"Internal server error" });
};


// OTP SUNMIT FUNCTION

exports.otp = async (req, context, callback) => {
    let body = urlDecode(req.body);
   
   
     const { username, otp, deviceToken, os, app } = body;
     
    
		if (username && otp) {
			if (!phonenumber(username)) {
                return createResponse(200,  { status: false, error:"Username Invalid" });
            } 

            if (!otpValid(otp)) {
                return createResponse(200,  { status: false, error:"Incorrect Password" });
            } 
			try {
                let otpHsh = passwordHashing(username+otp); 
                console.log(otpHsh);
                let params = {
                    TableName: "Tokens",
                    Key: {
                        "hash": otpHsh
                       }
                       
                };
                try {
                    let user = await dynamo.get(params).promise();

			
                    if(user.Item){
                       
                        const issue = tokenIssue({username: username});

                        	let userParamsUpdate = {
				                    TableName: "Users",
			                     	Key: {
			                        		"UserId":  username 
				                          }, 
			                	   UpdateExpression: 'set #userProfileStatus = :userProfileStatus',

                                    ExpressionAttributeNames: {'#userProfileStatus':'userProfileStatus'},
                                    ExpressionAttributeValues: {
                                      ':userProfileStatus' : true,
	                                 }}
	 
		 			let	update = await dynamo.update(userParamsUpdate).promise();
                       
                        let user = await dynamo.delete(params).promise();
                        let createdAt = Math.round(+new Date()/1000).toString();
                        let timeLimit = 15*60*60;
                        var userTokenParams = {
                            TableName : 'Tokens',
                            Item: {
                                hash: issue,
                                username: username,
                                createdAt: createdAt,
                                timeLimit: timeLimit,
                                try: 0
                            },
                           
                          };

                          let addToen = await dynamo.put(userTokenParams).promise();
                          let login = await deviceTokenStore({deviceToken, os, app, username});
                        return createResponse(200,  { status: true, error:null, user: {UserId: username, token: issue} });
                

                    }
                    return createResponse(200,  { status: false, error:"Invalid OTP!" });
                    
                } catch (e){
                    console.log("e", e)
                    return createResponse(500,  { status: false, error:"Something went wrong. Please try again" });
                    
                }
               
				

				
				

				
			} catch (err) {
                console.log("err", err)
                return createResponse(500,  { status: false, error:"Internal server error" });
				
			}
		} else {
            return createResponse(200,  { status: false, error:"Username and password are required" });
		}

	// 	return res.status(400).json({ msg: 'Bad Request: Invalid email or password' });
   
    return createResponse(500,  { status: false, error:"Internal server error" });
};



//Login Function 

exports.login = async (req, context, callback) => {

    let body = urlDecode(req.body);
   
   
     const { username, password, deviceToken, os, app } = body;
     
    
		if (username && password) {
			if (!phonenumber(username)) {
                return createResponse(200,  { status: false, error:"Invalid Username" });
            } 

            if (!passwordValid(password)) {
                return createResponse(200,  { status: false, error:"Incorrect Password" });
            } 
			try {
                let params = {
                    TableName: "Users",
                    Key: {
                        "UserId": username
                       }
                       
                };
                try {
                    let user = await dynamo.get(params).promise();

			console.log("user", user)
                    if(user.Item){
                        if(user.Item.password){
                            let passwordUser = passwordHashing(password);
                            if(user.Item.password == passwordUser){
                                if(!user.Item.userProfileStatus){


                                    let sms  = await otpSend(username);

                                   let otpHsh = passwordHashing(username+sms.otp); 
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
                                   
                                  return createResponse(200,  { status: true, error:null, message:'OTP sent',  user: {UserId: username, activeStatus: false} });

                                    
                                }
                                const issue = tokenIssue({username: username});
                               
                                let createdAt = Math.round(+new Date()/1000).toString();
                                let timeLimit = 15*60*60;
                                var userTokenParams = {
                                    TableName : 'Tokens',
                                    Item: {
                                        hash: issue,
                                        username: username,
                                        createdAt: createdAt,
                                        timeLimit: timeLimit,
                                        try: 0
                                    },
                                   
                                  };
                                  let login = await deviceTokenStore({deviceToken, os, app, username});
                                  
                                  let addToen = await dynamo.put(userTokenParams).promise();           
                                return createResponse(200,  { status: true, error:null, user: {UserId: username, token: issue, activeStatus: true, orgId: '10001'} });
                            }
                        }
                           
                          
                        return createResponse(200,  { status: false, error:"Incorrect username or password" });
                      

                    }
                    return createResponse(200,  { status: false, error:"User does not exist.", heading:"Oops!" });
                    
                } catch (e){
                    console.log("eee", e);
                    return createResponse(200,  { status: false, error:"Something went wrong. Please try again" });
                    
                }
               
				

				
				

				
			} catch (err) {
                return createResponse(500,  { status: false, error:"Internal server error" });
				
			}
		} else {
            return createResponse(200,  { status: false, error:"Username and password are required" });
		}

	// 	return res.status(400).json({ msg: 'Bad Request: Incorrect email or password' });
   
    return createResponse(500,  { status: false, error:"Internal server error" });
};

exports.profile = async (req, context, callback) => {
    let { Authorization } = req.headers;
   
  let auth = await authVerify.verify(req);
   if(!auth.status){
    return createResponse(500,  { status: false, error: auth.error});
   }

   const config = new ddbGeo.GeoDataManagerConfiguration(ddb, 'Orgs');
   const myGeoTableManager = new ddbGeo.GeoDataManager(config);
    let body = urlDecode(req.body);
   
     const { name, email, gender, bloodGroup, bloodDonor } = body;
     let mobileNumber = auth.username;
    
		if (name && email && gender && bloodGroup && bloodDonor) {

			try {
                let params = {
                    TableName: "Users",
                    Key: {
                        "UserId": auth.username
                       }
                       
                };
                try {
                    let user = await dynamo.get(params).promise();

			
                    if(user.Item){
                       
                           
                        let userParamsUpdate = {
                            TableName: "Users",
                             Key: {
                                    "UserId":  auth.username 
                                  }, 
                           UpdateExpression: 'set #name = :name, #email = :email, #gender = :gender, #bloodGroup = :bloodGroup, #bloodDonor = :bloodDonor',

                            ExpressionAttributeNames: {'#name':'name', '#email': 'email','#gender':'gender', '#bloodGroup': 'bloodGroup', '#bloodDonor': 'bloodDonor'},
                            ExpressionAttributeValues: {
                              ':name' : name,
                              ':email' : email,
                              ':gender' : gender,
                              ':bloodGroup': bloodGroup,
                              ':bloodDonor': bloodDonor
                             }}

                            

             let	update = await dynamo.update(userParamsUpdate).promise();
               
                        return createResponse(200,  { status: true, user: {name, email, mobileNumber, gender, bloodGroup, bloodDonor } });
                      

                    }
                    return createResponse(500,  { status: false, error:"User does not exist." });
                    
                } catch (e){
                    console.log("eee", e);
                    return createResponse(500,  { status: false, error:"Something went wrong. Please try again" });
                    
                }
               
				

				
				

				
			} catch (err) {
                return createResponse(500,  { status: false, error:"Internal server error" });
				
			}
		} else {
            return createResponse(200,  { status: false, error:"Username and password are required" });
		}

	// 	return res.status(400).json({ msg: 'Bad Request: Incorrect email or password' });
   
    return createResponse(500,  { status: false, error:"Internal server error" });
};






  exports.typeOffOrg = async (req, context, callback) => {
   console.log("reqreq", req)
    let auth = await authVerify.verify(req);;
     if(!auth.status){
      return createResponse(500,  { status: false, error: auth.error});
     }
  
     return createResponse(200,  { status: true, typeOfOrg:[ 
     {id:1, 'name':'Doctor', status: false, message:"This feature will be made available soon"}, 
     {id:2, 'name':'Hospital', status: false, message:"This feature will be made available soon"},
     {id:3, 'name':'Pharma', status: true, message:"This feature will be made available soon"},
     {id:4, 'name':'Labs & Diagnostics', status: false, message:"This feature will be made available soon"},
     {id:5, 'name':'Ambulance', status: false, message:"This feature will be made available soon"},
     {id:6, 'name':'Other Services', status: false, message:"This feature will be made available soon"}] });
  };






