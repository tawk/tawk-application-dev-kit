'use strict';

const App = require('./app');

class McpApp extends App {
	static _getAuthHeaders(authType, authParams) {
		if (!authType || authType === 'none') {
			return {};
		}

		if (authType === 'basic') {
			const user = authParams?.username ?? '';
			const pass = authParams?.password ?? '';
			return {
				Authorization : `Basic ${Buffer.from(`${user}:${pass}`).toString('base64')}`
			};
		}

		if (authType === 'bearer') {
			return {
				Authorization : `Bearer ${authParams?.token ?? ''}`
			};
		}

		if (authType === 'headers') {
			const headers = {};
			for (const entry of authParams ?? []) {
				if (entry?.key) {
					headers[entry.key] = entry.value;
				}
			}
			return headers;
		}

		return {};
	}

	static _getClient(params) {
		const {
			url,
			headers
		} = params || {};

		return {
			url,
			headers,
			async request() {
				return { data : {} };
			}
		};
	}

	// In the real integration runtime, McpApp implements toolkit methods.
	static async getTools() {
		return {};
	}

	static async callTool() {
		throw new Error('Tool not found');
	}
}

module.exports = McpApp;


