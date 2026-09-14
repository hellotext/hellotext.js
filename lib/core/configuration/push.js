class Push {
  static serviceWorkerUrl = null;
  static channelId = null;
  static assign(props) {
    this.serviceWorkerUrl = props?.serviceWorkerUrl || null;
    this.channelId = props?.channelId || null;
    return this;
  }
}
export { Push };