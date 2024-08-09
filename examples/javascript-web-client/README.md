# JavaScript Web Client Example

This project demonstrates the integration of the automated-usage-tracking-tool with a JavaScript web client application.

## Project Structure

- `src/`
  - `index.js`: Main entry point of the application.
  - `index.html`: HTML file to load the web client.
  - `lib/automatedUsageTrackingToolWrapper.js`: Wrapper for the automated usage tracking tool.
- `dist/`
  - `bundle.js`: Bundled output file generated by Webpack.

## Installation

To install the project dependencies, run:

```sh
npm install
```

## Build

To build the project, run:

```sh
npm run build
```

The build artifacts will be stored in the `dist/` directory.

## Usage

Open `index.html` in a web browser to see the application in action. The application provides buttons to request consent confirmation, ask a consent question, and track usage.

## Automated Usage Tracking Tool

The project integrates the automated-usage-tracking-tool to track user interactions. The integration is handled in the `src/lib/automatedUsageTrackingToolWrapper.js` file.

## License

This project is licensed under the ISC License. See the [LICENSE](../../LICENSE) file for details.