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

This is the entry point of the application. It imports and uses functions from [`automatedUsageTrackingToolWrapper.ts`](src/lib/automatedUsageTrackingToolWrapper.ts).

### `src/lib/automatedUsageTrackingToolWrapper.ts`

This file contains the wrapper functions for the `@sap_oss/automated-usage-tracking-tool`. It includes functions like [`trackUsage`](src/lib/automatedUsageTrackingToolWrapper.ts#L25) and [`trackUsageArguments`](src/lib/automatedUsageTrackingToolWrapper.ts#L7).

## License

This project is licensed under the ISC License. See the [LICENSE](../../LICENSE) file for details.
