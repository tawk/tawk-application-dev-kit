'use strict';

const App = require('@apps/domain/entities/app');

class BasicApp extends App {
	static name = 'Basic Integration';
	static categories = ['messaging'];
	static features = ['toolkit'];
	static uiLabels = [];
	static singleton = true;

	static configSchema = {
		type : 'object',
		properties : {
			url : {
				type : 'string',
				'@title' : 'Server URL',
				'@placeholder' : 'https://api.your-service.com'
			}
		},
		required : ['url'],
		additionalProperties : false
	};

	static authSchemas = {
		apiKey : {
			type : 'object',
			properties : {
				key : {
					type : 'string',
					'@title' : 'API Key',
					'@sensitive' : true
				}
			},
			required : ['key'],
			additionalProperties : false
		}
	};

	static getClient(params) {
		const {
			config,
			authType,
			authParams
		} = params;

		const headers = {
			Accept : 'application/json'
		};
		if (authType === 'apiKey') {
			headers.Authorization = `Bearer ${authParams.key}`;
		}

		async function get(path) {
			const response = await fetch(new URL(path, config.url), { headers });

			if (!response.ok) {
				const err = new Error(`GET ${path} failed with status ${response.status}`);
				err.statusCode = response.status;
				err.data = data;
				throw err;
			}

			const data = await response.json();

			return { data };
		}

		return { get };
	}

	static async getTools(params) {
		// Example: Manually defining a tool that this app provides
		return {
			ping : {
				name : 'ping',
				title : 'Ping Service',
				description : 'Checks connectivity to the service',
				inputSchema : {
					type : 'object',
					properties : {},
					additionalProperties : false
				},
				outputSchema : {
					type : 'object',
					properties : {
						status : { type : 'string' }
					}
				}
			}
		};
	}

	static async callTool(params) {
		const {
			client,
			toolName
		} = params;

		if (toolName === 'ping') {
			try {
				const response = await client.get('/ping');
				return response.data;
			} catch (error) {
				throw new Error(`Ping failed: ${error.message}`);
			}
		}

		throw new Error(`Tool ${toolName} not found`);
	}
}

module.exports = BasicApp;
