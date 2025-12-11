# Integration Application Development Guide

This guide explains how to create custom integration applications for the tawk.to platform. An application consists of two main files that reside in the same directory:

1.  **`app.js`**: Defines the application's behavior, configuration schema, and authentication methods.
2.  **`metadata.json`**: Provides the content, text, and assets for the application's catalog listing.

## 1. Application Logic (`app.js`)

The `app.js` file is the core of your integration. It must export a class that extends one of the provided base classes.

### Base Classes

The runtime environment provides the following base classes via aliased requires. You do not need to install these packages; they are available globally in the integration environment.

-   **`App`**: `require('@apps/domain/entities/app')`
    The generic base class for all applications. Use this for most standard integrations.

-   **`McpApp`**: `require('@apps/domain/entities/mcp-app')`
    A specialized base class for **Model Context Protocol (MCP)** servers. Use this if you are building an integration that exposes tools or resources via the MCP standard.

### Application Structure

Your class must define specific static properties and methods.

```javascript
'use strict';

const App = require('@apps/domain/entities/app');

class MyCustomApp extends App {
    // -------------------------------------------------------------------------
    // Static Properties (Metadata)
    // -------------------------------------------------------------------------

    // Display name in the catalog
    static name = 'My Custom App';

    /**
     * categories: Classification for the catalog.
     * Available values:
     * - 'messaging': Channels like WhatsApp, Messenger
     * - 'e-commerce': Shopping carts (Shopify, WooCommerce)
     * - 'cms': Content Management Systems (WordPress, Drupal)
     * - 'custom-tool': Generic tools or API integrations
     */
    static categories = ['custom-tool'];

    /**
     * features: Capabilities the app provides.
     * Available values:
     * - 'channel': Provides a messaging channel (e.g. WhatsApp)
     * - 'toolkit': Exposes tools for AI/Automation (used by McpApp)
     * - 'sidebar-tab': Adds a tab to the sidebar
     * - 'widget-installer': Installs the chat widget on a site
     */
    static features = ['toolkit'];

    // UI Labels (leave empty)
    static uiLabels = [];

    // Whether only one instance of this app can be installed per property
    static singleton = false;

    // -------------------------------------------------------------------------
    // Configuration Schemas
    // -------------------------------------------------------------------------

    /**
     * configSchema: Defines the "Configuration" step of the installation wizard.
     * Uses JSON Schema with custom annotations for UI rendering.
     *
     * NOTE: This schema generates the actual input form users fill out.
     */
    static configSchema = {
        type: 'object',
        properties: {
            url: {
                type: 'string',
                '@title': 'Server URL',
                '@placeholder': 'https://api.example.com',
                'pattern': '^https?://' // Standard JSON Schema validation is supported
            }
        },
        required: ['url']
    };

    /**
     * authSchemas: Defines the "Authentication" step.
     * A map where keys are auth types (e.g., 'basic', 'bearer') and values are schemas.
     */
    static authSchemas = {
        none: {
            type: 'object',
            additionalProperties: false
        },
        basic: {
            type: 'object',
            properties: {
                username: {
                    type: 'string',
                    '@title': 'Username'
                },
                password: {
                    type: 'string',
                    '@title': 'Password',
                    '@sensitive': true
                }
            },
            required: ['username', 'password']
        }
    };

    // -------------------------------------------------------------------------
    // Lifecycle Methods
    // -------------------------------------------------------------------------

    /**
     * getClient: Factory method to create an API client for your service.
     *
     * @param {Object} params
     * @param {Object} params.config - The validated configuration object (from configSchema)
     * @param {String} params.authType - The user-selected authentication method key (e.g., 'basic')
     * @param {Object} params.authParams - The validated authentication credentials (from authSchemas)
     * @returns {Object} A client instance capable of communicating with your service.
     */
    static getClient(params) {
        const { config, authType, authParams } = params;

        // Example: Return a custom client instance.
        // You can use any HTTP client (e.g., axios, node-fetch) or a custom SDK.
        // return new MyApiClient(config.url, authParams);

        // If extending McpApp, you can use the helper:
        /*
        return McpApp._getClient({
            url: config.url,
            headers: McpApp._getAuthHeaders(authType, authParams)
        });
        */

       // NOTE: The client object you return here will be used by the platform to execute
       // actions (like tools). If using McpApp, the base class handles this for you.
       return {};
    }

    /**
     * getTools: (Required if features includes 'toolkit')
     * Discovers available tools from the external service.
     *
     * NOTE: If you are extending McpApp, this method is already implemented for you.
     * Do NOT override it unless you need to change the default behavior.
     *
     * @param {Object} params
     * @param {Object} params.client - The client instance returned by getClient()
     * @returns {Promise<Object>} A map of tools where keys are unique Tool IDs.
     *
     * Return Structure:
     * {
     *   "send-email": {
     *     "name": "send-email",
     *     "title": "Send Email",
     *     "description": "Sends an email to a recipient",
     *     "inputSchema": {
     *       "type": "object",
     *       "properties": {
     *         "to": { "type": "string" },
     *         "subject": { "type": "string" }
     *       },
     *       "required": ["to"]
     *     },
     *     "outputSchema": { // Optional but recommended
     *       "type": "object",
     *       "properties": {
     *         "success": { "type": "boolean" }
     *       }
     *     }
     *   }
     * }
     */
    static async getTools(params) {
        const { client } = params;

        // For custom toolkit apps, fetch and map your tools here.

        return {};
    }

    /**
     * callTool: (Required if features includes 'toolkit')
     * Executes a specific tool.
     *
     * NOTE: If you are extending McpApp, this method is already implemented for you.
     * Do NOT override it unless you need to change the default behavior.
     *
     * @param {Object} params
     * @param {Object} params.client - The client instance returned by getClient()
     * @param {String} params.toolName - The name/ID of the tool to execute
     * @param {Object} params.input - The arguments for the tool
     * @returns {Promise<Object>} The result of the tool execution
     */
    static async callTool(params) {
        const { client, toolName, input } = params;
        // Example: Execute the tool via your client
        // return await client.execute(toolName, input);
        return {};
    }
}

module.exports = MyCustomApp;
```

