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

This file contains the wrapper functions for the `@sap_oss/automated-usage-tracking-tool`. It includes functions like [`trackUsage`](../examples/typescript-cli-client/src/lib/automatedUsageTrackingToolWrapper.ts#L1) and [`trackUsageArguments`](../examples/typescript-cli-client/src/lib/automatedUsageTrackingToolWrapper.ts#L2).

## AOA Tracking (Optional)

To additionally enable AOA tracking, set `AOA_CLIENT_ID` and `AOA_CLIENT_SECRET` as environment variables. No code changes are needed — the library resolves credentials automatically. See the [main README](../../README.md#aoa-tracking-optional) for details.

## License

This project is licensed under the ISC License. See the [LICENSE](../../LICENSE) file for details.
