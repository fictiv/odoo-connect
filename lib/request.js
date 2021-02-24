'use strict';
const jaysonPromiseBrowserClient = require('jayson/promise/lib/client/browser');
const fetch = require('node-fetch');

module.exports = (connection, path, params) => {
	if (typeof path === 'object') {
		params = path;
		path = '/web/dataset/call_kw';
	}

	const config = {
		host: connection.host,
		port: connection.port,
		path: path || '',
		headers: {
			'Content-Type': 'application/json',
			Accept: 'application/json',
			Cookie: `${connection.sid};`
		}
	};

	const url = `${connection.protocol}://${connection.host}:${connection.port}${path}`

	const callServer = function(request) {
		const options = {
			method: 'POST',
			body: request,
			headers: {
				'Content-Type': 'application/json',
				Accept: 'application/json',
				Cookie: `${connection.sid};`
			}
		}
		return fetch(url, options).then(res => res.text());
	};
	  
	const client = jaysonPromiseBrowserClient(callServer, {});
	  
	return client.request('call', params).then(result => result, err => {
		console.error(err);
		throw err;
	})
}
