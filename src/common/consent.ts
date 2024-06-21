export default abstract class Consent {
  static message: string =
    'This app collects anonymous usage data to help deliver and improve this product.' +
    ' By installing this app, you agree to share this information with SAP.' +
    ' If you wish to revoke your consent, please uninstall the app. Do you want to continue? (Y/n)'
  abstract askConsentConfirm(): void
  abstract askConsentQuestion(): void
}

export enum ConsentType {
  CONFIRMATION = 'confirmation',
  QUESTION = 'question',
}
