import React, { useState, useRef } from 'react';
import { InputText } from 'primereact/inputtext';
import { Toast } from 'primereact/toast';
import { Card } from 'primereact/card';
import { Dialog } from 'primereact/dialog';
import { useHistory } from 'react-router-dom';
import AppButton from '../../../../../vendors/components/Button';

export default function Login() {
    const apiUrl = process.env.REACT_APP_API_URL || 'http://localhost:3001';
    const [email, setEmail] = useState('');
    const [senha, setSenha] = useState('');
    const [loading, setLoading] = useState(false);
    
    // Estados do "Esqueci a Senha"
    const [modalRecuperar, setModalRecuperar] = useState(false);
    const [emailRecuperacao, setEmailRecuperacao] = useState('');
    const [loadingRecuperar, setLoadingRecuperar] = useState(false);
    
    const history = useHistory();
    const toast = useRef<Toast>(null);

    const handleVoltarHomeClick = () => history.push('/');
    const handleCriarContaClick = () => history.push("/public/contato");

    const handleEntrarClick = async (e: any) => {
        if (e && e.preventDefault) e.preventDefault();
        if (!email || !senha) {
            toast.current?.show({ severity: 'warn', summary: 'Atenção', detail: 'Preencha todos os campos!', life: 3000 });
            return;
        }
        setLoading(true);
        try {
            const resposta = await fetch(`${apiUrl}/login`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email: email, senha: senha })
            });
            const dados = await resposta.json();
            if (resposta.ok) {
                localStorage.setItem('usuarioLogado', JSON.stringify(dados.usuario));
                toast.current?.show({ severity: 'success', summary: 'Sucesso', detail: `Bem-vindo, ${dados.usuario.nome}!`, life: 2000 });
                setTimeout(() => { history.push('/public'); }, 1000);
            } else {
                toast.current?.show({ severity: 'error', summary: 'Erro', detail: dados.erro, life: 3000 });
                setLoading(false);
            }
        } catch (erro: any) {
            toast.current?.show({ severity: 'error', summary: 'Erro', detail: 'Falha na conexão.', life: 3000 });
            setLoading(false);
        }
    };

    const handleRecuperarSenha = async () => {
        if (!emailRecuperacao) {
            toast.current?.show({ severity: 'warn', summary: 'Atenção', detail: 'Digite seu e-mail.', life: 3000 });
            return;
        }
        setLoadingRecuperar(true);
        try {
            const resposta = await fetch(`${apiUrl}/esqueci-senha`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email: emailRecuperacao })
            });
            const dados = await resposta.json();
            if (resposta.ok) {
                toast.current?.show({ severity: 'success', summary: 'Sucesso', detail: dados.mensagem, life: 4000 });
                setModalRecuperar(false);
                setEmailRecuperacao('');
            } else {
                toast.current?.show({ severity: 'error', summary: 'Erro', detail: dados.erro, life: 3000 });
            }
        } catch (erro: any) {
            toast.current?.show({ severity: 'error', summary: 'Erro', detail: 'Falha na conexão.', life: 3000 });
        } finally {
            setLoadingRecuperar(false);
        }
    };

    return (
        <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#0f172a', padding: '20px' }}>
            <Toast position="top-center" ref={toast} />

            <Card style={{ width: '100%', maxWidth: '400px', borderRadius: '16px', backgroundColor: '#1e293b', border: '1px solid #334155', boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.5)', padding: '10px' }}>
                <div style={{ textAlign: 'center', marginBottom: '25px' }}>
                    <img src="/media/goleador-logo.png" alt="Logo" style={{ height: '80px', width: 'auto', marginBottom: '10px' }} />
                    <h2 style={{ margin: 0, color: '#ffffff', fontSize: '28px', fontWeight: 'bold' }}>Acesse sua conta</h2>
                </div>

                <form onSubmit={handleEntrarClick} style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                        <label style={{ color: '#94a3b8', fontSize: '14px', fontWeight: 'bold' }}>Email ou CPF</label>
                        <InputText value={email} onChange={(e) => setEmail(e.target.value)} placeholder="seu@email.com" style={{ width: '100%', backgroundColor: '#0f172a', border: '1px solid #475569', color: '#ffffff', borderRadius: '8px', padding: '14px' }} />
                    </div>

                    <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                            <label style={{ color: '#94a3b8', fontSize: '14px', fontWeight: 'bold' }}>Senha</label>
                            <span onClick={() => setModalRecuperar(true)} style={{ color: '#60a5fa', fontSize: '13px', cursor: 'pointer', fontWeight: 'bold' }}>Esqueceu a senha?</span>
                        </div>
                        <InputText type="password" value={senha} onChange={(e) => setSenha(e.target.value)} placeholder="••••••••" style={{ width: '100%', backgroundColor: '#0f172a', border: '1px solid #475569', color: '#ffffff', borderRadius: '8px', padding: '14px' }} />
                    </div>

                    <AppButton label={loading ? "Entrando..." : "Entrar"} onClick={handleEntrarClick} disabled={loading} style={{ width: '100%', padding: '14px', borderRadius: '8px', backgroundColor: '#10b981', border: 'none', fontSize: '18px', fontWeight: 'bold', marginTop: '10px', color: '#ffffff' }} />
                </form>

                <div style={{ display: 'flex', alignItems: 'center', margin: '30px 0' }}>
                    <div style={{ flex: 1, height: '1px', backgroundColor: '#334155' }}></div>
                    <span style={{ padding: '0 15px', color: '#64748b', fontSize: '12px', fontWeight: 'bold' }}>OU</span>
                    <div style={{ flex: 1, height: '1px', backgroundColor: '#334155' }}></div>
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '15px' }}>
                    <span onClick={handleCriarContaClick} style={{ color: '#60a5fa', fontSize: '16px', fontWeight: 'bold', cursor: 'pointer' }}>Não tenho conta</span>
                    <span onClick={handleVoltarHomeClick} style={{ color: '#94a3b8', fontSize: '14px', fontWeight: 'bold', cursor: 'pointer' }}>Voltar para o Início</span>
                </div>
            </Card>

            <Dialog header="Recuperar Senha" visible={modalRecuperar} style={{ width: '90vw', maxWidth: '400px' }} onHide={() => setModalRecuperar(false)}
                headerStyle={{ backgroundColor: '#1e293b', color: 'white', borderBottom: '1px solid #334155' }}
                contentStyle={{ backgroundColor: '#1e293b', padding: '20px' }}>
                <p style={{ color: '#cbd5e1', marginBottom: '20px' }}>Digite seu e-mail de cadastro. Enviaremos um link para você redefinir sua senha.</p>
                <InputText value={emailRecuperacao} onChange={(e) => setEmailRecuperacao(e.target.value)} placeholder="Seu e-mail" style={{ width: '100%', backgroundColor: '#0f172a', border: '1px solid #475569', color: '#ffffff', padding: '14px', marginBottom: '20px', borderRadius: '8px' }} />
                <AppButton label={loadingRecuperar ? "Enviando..." : "Enviar Link"} onClick={handleRecuperarSenha} disabled={loadingRecuperar} style={{ width: '100%', backgroundColor: '#3b82f6', border: 'none', padding: '12px', color: 'white', fontWeight: 'bold', borderRadius: '8px' }} />
            </Dialog>
        </div>
    );
}