### Schema Definition & UI Annotations

We use standard **JSON Schema** to generate the configuration and authentication forms in the UI. To customize the look and feel, we support specific annotations (properties starting with `@`).

#### Supported Data Types

-   **`string`**: Renders a text input.
-   **`boolean`**: Renders a checkbox.
-   **`number`** / **`integer`**: Renders a number input.
-   **`object`**: Renders a nested fieldset.
-   **`array`**: Renders a dynamic list where users can add or remove items.
    -   Must include an `items` schema definition.

#### Annotations Reference

| Annotation | Type | Description |
| :--- | :--- | :--- |
| **`@title`** | String | The label displayed above the input field. |
| **`@placeholder`** | String | The placeholder text shown inside the input field. |
| **`@sensitive`** | Boolean | If `true`, the input renders as a password field (masked), and values are encrypted at rest. |

#### Validation
You can use standard JSON Schema validation keywords such as `pattern` (regex), `minLength`, `maxLength`, `minimum`, and `maximum` to enforce data constraints. The UI will use these to provide real-time feedback.

#### Special Inputs

**Dropdowns (Enums)**
To create a dropdown menu, use the `enum` property in a `string` schema.
```json
{
    "type": "string",
    "enum": ["option_a", "option_b"],
    "@title": "Select an Option"
}
```

**Key-Value Lists (Array of Objects)**
To allow users to enter multiple pairs (e.g., Custom Headers), use an array of objects:
```json
{
    "type": "array",
    "items": {
        "type": "object",
        "properties": {
            "key": { "type": "string", "@title": "Name" },
            "val": { "type": "string", "@title": "Value" }
        }
    }
}
```

## 2. Metadata (`metadata.json`)

The `metadata.json` file controls how your application appears in the integration catalog. It defines the description, logo, screenshots, and installation guide.

### File Structure

The file must contain a single root object `content`.

```json
{
    "content": {
        "shortDescription": "Connect to any MCP server.",
        "vendor": {
            "name": "tawk.to"
        },
        "logoImage": {
            "type": "asset",
            "src": "/images/logos/app-logo.svg"
        },
        "overview": {
            "content": "<p>HTML content describing the app...</p>",
            "carouselImages": [
                { "type": "asset", "src": "/images/overview/screen1.jpg" }
            ]
        },
        "installation": [
            {
                "title": "Step 1: Configuration",
                "description": "Enter your server URL.",
                "images": [
                    { "type": "asset", "src": "/images/installation/step1.jpg" }
                ]
            }
        ],
        "resources": []
    }
}
```

**Note:** The `installation` array here defines the **instructional text** shown to the user in the catalog (e.g., "Step 1: Get your API Key"). It is purely informational. The actual form fields are generated from the `configSchema` in `app.js`.

### Asset Management

Images (logos, screenshots, installation guides) must be stored locally relative to your `app.js` file.

**Important:** The only supported resource type for images is `"asset"`.

1.  Create a directory structure: `assets/images/`.
2.  Place your images inside (e.g., `assets/images/logos/my-logo.svg`).
3.  Reference them in `metadata.json` using the prefix `/images/`.

**Mapping Example:**

| File System Path | Metadata Reference |
| :--- | :--- |
| `assets/images/logos/icon.svg` | `/images/logos/icon.svg` |
| `assets/images/overview/shot1.jpg` | `/images/overview/shot1.jpg` |
| `assets/images/installation/step1.jpg` | `/images/installation/step1.jpg` |

### Fields Reference

-   **`shortDescription`**: A brief summary (max 1-2 sentences) shown on the catalog card.
-   **`vendor`**: Object containing `name` (String).
-   **`logoImage`**: Object with `type: "asset"` and `src` path to the logo.
-   **`overview`**:
    -   `content`: Full HTML description of the application.
    -   `carouselImages`: Array of asset objects (`{ "type": "asset", "src": "..." }`) for screenshots.
-   **`installation`**: Array of objects defining the setup steps.
    -   `title`: Step title.
    -   `description`: Step instructions (supports HTML).
    -   `images`: Array of asset objects (`{ "type": "asset", "src": "..." }`).
-   **`resources`**: (Optional) Array of objects for external links.
    -   `label`: Link text.
    -   `url`: External URL.

## Submission

Once your application is ready for review:

1.  Zip your application folder (containing `app.js`, `metadata.json`, and the `assets` folder).
2.  Send the zip file to your tawk.to Point of Contact (PIC).
3.  Our team will review your configuration and schemas, and provide feedback on the next steps for publishing.
