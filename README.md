[![REUSE status](https://api.reuse.software/badge/github.com/SAP/automated-usage-tracking-tool)](https://api.reuse.software/info/github.com/SAP/automated-usage-tracking-tool)

# automated usage tracking tool

## About this project

The automated usage tracking tool is designed with a user-focused approach, utilizing a Customer Data Cloud tenant, to monitor the activity on Customer Experience Inovation and Automation's tools. Its purpose is to gather data on tool use, generate in-depth reports, and provide insights into tool performance and possible enhancements. This is an open source project as we believe in transparency and accessibility. The client code of the usage tracker should be easily accessible to users of the tools like https://github.com/SAP/sap-customer-data-cloud-toolkit and https://github.com/SAP/sap-customer-data-cloud-accelerator.

## Requirements and Setup

This tool is ready to use by Javascript/Typescript client applicarions after importing and install it from NPM.

### Create a new project

```sh
npm init
```

### Install @sap_oss/automated-usage-tracking-tool as a dependency of the new project

```sh
npm install @sap_oss/automated-usage-tracking-tool
```

### Import the default artifact

```js
import TrackingTool from '@sap_oss/automated-usage-tracking-tool'
```

### Initialize the tracker

```js
const trackingTool = new TrackingTool({
  apiKey: [apiKey],
  dataCenter: [dataCenter],
  storageName: [storageName], // Optional
})
```

### Ask for consent confirmation or ask consent question

```js
await trackingTool.requestConsentConfirmation() // Answer: Yes (or exit app)
// OR
await trackingTool.requestConsentQuestion() // Answer: Yes or No
```

### Track usages of your application features

```js
trackingTool.trackUsage({
  toolName: [toolName],
  featureName: [featureName],
})
```

### Check if consent was already granted

```js
trackingTool.isConsentGranted()
```

### For the web version, there is the option to import the sap_horizon theme to be applied to the consent dialog

```js
import '@sap_oss/automated-usage-tracking-tool/theme/sap_horizon.css'
```

### Aditional argument types are available for Typescript client applications

```js
import { TrackerArguments, TrackUsageArguments, ConsentArguments } from '@sap_oss/automated-usage-tracking-tool'
```

### Usage examples

On the /examples folder there are available example Javascript and Typescript Web and CLI client apps using the tool.

## Support, Feedback, Contributing

This project is open to feature requests/suggestions, bug reports etc. via [GitHub issues](https://github.com/SAP/automated-usage-tracking-tool/issues). Contribution and feedback are encouraged and always welcome. For more information about how to contribute, the project structure, as well as additional contribution information, see our [Contribution Guidelines](CONTRIBUTING.md).

## Security / Disclosure

If you find any bug that may be a security problem, please follow our instructions at [in our security policy](https://github.com/SAP/automated-usage-tracking-tool/security/policy) on how to report it. Please do not create GitHub issues for security-related doubts or problems.

## Code of Conduct

We as members, contributors, and leaders pledge to make participation in our community a harassment-free experience for everyone. By participating in this project, you agree to abide by its [Code of Conduct](https://github.com/SAP/.github/blob/main/CODE_OF_CONDUCT.md) at all times.

## Licensing

Copyright 2024 SAP SE or an SAP affiliate company and automated-usage-tracking-tool contributors. Please see our [LICENSE](LICENSE) for copyright and license information. Detailed information including third-party components and their licensing/copyright information is available [via the REUSE tool](https://api.reuse.software/info/github.com/SAP/automated-usage-tracking-tool).
