import BlockUIService from './blockUIService';
import BreadCrumbService from './breadCrumbService';
import {AxiosInstance} from 'axios';
import AuthService from './authService';
import {TResponseApi} from '../@types/httpApi';

export default class AbstractService {
    public blockUIService: BlockUIService;

    public breadCrumbService: BreadCrumbService;

    private authService: AuthService;

    protected api: AxiosInstance;

    protected rota: string;

    constructor(api: any, rota: string) {
        this.blockUIService = new BlockUIService();
        this.breadCrumbService = new BreadCrumbService();
        this.authService = new AuthService();
        this.api = api;
        this.rota = rota;
    }

    public create(body: any) {
        return this.api.post(`${this.rota}`, this.cleanObject(body));
    }

    public update(body: any) {
        return this.api.put(`${this.rota}`, this.cleanObject(body));
    }


    public findById(id: any) {
        return this.api.get(`${this.rota}/${id}`);
    }


    public delete(id: any) {
        return this.api.delete(`${this.rota}/${id}`);
    }


    public findAll(params?: any): Promise<TResponseApi<any>> {
        let query = '';
        if (!!params) {
            query = this.serialize(params);
        }
        return this.api.get(`${this.rota}?${query}`);
    }


    public start() {
        this.blockUIService.start();
    }

    public stop() {
        this.blockUIService.stop();
    }

    public getUser() {
        return AuthService.getUser();
    }

    public defaultCatch(err: any) {
        this.stop();
        return err;
    }

    public defaultSuccess(res: any) {
        this.stop();
        if (res.succeeded) {
            return true;
        }
        return false;
    }

    public serialize(obj: any[]) {
        const str = [];
        for (const p in obj) {
            if (obj.hasOwnProperty(p) && (!!obj[p] || obj[p] === 0) && typeof obj[p] !== 'function' && p !== 'lista') {
                str.push(encodeURIComponent(p) + '=' + encodeURIComponent(obj[p]));
            }
        }
        return str.join('&');
    }

    public cleanObject(obj: any[]) {
        const _obj: any = {};
        for (const p in obj) {
            if (obj.hasOwnProperty(p) && (!!obj[p] || obj[p] === 0) && typeof obj[p] !== 'function' && p !== 'lista') {
                _obj[p] = obj[p];
            }
        }
        return obj;
    }

    toFormData(item: any) {
        const formData = new FormData();
        for (const key in item) {
            if (typeof item[key] !== 'function') {
                this.appendFormData(formData, item, key);
            }
        }
        return formData;
    }

    appendFormData(formData: FormData, item: any, key: any) {
        if (typeof item[key] === 'function') {
            return;
        }
        if (typeof item[key] === 'object') {
            formData.append(key + 'Str', JSON.stringify(item[key]))
            return;
        }
        formData.append(key, item[key])
    }

    blockScroll() {
        document.getElementsByTagName('html')[0].style.overflow = 'hidden';
    }

    unlockScroll() {
        document.getElementsByTagName('html')[0].style.overflow = 'auto';
    }

}
