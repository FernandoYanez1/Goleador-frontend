import React, { useState, ChangeEvent } from 'react';
import { InputText } from 'primereact/inputtext';
import AppButton from '../../../../../vendors/components/Button';
import { Toast } from 'primereact/toast';
import ToastService from '../../../../../vendors/services/toastService';
import { Card } from 'primereact/card';
import { Button } from 'primereact/button';
import { useHistory } from 'react-router-dom';

export default function Contato() {
    const [email, setEmail] = useState('');
    const [nome, setNome] = useState('');
    const [cpf, setCpf] = useState('');
    const [telefone, setTelefone] = useState('');
    const [senha, setSenha] = useState('');

    const history = useHistory();

    const handleVoltarHomeClick = () => {
        history.push('/');
    };

    const handleLoginClick = () => {
        history.push("/public/login");
    };

    return (
        <>
            {/*<Toast*/}
            {/*    baseZIndex={8000}*/}
            {/*    ref={(el) => ToastService.init(el)}*/}
            {/*    style={{ paddingTop: 40, width: 'auto', height: 'auto' }}*/}
            {/*/>*/}
            <div className="contato-container">
                <div className="background-image">
                    <img className="logo-contato" src="/media/goleador-logo.png" />
                </div>
                <div className="contato">
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
                            <InputWithFloatingLabel
                                label="Email"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                            />
                            <InputWithFloatingLabel
                                label="Nome completo"
                                value={nome}
                                onChange={(e) => setNome(e.target.value)}
                            />
                            <InputWithFloatingLabel
                                label="CPF"
                                value={cpf}
                                onChange={(e) => setCpf(e.target.value)}
                            />
                            <InputWithFloatingLabel
                                label="Telefone"
                                value={telefone}
                                onChange={(e) => setTelefone(e.target.value)}
                            />
                            <InputWithFloatingLabel
                                label="Senha"
                                value={senha}
                                onChange={(e) => setSenha(e.target.value)}
                            />
                            <div className="flex justify-content-center mt-5">
                                <AppButton label="Cadastrar" className="cadastrar-contato" />
                            </div>
                            <Button
                                onClick={handleVoltarHomeClick}
                                label="Voltar"
                                className="p-button-trasparente"
                            />
                        </div>
                        <div className="contato-login">
                            <div
                                className="cadastro-text"
                                style={{
                                    display: 'flex',
                                    flexDirection: 'column',
                                    alignItems: 'center',
                                    fontSize: '18px',
                                }}
                            >
                                <b>Já possui cadastro?</b>
                            </div>
                            <div className="flex justify-content-center">
                                <AppButton
                                    label="Login"
                                    onClick={handleLoginClick}
                                    className="mt-3 login-button"
                                />
                            </div>
                        </div>
                    </Card>
                </div>
            </div>
        </>
    );
}

interface InputWithFloatingLabelProps {
    label: string;
    value: string;
    onChange: (e: ChangeEvent<HTMLInputElement>) => void;
}

const InputWithFloatingLabel: React.FC<InputWithFloatingLabelProps> = ({ label, value, onChange }) => {
    const [focused, setFocused] = useState(false);

    return (
        <div className={`input-container ${focused || value ? 'focused' : ''}`}>
            <label>{label}</label>
            <InputText
                value={value}
                onChange={onChange}
                onFocus={() => setFocused(true)}
                onBlur={() => setFocused(false)}
                className="custom-input"
            />
        </div>
    );
};

