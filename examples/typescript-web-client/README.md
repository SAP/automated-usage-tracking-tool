# TypeScript Web Client Example (Angular)

This project demonstrates the integration of the automated-usage-tracking-tool with an Angular web client application.

## Project Structure

- `src/`
  - `app/`: Contains the main application code.
  - `lib/automatedUsageTrackingToolWrapper.js`: Wrapper for the automated usage tracking tool.
- `dist/`: The build artifacts will be stored here after running the build command.

## Installation

To install the project dependencies, run:

```sh
npm install
```

## Development Server

To start the development server, run:

```sh
ng serve
```

Navigate to `http://localhost:4200/` in your web browser. The app will automatically reload if you change any of the source files.

## Build

To build the project, run:

```sh
ng build
```

The build artifacts will be stored in the `dist/` directory.

## Automated Usage Tracking Tool

The project integrates the automated-usage-tracking-tool to track user interactions. The integration is handled in the `src/lib/automatedUsageTrackingToolWrapper.ts` file.

## License

This project is licensed under the ISC License. See the [LICENSE](../../LICENSE) file for details.
