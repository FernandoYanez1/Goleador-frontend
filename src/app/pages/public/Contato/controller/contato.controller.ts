import {useState} from "react";
import axios from "axios";
import ToastService from "../../../../../vendors/services/toastService";
import Environment from "../../../../../environments/environment";

export const urlApi = axios.create({
    baseURL: 'https://moicanos.com.br/api',
});

export default class ContatoController {

    public nome: any;
    public setNome: any;
    public telefone: any;
    public setTelefone: any;
    public block: any;
    public setBlock: any;
    public qtde: any;
    public setQtde: any;
    public local: any;
    public setLocal: any;

    constructor() {
        [this.nome, this.setNome] = useState('');
        [this.telefone, this.setTelefone] = useState('');
        [this.block, this.setBlock] = useState(false);
        [this.qtde, this.setQtde] = useState(0);

        [this.local, this.setLocal] = useState('');
    }

    init() {
        this.obterQuantidadeRegistro();
    }

    obterQuantidadeRegistro() {
        urlApi.get('/contato').then((res: any) => {
            this.setQtde(res.data);
        });
    }

    cadastrar() {
        if (!this.nome) {
            ToastService.showWarn('Nome não preenchido.');
            return;
        }
        if (!this.telefone) {
            ToastService.showWarn('Telefone não preenchido.');
        }
        if (!this.local) {
            ToastService.showWarn('Local não preenchido.');
        }
        this.setBlock(true);
        urlApi.post('/contato', {nome: this.nome, telefone: this.telefone, local: this.local}).then(res => {
            this.limpar();
            this.obterQuantidadeRegistro();
            ToastService.showSuccess('Parabéns! Registro cadastrado com sucesso.');
        }).catch(err => {
            this.setBlock(false);
            this.obterQuantidadeRegistro();
            ToastService.showError('Falha na requisiação.');
        });

    }

    limpar() {
        this.setNome('');
        this.setTelefone('');
        this.setBlock(false);
    }
}
