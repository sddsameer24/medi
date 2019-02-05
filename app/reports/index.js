'use strict';


const AWS = require('aws-sdk');
const dynamo = new AWS.DynamoDB.DocumentClient();
var uuid = require('uuid');
const tableName = process.env.TABLE_NAME;

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

exports.SheduleReport = async (event) => {
    
    let params = {
        TableName: tableName,
        Item: JSON.parse(event.body)
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
