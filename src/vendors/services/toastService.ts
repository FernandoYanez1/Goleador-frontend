export default class ToastService {
  static toast: any = undefined;

  static timeout = 3000;

  public static init(toast: any) {
    this.toast = toast;
  }

  public static showSuccess(message: string | null) {
    this._show('success', message);
  }

  public static showInfo(message: string | null) {
    this._show('info', message);
  }

  public static showWarn(message: string | null) {
    this._show('warn', message);
  }

  public static showError(message: string | null) {
    this._show('error', message);
  }

  private static _show(_severity: string, _message: string | null) {
    if (!_message) {
      return;
    }
    this.toast.show({
      severity: _severity,
      detail: _message,
      life: this.timeout,
    });
  }
}
