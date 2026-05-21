import { Component } from '@angular/core'
import { trackUsage } from '../lib/automatedUsageTrackingToolWrapper'

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css'],
})
export class AppComponent {
  title = 'typescript-web-client'

  trackUsageButtonClickHandler() {
    trackUsage()
  }
}
