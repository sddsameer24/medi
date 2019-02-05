const AWS = require('aws-sdk');
AWS.config.update({region: 'us-east-1'});
const dynamo = new AWS.DynamoDB.DocumentClient({apiVersion: '2012-08-10'});


const authVerify = {

	
	verify : async (payload) => {
        let { Authorization } = payload.headers;
   
        if(Authorization){
         const secret = 'harimohanchcoco';
         //  const verify = (Authorization, cb) => jwt.verify(Authorization, secret, {}, cb);
         // console.log("jwts", verify());
             let params = {
                 TableName: "Tokens",
                 Key: {
                     "hash": Authorization
                    }
                    
             };
             
             try {
                 let user = await dynamo.get(params).promise();
                 console.log("useruser", user);
                 if(user.Item){
                     return {status: true, ...user.Item}
                 } else{
                     return { status: false, error:"session expire" };
                 }
                 
         
             } catch(e){
                 return { status: false, error:"session expire" };
             }
        } else {
         return { status: false, error:"session expire" };
        }
        
     
        return { status: false, error:"session expire" };
         
         

	},
	

}

module.exports = authVerify;
