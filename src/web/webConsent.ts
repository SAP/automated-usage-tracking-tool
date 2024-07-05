import Consent from '../common/consent'

export default class WebConsent implements Consent {
  #confirmDialogId = 'automated-usage-tracking-tool-confirm-dialog'
  #confirmButtonId = 'automated-usage-tracking-tool-confirm-button'
  #declineButtonId = 'automated-usage-tracking-tool-decline-button'

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
      this.#setEventHandler(this.#getDialogButton(this.#confirmButtonId), 'click', confirmButtonHandler)
      this.#preventEscape()
      if (!isConfirmDialog) {
        this.#setEventHandler(this.#getDialogButton(this.#declineButtonId), 'click', declineButtonHandler!)
      }
    }
    this.#getConfirmDialog().showModal()
  }

  #getConfirmDialogHTML(isConfirmDialog: boolean, message: string) {
    if (isConfirmDialog) {
      return `
        <div>
          <dialog id=${this.#confirmDialogId} style="width:400px">
          <div>${message}</div>
              <button id=${this.#confirmButtonId}>Yes</button>
          </dialog>
        </div>`
    } else {
      return `
        <div>
          <dialog id=${this.#confirmDialogId} style="width:400px">
          <div>${message}</div>
              <button id=${this.#confirmButtonId}>Yes</button>
              <button id=${this.#declineButtonId}>No</button>
          </dialog>
        </div>`
    }
  }

  #getConfirmDialog(): HTMLDialogElement {
    return document.getElementById(this.#confirmDialogId) as HTMLDialogElement
  }

  #getDialogButton(buttonId: string) {
    return document.getElementById(buttonId)!
  }

  #setEventHandler(element: HTMLElement, event: string, handler: EventListener) {
    element.addEventListener(event, handler)
  }

  #confirmDialogExists() {
    return document.getElementById(this.#confirmDialogId)
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
