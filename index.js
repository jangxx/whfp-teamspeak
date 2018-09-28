const TeamspeakClient = require('node-teamspeak');
const async = require('async');

const { Plugin } = require('webhookify-plugin');

class TeamspeakPlugin extends Plugin {
	constructor(config) {
		super("teamspeak", config);
	}

	handlePush(payload) {
		let apikey = this.config.apikey;
		let address = "localhost";

		let action = payload.action;

		this._initClient(address, apikey).then((result) => {
			let { client, clid } = result;

			switch(action) {
				case "mic":
					return this._getVariable(client, clid, "client_input_muted").then((value) => {
						return this._setVariable(client, "client_input_muted", (value == 1) ? 0 : 1);
					}).then(() => {
						return client;
					});
				case "sound":
					return this._getVariable(client, clid, "client_output_muted").then((value) => {
						return this._setVariable(client, "client_output_muted", (value == 1) ? 0 : 1);
					}).then(() => {
						return client;
					});
			}
		}).then((client) => {
			client.end();
		}).catch((err) => {
			console.log("An error occured:", err.message);
		});
	}

	/**
	 * Gets the value of a client variable
	 * @param {TeamspeakClient} client 
	 * @param {Number} clid 
	 * @param {String} variable 
	 */
	_getVariable(client, clid, variable) {
		return new Promise((resolve, reject) => {
			let req = {};
			req.clid = clid;
			req[variable] = 0; //can be set to anything
	
			client.send('clientvariable', req, function(err, resp) {
				if (err) return reject(err);
				return resolve(resp[variable]);
			});
		})
	}

	/**
	 * Set the value of a client variable
	 * @param {TeamspeakClient} client 
	 * @param {String} variable 
	 * @param {String} value to set the variable to
	 */
	_setVariable(client, variable, value) {
		return new Promise((resolve, reject) => {
			let req = {};
			req[variable] = value;
	
			client.send('clientupdate', req, function(err, resp) {
				if (err) return reject(err);
				return resolve();
			});
		});
	}

	/**
	 * Initializes a new client
	 * @param {string} address 
	 * @param {string} apikey 
	 * @returns A promise which resolves if the client was created successfully
	 */
	_initClient(address, apikey) {
		return new Promise((resolve, reject) => {
			async.waterfall([
				function(callback) {
					var cl = new TeamspeakClient(address, 25639);
					cl.callbackfired = false;
		
					cl.on('error', function(err) {
						console.log("Error in client:", err.message);
						if(!cl.callbackfired) {
							cl.callbackfired = true;
							callback(err, cl);
						}
					});
					cl.on('connect', function() {
						if(!cl.callbackfired) {
							cl.callbackfired = true;
							callback(null, cl);
						}
					});
				},
				function(cl, callback) {
					cl.send('auth', {apikey: apikey}, function(err, resp) {
						callback(err, cl);
					});
				},
				function(cl, callback) {
					cl.send('whoami', {}, function(err, resp) {
						if(err) {
							callback(err, cl, null);
						} else {
							callback(null, cl, resp.clid);
						}
		
					});
				}
			], (err, client, clid) => {
				if (err) {
					client.end();
					return reject(err);
				}

				return resolve({ client, clid });
			});				
		});
	}
}

module.exports = TeamspeakPlugin;