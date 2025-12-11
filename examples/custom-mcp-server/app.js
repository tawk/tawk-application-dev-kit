'use strict';

const McpApp = require('@apps/domain/entities/mcp-app');

class CustomMcpServer extends McpApp {
	static id = 'custom-mcp-server';
	static name = 'MCP Server';
	static features = ['toolkit'];
	static categories = ['custom-tool'];
	static uiLabels = [];
	static singleton = false;
	static configSchema = {
		type : 'object',
		properties : {
			url : {
				type : 'string',
				'@title' : 'URL',
				'@placeholder' : 'https://mcp.example.com'
			}
		},
		required : ['url'],
		additionalProperties : false
	};

	static authSchemas = {
		none : {
			type : 'object',
			additionalProperties : false
		},
		basic : {
			type : 'object',
			properties : {
				username : {
					type : 'string',
					description : 'The username to authenticate with the MCP server',
					'@title' : 'Username',
					'@placeholder' : 'Add your username'
				},
				password : {
					type : 'string',
					description : 'The password to authenticate with the MCP server',
					'@title' : 'Password',
					'@placeholder' : 'Add your password',
					'@sensitive' : true
				}
			},
			required : ['username', 'password'],
			additionalProperties : false
		},
		bearer : {
			type : 'object',
			properties : {
				token : {
					type : 'string',
					description : 'The token to authenticate with the MCP server',
					'@title' : 'Token',
					'@placeholder' : 'Add your access token',
					'@sensitive' : true
				}
			},
			required : ['token'],
			additionalProperties : false
		},
		headers : {
			type : 'array',
			items : {
				type : 'object',
				properties : {
					key : {
						type : 'string',
						description : 'The name of the header to authenticate with the MCP server',
						pattern : '^[!#$%&\'*+\\-.^_`|~0-9a-zA-Z]+$',
						'@title' : 'Header',
						'@placeholder' : 'Add your header name'
					},
					value : {
						type : 'string',
						description : 'The value of the header to authenticate with the MCP server',
						'@title' : 'Header',
						'@placeholder' : 'Add your header value',
						'@sensitive' : true
					}
				},
				additionalProperties : false
			}
		}
	};

	static getClient(params) {
		const {
			config,
			authType,
			authParams
		} = params;

		return McpApp._getClient({
			url : config.url,
			headers : McpApp._getAuthHeaders(authType, authParams)
		});
	}
}

module.exports = CustomMcpServer;
