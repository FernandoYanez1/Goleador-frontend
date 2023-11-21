import BreadCrumbService from './breadCrumbService';
import BlockUIService from './blockUIService';
import AuthService from './authService';
import {useRef, useState} from 'react';
import {useHistory, useLocation} from 'react-router-dom';

interface OnInit {
  init: () => void;
}

export default class AbstractController implements OnInit {
  public breadCrumbService: BreadCrumbService;

  public blockUIService: BlockUIService;

  public _authService: AuthService;


  public dt = useRef(null);

  public history: any;

  public location: any;

  public isEdit: boolean;
  public setIsEdit: any;
  public isView: boolean;
  public setIsView: any;

  constructor() {
    this.breadCrumbService = new BreadCrumbService();
    this.blockUIService = new BlockUIService();
    this._authService = new AuthService();
    this.dt = useRef(null);
    this.history = useHistory();
    this.location = useLocation();
    [this.isEdit, this.setIsEdit] = useState(false);
    [this.isView, this.setIsView] = useState(false);
  }

  blockScroll() {
    document.getElementsByTagName('html')[0].style.overflow = 'hidden';
  }

  unlockScroll() {
    document.getElementsByTagName('html')[0].style.overflow = 'auto';
  }


  init(): void {
    this.setIsEdit(window.location.href.indexOf('editar') >= 0);
    this.setIsView(window.location.href.indexOf('visualizar') >= 0);
  }

  getAcao() {
    if (this.isRegister()) {
      return 'Cadastrar';
    }
    if (this.isView) {
      return 'Visualizar';
    }
    return 'Editar';
  }

  getId() {
    const state = this.location.state;
    if (state && state.id) {
      return state.id;
    }
    return null;
  }

  isRegister() {
    return window.location.href.indexOf('cadastrar') >= 0;
  }

  public formataDropdownList(list: any[], labelValue: string) {
    const item: any = {};
    item[labelValue] = 'Selecione';
    return [
      item,
      ...list
    ];
  }

  public obterExtensao(str: any) {
    if (!str || str.indexOf('.') < 0) {
      return 'undef';
    }
    const split = str.split('.');
    return split[split.length - 1];
  }


  public validaCampo(value: any, setValid: any) {
    if (value === 0 || value === '0') {
      setValid(true);
      return true;
    }
    setValid(!!value);
    return !!value;
  }

  extractSearchParams(url: any) {
    return new Proxy(new URLSearchParams(url), {
      get: (searchParams: any, prop: any) => searchParams.get(prop),
    });
  }

  verificaPermissaoAcessoPagina(permissao: string) {
    this._authService.verificaPermissaoAcessoPagina(permissao);
  }

  temPermissao(permissao: string): any {
    return this._authService.temPermissao(permissao);
  }

  getUser() {
    return AuthService.getUser();
  }

  public exportCSV(e: any) {
    if (e.current.props.totalRecords > 0) {
      e.current.exportCSV(true);
    } else {
    }
  }

  toFormData(item: any) {
    const formData = new FormData();
    for (const key in item) {
      if (!(item[key] instanceof Function)) {
        formData.append(key, item[key]);
      }
    }
    return formData;
  }

  start() {
    this.blockUIService.start();
  }

  stop() {
    this.blockUIService.stop();
  }

  downloadFile(result: any, fileName: any, type: any) {
    const fileUrl = this.createUrl(result, fileName, type);
    const anchor = document.createElement('a');
    anchor.download = fileName;
    anchor.href = fileUrl;
    document.body.appendChild(anchor);
    anchor.click();
    document.body.removeChild(anchor);
  }


  openFile(result: any, fileName: any, type: any) {
    const fileUrl = this.createUrl(result, fileName, type);
    window.open(fileUrl, '_blank')
  }

  createUrl(result: any, fileName: any, type: any) {
    const converter = this.base64ToArrayBuffer(result);
    const blob = new Blob([converter], {type: type});
    return window.URL.createObjectURL(blob);
  }

  base64ToArrayBuffer(base64: any) {
    const binaryString = atob(base64);
    const binaryLen = binaryString.length;
    const bytes = new Uint8Array(binaryLen);
    for (let i = 0; i < binaryLen; i++) {
      const ascii = binaryString.charCodeAt(i);
      bytes[i] = ascii;
    }
    return bytes;
  };

  converteTamanho(size: number) {
    if (size / Math.pow(10, 6) < 1) {
      return parseFloat((size / Math.pow(10, 3)).toFixed(2)) + 'KB';
    }
    return parseFloat((size / Math.pow(10, 6)).toFixed(2)) + 'MB';
  }

  getCnpjAtivo() {
    if (!this.getUser().cnpjAtivo) {
      return '';
    }
    return this.getUser().cnpjAtivo;
  }
}
