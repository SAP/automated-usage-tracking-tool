# JavaScript CLI Client Example

This project demonstrates the integration of the `@sap_oss/automated-usage-tracking-tool` with a JavaScript CLI client application.

## Project Structure

```
../examples/javascript-cli-client/
├── package.json
├── src/
│   ├── index.js
│   └── lib/
│       └── automatedUsageTrackingToolWrapper.js
```

## Installation

To install the dependencies, run:

```sh
npm install
```

## Usage

To build and run the project, use the following command:

```sh
npm start
```

This will compile the JavaScript code and execute the resulting JavaScript file.

## Code Overview

### `src/index.js`

This is the entry point of the application. It imports and uses functions from [`automatedUsageTrackingToolWrapper.js`](../examples/javascript-cli-client/src/lib/automatedUsageTrackingToolWrapper.js).

### `src/lib/automatedUsageTrackingToolWrapper.js`

This file contains the wrapper functions for the `@sap_oss/automated-usage-tracking-tool`. It initializes the tracker without explicit arguments — credentials are resolved automatically from environment variables.

### Configuration

Set the following environment variables (or add them to a `.env` file):

| Variable | Required | Description |
|----------|----------|-------------|
| `AOA_CLIENT_ID` | Yes | OAuth2 client ID |
| `AOA_CLIENT_SECRET` | Yes | OAuth2 client secret |
| `AOA_TOKEN_URL` | Yes | OAuth2 token endpoint URL |
| `AOA_API_URL` | Yes | AOA API base URL |

> No code changes are required when updating the library — credentials are resolved automatically.

For full configuration details, see the [main README](../../README.md#configure-credentials).

## License

This project is licensed under the ISC License. See the [LICENSE](../../LICENSE) file for details.
