[![REUSE status](https://api.reuse.software/badge/github.com/SAP/automated-usage-tracking-tool)](https://api.reuse.software/info/github.com/SAP/automated-usage-tracking-tool)

# automated usage tracking tool

## About this project

automated usage tracking tool is a user-centric data collection tool, using a Customer Data Cloud tenant, that tracks the usage of CX IAS's automation tools, generates comprehensive reports for evaluating tool effectiveness and improvements.

## Requirements and Setup

This tool is ready to use by Javascript/Typescript client apps after importing and install it from NPM.

### Create a new project

```sh
npm init
```

### Install @sap_oss/automated-usage-tracking-tool as a dependency of the new project

```sh

npm install @sap_oss/automated-usage-tracking-tool
```

### Import the default artifact

```sh
import trackingTool from '@sap_oss/automated-usage-tracking-tool'
```

### Initialize the tracker

```sh
    trackingTool.init({
        apiKey: [apiKey],
        dataCenter: [dataCenter],
        storageName: [storageName],
    })
```

### Ask for consent confirmation or ask consent question

```sh
    await trackingTool.requestConsentConfirmation()

    await trackingTool.requestConsentQuestion()
```

### Track usages of your application features

```sh
    trackingTool.trackUsage({
        toolName: [toolName],
        featureName: [featureName],
    })
```

### Check if consent was already granted

```sh
    trackingTool.isConsentGranted()
```

### For the web version, there is the option to import the sap_horizon theme to be applied to the consent dialog

```sh
import '@sap_oss/automated-usage-tracking-tool/styles/sap_horizon.css'
```

### Aditional argument types are available for Typescript client applications

```sh
    import trackingTool, {
        TrackerArguments,
        TrackUsageArguments,
        ConsentArguments,
    } from "@sap_oss/automated-usage-tracking-tool";
```

## Support, Feedback, Contributing

This project is open to feature requests/suggestions, bug reports etc. via [GitHub issues](https://github.com/SAP/automated-usage-tracking-tool/issues). Contribution and feedback are encouraged and always welcome. For more information about how to contribute, the project structure, as well as additional contribution information, see our [Contribution Guidelines](CONTRIBUTING.md).

## Security / Disclosure

If you find any bug that may be a security problem, please follow our instructions at [in our security policy](https://github.com/SAP/automated-usage-tracking-tool/security/policy) on how to report it. Please do not create GitHub issues for security-related doubts or problems.

## Code of Conduct

We as members, contributors, and leaders pledge to make participation in our community a harassment-free experience for everyone. By participating in this project, you agree to abide by its [Code of Conduct](https://github.com/SAP/.github/blob/main/CODE_OF_CONDUCT.md) at all times.

## Licensing

Copyright 2024 SAP SE or an SAP affiliate company and automated-usage-tracking-tool contributors. Please see our [LICENSE](LICENSE) for copyright and license information. Detailed information including third-party components and their licensing/copyright information is available [via the REUSE tool](https://api.reuse.software/info/github.com/SAP/automated-usage-tracking-tool).
