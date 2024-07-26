import Consent from '../common/consent'

export default class WebConsent implements Consent {
  #dialogId = 'automated-usage-tracking-tool-dialog'
  #dialogContentId = `${this.#dialogId}-content`
  #dialogFooterId = `${this.#dialogId}-footer`
  #dialogConfirmButtonId = `${this.#dialogId}-confirm-button`
  #dialogDeclineButtonId = `${this.#dialogId}-decline-button`

  askConsentConfirm(message: string = Consent.message) {
    // Only allows yes
    return new Promise<boolean>((resolve) => {
      this.#setDialog(this.#confirmButtonHandler(resolve), null, true, message)
    })
  }

  askConsentQuestion(message: string = Consent.message) {
    // if declines, continues without tracking
    return new Promise<boolean>((resolve) => {
      this.#setDialog(this.#confirmButtonHandler(resolve), this.#declineButtonHandler(resolve), false, message)
    })
  }

  #setDialog(confirmButtonHandler: EventListener, declineButtonHandler: EventListener | null, isConfirmDialog: boolean, message: string) {
    if (!this.#confirmDialogExists()) {
      this.#insertConfirmDialog(isConfirmDialog, message)
      this.#setEventHandler(this.#getDialogButton(this.#dialogConfirmButtonId), 'click', confirmButtonHandler)
      this.#preventEscape()
      if (!isConfirmDialog) {
        this.#setEventHandler(this.#getDialogButton(this.#dialogDeclineButtonId), 'click', declineButtonHandler!)
      }
    }
    this.#getConfirmDialog().showModal()
  }

  #getConfirmDialogHTML(isConfirmDialog: boolean, message: string) {
    const declineButtonHtml = isConfirmDialog ? '' : `<button id=${this.#dialogDeclineButtonId}>No</button>`
    return `
          <dialog id=${this.#dialogId}> 
            <div id=${this.#dialogContentId}>${message}</div>
            <div id=${this.#dialogFooterId}>            
              <button id=${this.#dialogConfirmButtonId}>Yes</button>
              ${declineButtonHtml}
            </div>
          </dialog>`
  }

  #getConfirmDialog(): HTMLDialogElement {
    return document.getElementById(this.#dialogId) as HTMLDialogElement
  }

  #getDialogButton(buttonId: string) {
    return document.getElementById(buttonId)!
  }

  #setEventHandler(element: HTMLElement, event: string, handler: EventListener) {
    element.addEventListener(event, handler)
  }

  #confirmDialogExists() {
    return document.getElementById(this.#dialogId)
  }

  #insertConfirmDialog(isConfirmDialog: boolean, message: string) {
    document.body.insertAdjacentHTML('beforeend', this.#getConfirmDialogHTML(isConfirmDialog, message))
  }

  #commonButtonHandler(resolve: Function, value: boolean) {
    this.#getConfirmDialog().close()
    resolve(value)
  }

  #confirmButtonHandler(resolve: Function) {
    return () => this.#commonButtonHandler(resolve, true)
  }

  #declineButtonHandler(resolve: Function) {
    return () => this.#commonButtonHandler(resolve, false)
  }

  #preventEscape() {
    this.#getConfirmDialog().addEventListener('keydown', (event) => {
      if (event.key === 'Escape') {
        event.preventDefault()
      }
    })
  }
}
