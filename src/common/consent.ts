export default abstract class Consent {
  static message: string =
    'This app collects anonymous usage data to help deliver and improve this product.' +
    ' By installing this app, you agree to share this information with SAP.' +
    ' If you wish to revoke your consent, please uninstall the app. Do you want to continue?'

  abstract askConsentConfirm(): Promise<boolean>
  abstract askConsentQuestion(): Promise<boolean>

  provideConsentConfirmAnswer(consent: string = Consent.message): Promise<boolean> {
    return new Promise<boolean>((resolve, reject) => {
      consent?.toUpperCase() === 'Y' || consent?.toUpperCase() === 'YES' ? resolve(true) : reject(false)
    })
  }

  provideConsentQuestionAnswer(consent: string = Consent.message): Promise<boolean> {
    return new Promise<boolean>((resolve, reject) => {
      resolve(consent?.toUpperCase() === 'Y' || consent?.toUpperCase() === 'YES' ? true : false)
    })
  }
}
