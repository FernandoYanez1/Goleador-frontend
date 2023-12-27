import React, { useState, ChangeEvent } from 'react';
import { InputText } from 'primereact/inputtext';
import AppButton from '../../../../../vendors/components/Button';
import { Toast } from 'primereact/toast';
import ToastService from '../../../../../vendors/services/toastService';
import { Card } from 'primereact/card';
import { Button } from 'primereact/button';
import { useHistory } from 'react-router-dom';

export default function Login() {

    const history = useHistory();

    const handleVoltarHomeClick = () => {
        history.push('/');
    };

    const handleCriarContaClick = () => {
        history.push("/public/contato");
    };

    return (
        <>

            <div className="login-container">
                <div className="background-image-login">
                    <img className="logo-contato" src="/media/goleador-logo.png" />
                </div>
                <div className="login">
                    <Card>
                        <div

                            style={{
                                display: 'flex',
                                flexDirection: 'column',
                                alignItems: 'center',
                                fontSize: '22px',
                                marginBottom: '30px',
                            }}
                        >
                            <b>Preencha todos os dados</b>
                        </div>
                        <div className="flex justify-content-center flex-column">
                            <InputText
                                placeholder="CPF ou Email"
                                className="input-login"
                                style={{ margin: '0 auto', marginBottom: '10px'}}
                            />
                            <InputText
                                placeholder="Senha"
                                className="input-login"
                                style={{ margin: '0 auto'}}
                            />
                            <div className="flex justify-content-center mt-5">
                                <AppButton label="Entrar" className="login-contato" />
                            </div>
                            <Button
                                onClick={handleVoltarHomeClick}
                                label="Voltar"
                                className="p-button-trasparente"
                            />
                        </div>
                        <div className="bolao-login">
                            <div
                                className="login-text"
                                style={{
                                    display: 'flex',
                                    flexDirection: 'column',
                                    alignItems: 'center',
                                    fontSize: '18px',
                                }}
                            >
                                <b>Não possui cadastro?</b>
                            </div>
                            <div className="flex justify-content-center">
                                <AppButton
                                    label="Cadastrar"
                                    className="mt-3 login-button"
                                    onClick={handleCriarContaClick}
                                />
                            </div>
                        </div>
                    </Card>
                </div>
            </div>
        </>
    );
}

