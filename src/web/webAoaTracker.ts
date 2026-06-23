import AoaTracker from '../aoa/aoaTracker'
import { AOAConfig, AOA_DEFAULT_TOKEN_URL, AOA_DEFAULT_API_URL } from '../aoa/aoaClient'

export default class WebAoaTracker extends AoaTracker {
  #warningDialogId = 'automated-usage-tracking-tool-dialog-warning'

  constructor() {
    super()
    this.init()
  }

  protected resolveConfig(): AOAConfig | null {
    try {
      const clientId = localStorage.getItem('aoaClientId') ?? ''
      const clientSecret = localStorage.getItem('aoaClientSecret') ?? ''

      if (!clientId || !clientSecret) return null

      const tokenUrl = localStorage.getItem('aoaTokenUrl') ?? AOA_DEFAULT_TOKEN_URL
      const apiUrl = localStorage.getItem('aoaApiUrl') ?? AOA_DEFAULT_API_URL

      return { clientId, clientSecret, tokenUrl, apiUrl }
    } catch {
      return null
    }
  }

  protected warnMissing(message: string): void {
    if (typeof document === 'undefined') {
      console.warn(`[AOA] ${message}`)
      return
    }
    if (!document.getElementById(this.#warningDialogId)) {
      const html = `
        <dialog id="${this.#warningDialogId}" style="padding: 4px;">
          <div id="${this.#warningDialogId}-content">${message}</div>
          <div id="${this.#warningDialogId}-footer" style="text-align: center; padding-top: 10px;">
            <button id="${this.#warningDialogId}-close-button">OK</button>
          </div>
        </dialog>`
      document.body.insertAdjacentHTML('beforeend', html)
      document.getElementById(`${this.#warningDialogId}-close-button`)!.addEventListener('click', () => {
        (document.getElementById(this.#warningDialogId) as HTMLDialogElement).close()
      })
    }
    const dialog = document.getElementById(this.#warningDialogId) as HTMLDialogElement
    if (dialog.showModal) {
      dialog.showModal()
    }
  }
}
