import {ReduxInterface} from './reduxInterface';
import {shallowEqual, useDispatch, useSelector} from 'react-redux';
import {AppStore} from '../redux/reducer';
import AuthActionTypes from '../redux/auth/authActionTypes';
import {User} from '../redux/@types/auth';
import {useHistory} from 'react-router-dom';

export default class AuthService implements ReduxInterface {


  public dispatch: any;

  private history = useHistory();

  public static getUser() {
    const userStr = sessionStorage.getItem('user');
    if (!userStr || userStr === '' || userStr === 'undefined') {
      return undefined;
    }
    return JSON.parse(userStr);
  }

  constructor() {
    this.dispatch = useDispatch();
  }


  public save(user: User) {
    if (!user) {
      return;
    }
    sessionStorage.setItem('user', JSON.stringify(user));
    const temp = {...user};
    temp.perfisUnificados = this.getPerfisUnificados(user.permissoes);
    this.dispatch({type: AuthActionTypes.SAVE, user: temp});
  }

  ativarCnpj(cnpj: any) {
    this.save({...AuthService.getUser(), cnpjAtivo: cnpj});
    this.history.go(0);
  }

  public remove() {
    sessionStorage.setItem('user', '');
    this.dispatch({type: AuthActionTypes.REMOVE});
  }


  public verificaPermissaoAcessoPagina(permissao: any) {
    if (this.temPermissao(permissao)) {
      return;
    }
    this.history.push('/');
  }

  public isAuthenticated() {
    const user = AuthService.getUser();
    return !!user && user !== undefined;
  }


  public getCurrentState() {
    return useSelector((state: AppStore) => state.auth, shallowEqual);
  }

  public temPermissao(permissao: any) {
    if (!permissao) {
      return false;
    }
    const user = AuthService.getUser();
    if (!user || !user.permissoes || user.permissoes.length === 0) {
      return false;
    }
    return (
      user.permissoes.filter((f: any) => {
        if (!f) {
          return false;
        }
        const split = f.split(':');
        if (split.length < 2) {
          return false;
        }
        return split[1] === permissao;
      }).length > 0
    );
  }

  private getPerfisUnificados(permissoes: any) {
    if (!permissoes || permissoes.length === 0) {
      return [];
    }
    let lista = permissoes.map((m: any) => {
      if (!m) {
        return '';
      }
      const split = m.split(':');
      if (split.length < 2) {
        return '';
      }
      return split[0];
    });
    lista = lista.filter((f: any) => f !== '');
    // @ts-ignore
    return [...new Set(lista).values()];
  }


}
