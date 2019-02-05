'use strict';

const app = require('./src/app');
var cors = require('cors')
// let's set the port on which the server will run
app.set( 'port', 1337 );

app.use(cors())
// start the server
app.listen(
	app.get('port'),
	() => {
		const port = app.get('port');
		console.log('GraphQL Server Running at http://127.0.0.1:' + port );
	}
);

