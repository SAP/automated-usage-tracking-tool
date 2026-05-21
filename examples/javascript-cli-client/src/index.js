import { trackUsage } from './lib/automatedUsageTrackingToolWrapper.js'

async function example() {
  // do some work ...
  await trackUsage('Commerce Migration Toolkit')
  console.log('Usage tracked successfully!')
}

example()
