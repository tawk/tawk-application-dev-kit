'use strict';

class App {
	static id = 'app';
	static name = 'App';
	static features = [];
	static categories = [];
	static uiLabels = [];

	static configSchema = {
		type : 'object',
		additionalProperties : false
	};

	static authSchemas = {
		none : {
			type : 'object',
			additionalProperties : false
		}
	};

	static content = {};

	static getConfigSchema() {
		return this.configSchema;
	}

	static getAuthSchemas() {
		return this.authSchemas;
	}

	static getClient() {
		throw new Error('getClient() must be implemented');
	}

	static async getTools() {
		throw new Error('getTools() must be implemented');
	}

	static async callTool() {
		throw new Error('callTool() must be implemented');
	}
}

module.exports = App;


