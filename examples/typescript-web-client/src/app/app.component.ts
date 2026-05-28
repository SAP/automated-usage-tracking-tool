import { Component } from '@angular/core'
import { requestConsentConfirmation, requestConsentQuestion, trackUsage } from '../lib/automatedUsageTrackingToolWrapper'

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css'],
})
export class AppComponent {
  title = 'typescript-web-client'

  requestConsentQuestionButtonClickHandler() {
    requestConsentQuestion()
  }

  requestConsentConfirmationButtonClickHandler() {
    requestConsentConfirmation()
  }

  trackUsageButtonClickHandler() {
    trackUsage()
  }
}
