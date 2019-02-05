'use strict';

const express = require('express');
const body_parser = require('body-parser');
const { ApolloServer, gql } = require('apollo-server');
const expressGraphQL = require('express-graphql');

// let's import the schema file we just created
const GraphQLSchema = require('./graphql/schema');


const app = express();

app.use( body_parser.json({ limit: '50mb' }) );

app.use(
	'/',
	expressGraphQL( (request, response) => {
		return {
			graphiql: true,
			schema: GraphQLSchema,
			context: { 
				headers: request.headers,
				request: request, 
				test: 'Example context value'
			}
		}
	})
);

module.exports = app;

