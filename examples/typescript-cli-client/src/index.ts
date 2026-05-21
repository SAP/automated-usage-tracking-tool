import { trackUsage } from './lib/automatedUsageTrackingToolWrapper'

async function example() {
  // do some work ...
  await trackUsage()
  console.log('Usage tracked successfully!')
}

example()
