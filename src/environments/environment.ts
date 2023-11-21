export default class Environment {

    private static _window: any = window;

    private static env = Environment._window['env'].ENVIRONMENT;
    private static api_url = Environment._window['env'].API_URL;
    private static version = Environment._window['env'].VERSION


    public static getEnv() {
        return Environment.env;
    }

    public static getApiUrl() {
        return Environment.api_url;
    }

    public static getVersion() {
        return Environment.version;
    }

}
