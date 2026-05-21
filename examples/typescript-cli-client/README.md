# TypeScript CLI Client Example

This project demonstrates the integration of the `@sap_oss/automated-usage-tracking-tool` with a TypeScript CLI client application.

## Project Structure

```
../examples/typescript-cli-client/
├── package.json
├── src/
│   ├── index.ts
│   └── lib/
│       └── automatedUsageTrackingToolWrapper.ts
└── tsconfig.json
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

This will compile the TypeScript code and execute the resulting JavaScript file.

## Code Overview

### `src/index.ts`

This is the entry point of the application. It imports and uses functions from [`automatedUsageTrackingToolWrapper.ts`](../examples/typescript-cli-client/src/lib/automatedUsageTrackingToolWrapper.ts).

### `src/lib/automatedUsageTrackingToolWrapper.ts`

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
