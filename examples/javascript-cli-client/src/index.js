import { requestConsentConfirmation, trackUsage } from './lib/automatedUsageTrackingToolWrapper.js'

async function exampleWithConsentConfirmation() {
  try {
    await requestConsentConfirmation()
    // do some feature 1 work ...
    await trackUsage({ featureName: 'feature1' })
  } catch (error) {
    // promise was rejected because consent was not given
  }
}

async function exampleWithConsentQuestion() {
  const consent = await requestConsentQuestion()
  // do some feature 2 work ...
  if (consent) {
    await trackUsage({ featureName: 'feature2' })
  } else {
    // consent was not given, tracking is not done
  }
}

exampleWithConsentConfirmation()
//exampleWithConsentQuestion()
