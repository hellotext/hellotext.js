export const usePopover = (controller) => {
  Object.assign(controller, {
    show() {
      this.openValue = true
    },
    hide() {
      this.openValue = false
    },
    toggle() {
      this.openValue = !this.openValue
    }
  })
}
