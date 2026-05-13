import React, { useState, useRef } from 'react';
import { InputText } from 'primereact/inputtext';
import { Toast } from 'primereact/toast';
import { Card } from 'primereact/card';
import { useHistory } from 'react-router-dom';
import AppButton from '../../../../../vendors/components/Button';

export default function Login() {
    const apiUrl = process.env.REACT_APP_API_URL || 'http://localhost:3001';
    const [email, setEmail] = useState('');
    const [senha, setSenha] = useState('');
    const [loading, setLoading] = useState(false);
    
    const history = useHistory();
    const toast = useRef<Toast>(null);

    const handleVoltarHomeClick = () => {
        history.push('/');
    };

    const handleCriarContaClick = () => {
        history.push("/public/contato");
    };

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

    return (
        <div style={{ 
            minHeight: '100vh', 
            display: 'flex', 
            alignItems: 'center', 
            justifyContent: 'center', 
            background: '#0f172a', 
            padding: '20px' 
        }}>
            <Toast position="top-center" ref={toast} />

            <Card style={{ 
                width: '100%', 
                maxWidth: '400px', 
                borderRadius: '16px', 
                backgroundColor: '#1e293b', 
                border: '1px solid #334155', 
                boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.5)',
                padding: '10px'
            }}>
                
                <div style={{ textAlign: 'center', marginBottom: '25px' }}>
                    <img 
                        src="/media/goleador-logo.png" 
                        alt="Logo" 
                        style={{ height: '80px', width: 'auto', marginBottom: '10px' }} 
                    />
                    <h2 style={{ margin: 0, color: '#ffffff', fontSize: '28px', fontWeight: 'bold' }}>Acesse sua conta</h2>
                </div>

                <form onSubmit={handleEntrarClick} style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                    
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                        <label style={{ color: '#94a3b8', fontSize: '14px', fontWeight: 'bold' }}>Email ou CPF</label>
                        <InputText 
                            value={email} 
                            onChange={(e) => setEmail(e.target.value)} 
                            placeholder="seu@email.com"
                            style={{ 
                                width: '100%', 
                                backgroundColor: '#0f172a', 
                                border: '1px solid #475569', 
                                color: '#ffffff',
                                borderRadius: '8px',
                                padding: '14px'
                            }} 
                        />
                    </div>

                    <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                        <label style={{ color: '#94a3b8', fontSize: '14px', fontWeight: 'bold' }}>Senha</label>
                        <InputText 
                            type="password" 
                            value={senha} 
                            onChange={(e) => setSenha(e.target.value)} 
                            placeholder="••••••••"
                            style={{ 
                                width: '100%', 
                                backgroundColor: '#0f172a', 
                                border: '1px solid #475569', 
                                color: '#ffffff',
                                borderRadius: '8px',
                                padding: '14px'
                            }} 
                        />
                    </div>

                    <AppButton 
                        label={loading ? "Entrando..." : "Entrar"} 
                        onClick={handleEntrarClick} 
                        disabled={loading}
                        style={{ 
                            width: '100%', 
                            padding: '14px', 
                            borderRadius: '8px', 
                            backgroundColor: '#10b981', 
                            border: 'none', 
                            fontSize: '18px', 
                            fontWeight: 'bold',
                            marginTop: '10px',
                            color: '#ffffff'
                        }} 
                    />
                </form>

                <div style={{ display: 'flex', alignItems: 'center', margin: '30px 0' }}>
                    <div style={{ flex: 1, height: '1px', backgroundColor: '#334155' }}></div>
                    <span style={{ padding: '0 15px', color: '#64748b', fontSize: '12px', fontWeight: 'bold' }}>OU</span>
                    <div style={{ flex: 1, height: '1px', backgroundColor: '#334155' }}></div>
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '15px' }}>
                    <span 
                        onClick={handleCriarContaClick} 
                        style={{ 
                            color: '#60a5fa', 
                            fontSize: '16px', 
                            fontWeight: 'bold', 
                            cursor: 'pointer',
                            textDecoration: 'none'
                        }}
                        onMouseOver={(e) => e.currentTarget.style.textDecoration = 'underline'}
                        onMouseOut={(e) => e.currentTarget.style.textDecoration = 'none'}
                    >
                        Não tenho conta
                    </span>

                    <span 
                        onClick={handleVoltarHomeClick} 
                        style={{ 
                            color: '#94a3b8', 
                            fontSize: '14px', 
                            fontWeight: 'bold', 
                            cursor: 'pointer',
                            textDecoration: 'none'
                        }}
                        onMouseOver={(e) => e.currentTarget.style.textDecoration = 'underline'}
                        onMouseOut={(e) => e.currentTarget.style.textDecoration = 'none'}
                    >
                        Voltar para o Início
                    </span>
                </div>
            </Card>
        </div>
    );
}