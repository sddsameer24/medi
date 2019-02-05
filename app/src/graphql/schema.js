'use strict';

const GraphQL = require('graphql');
const {
	GraphQLObjectType,
	GraphQLSchema,
} = GraphQL;



//Query here
const PostQuery = require('./queries/Post');

// //mutation here
// const PostMuation = require('./mutation/Post');
// const OrderSubscription = require('./subscription/nearOrder');

//OrderFile
// lets define our root query


const RootQuery = new GraphQLObjectType({
	name: 'RootQueryType',
	description: 'This is the default root query provided by our application',
	fields: {
		me: PostQuery.index(),
		
		
	}
});

// const RootMutation = new GraphQLObjectType({
// 	name: 'RootMutationType',
// 	description: 'This is the default root mutation provided by our application',
// 	fields: {
// 	//	OrderCreate: PostMuation.index(),
		
// 	}
// });

// const RootSubscription = new GraphQLObjectType({
// 	name: 'RootSubscription',
// 	description: 'This is the default root subscription provided by our application',
// 	fields: {
// 	//	OrderCreate: OrderSubscription.sub()
// 	}
// });


// export the schema
module.exports = new GraphQLSchema({
	 query: RootQuery,
	// mutation: RootMutation,
	// subscription: RootSubscription
});

