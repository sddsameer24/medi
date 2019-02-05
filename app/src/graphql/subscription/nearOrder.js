// import { PubSub } from 'graphql-subscriptions';

// export const pubsub = new PubSub();

// const SOMETHING_CHANGED_TOPIC = 'something_changed';

// export const resolvers = {
//   Subscription: {
//     somethingChanged: {
//       subscribe: () => pubsub.asyncIterator(SOMETHING_CHANGED_TOPIC),
//     },
//   },
// }

'use strict';

const GraphQL = require('graphql');
const {
	GraphQLList,
	GraphQLString,
	GraphQLNonNull,
} = GraphQL;

// import the Post type we created
const MedicineType = require('../types/Medicine');

// import the Post resolver we created
const SunController = require('../resolvers/subScription');


module.exports = {

	sub() {
		return {
			type: MedicineType,
			description: 'This will return all the posts we find in the given subreddit.',
			args: {
				// subreddit: {
				// 	type: GraphQLString,
				// 	description: 'Please enter subreddit name',
				// }
			},
			resolve(parent, args, context, info) {
				return SunController.sub(args);
			}
		}
	},

};

