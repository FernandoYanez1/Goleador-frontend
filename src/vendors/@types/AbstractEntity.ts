import {useState} from 'react';

export default class AbstractEntity {

  public noUsuarioCriacao: any;
  public setNoUsuarioCriacao: any;
  public noUsuarioAtualizacao: any;
  public setNoUsuarioAtualizacao: any;
  public dtCriacao: any;
  public setDtCriacao: any;
  public dtAtualizacao: any;
  public setDtAtualizacao: any;
  public stAtivo: any;
  public setStAtivo: any;

  constructor() {
    [this.noUsuarioCriacao, this.setNoUsuarioCriacao] = useState('');
    [this.noUsuarioAtualizacao, this.setNoUsuarioAtualizacao] = useState('');
    [this.dtCriacao, this.setDtCriacao] = useState('');
    [this.dtAtualizacao, this.setDtAtualizacao] = useState('');
    [this.stAtivo, this.setStAtivo] = useState('');
  }

  sync(entity: any) {
    this.setNoUsuarioCriacao(entity.noUsuarioCriacao);
    this.setNoUsuarioAtualizacao(entity.noUsuarioAtualizacao);
    this.setDtCriacao(entity.dtCriacao);
    this.setDtAtualizacao(entity.dtAtualizacao);
    this.setStAtivo(entity.stAtivo);
  }

  limpar() {
  }


  public obterExtensao(str: any) {
    if (!str || str.indexOf('.') < 0) {
      return 'undef';
    }
    const split = str.split('.');
    return split[split.length - 1];
  }

}
