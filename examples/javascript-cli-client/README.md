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

This file contains the wrapper functions for the `@sap_oss/automated-usage-tracking-tool`. It includes functions like [`trackUsage`](../examples/javascript-cli-client/src/lib/automatedUsageTrackingToolWrapper.js#L1) and [`trackUsageArguments`](../examples/javascript-cli-client/src/lib/automatedUsageTrackingToolWrapper.js#L2).

## License

This project is licensed under the ISC License. See the [LICENSE](../../LICENSE) file for details.
