'use strict';
const got = require('got');
const OdooClient = require('./client');

class Odoo {

	constructor(config) {
		config = config || {};

		if (typeof config.host !== 'string') {
			throw new TypeError(`Expected \`host\` to be a \`string\`, got \`${typeof config.host}\``);
		}

		this._config = Object.assign({
			port: 80
		}, config);
	}

	connect(opts) {
		const config = Object.assign({}, this._config, opts);

		const params = {
			db: config.database,
			login: config.username,
			password: config.password
		};

		// Throw them away
		delete config.database;
		delete config.username;
		delete config.password;

		const body = JSON.stringify({params});

		const headers = {
			'Content-Type': 'application/json',
			Accept: 'application/json'
		};

		const createError = err => {
			const error = new Error(err.message);
			error.code = err.code;
			error.data = err.data;
			return error;
		};

		const protocol = config.protocol === 'https' ?
			'https://' : config.protocol === 'http' ?
			'http://' : '';

		return got.post(`${protocol}${config.host}:${config.port}/web/session/authenticate`, {json: true, headers, body})
			.then(res => {
				if (res.body.error) {
					// HTTP Status is 200 / OK!
					throw createError(res.body.error);
				}

                const cookieHeader = res.headers['set-cookie'] + '';
                
                var obj = {}
                var pairs = cookieHeader.split(/; */);

                for (var i = 0; i < pairs.length; i++) {
	              var pair = pairs[i];
	              var eq_idx = pair.indexOf('=');

	              if (eq_idx < 0) {
	                continue;
	              }

	              var key = pair.substr(0, eq_idx).trim()
	              var val = pair.substr(++eq_idx, pair.length).trim();

	              if ('"' == val[0]) {
	                val = val.slice(1, -1);
	              }

	              if (undefined == obj[key]) {
	                obj[key] = val;
	              }
	            }
	            
	            const sessionId = obj['session_id'];
	            
	            return new OdooClient(res.body.result, {
	                protocol: config.protocol,
	                host: config.host,
	                port: config.port,
	                sid: `session_id=${sessionId}`,
	            });
			});
	}
}

module.exports = Odoo;