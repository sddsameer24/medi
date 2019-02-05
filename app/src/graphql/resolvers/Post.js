'use strict';

const AWS = require('aws-sdk');
const dynamo = new AWS.DynamoDB.DocumentClient();
var gcm = require("node-gcm");
const fs = require('fs');

const cognitoIdentityService = new AWS.CognitoIdentityServiceProvider({apiVersion: '2016-04-19', region: 'us-east-1'});
 
const axios = require('axios');


const PostsController = {

	index: ( args ) => {

		const URL = `https://www.reddit.com/r/${ args.subreddit || 'javascript' }.json`;

		return axios.get( URL )
			.then( (response) => {
				const __posts = [];
				const posts = response.data.data.children;

				posts.map( post => {
					post.data.content = post.data.selftext_html;
					__posts.push( post.data );
				} );
				return __posts;
			})
			.catch( (error) => {
				return { error: error }
			});

	},


	 


}

module.exports = PostsController;
