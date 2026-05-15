import React, { useState, useRef } from 'react';
import { InputText } from 'primereact/inputtext';
import { Toast } from 'primereact/toast';
import { Card } from 'primereact/card';
import { useHistory } from 'react-router-dom';
import AppButton from '../../../../../vendors/components/Button';

export default function Contato() {
    const apiUrl = process.env.REACT_APP_API_URL || 'http://localhost:3001';
    const [email, setEmail] = useState('');
    const [nome, setNome] = useState('');
    const [cpf, setCpf] = useState('');
    const [telefone, setTelefone] = useState('');
    const [senha, setSenha] = useState('');
    
    const [mostrarSenha, setMostrarSenha] = useState(false);
    const [loading, setLoading] = useState(false);

    const history = useHistory();
    const toast = useRef<Toast>(null);

    // FUNÇÕES DE MÁSCARA
    const handleCpfChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        let value = e.target.value.replace(/\D/g, ''); // Tira letras
        if (value.length > 11) value = value.slice(0, 11);
        value = value.replace(/(\d{3})(\d)/, '$1.$2');
        value = value.replace(/(\d{3})(\d)/, '$1.$2');
        value = value.replace(/(\d{3})(\d{1,2})$/, '$1-$2');
        setCpf(value);
    };

    const handleTelefoneChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        let value = e.target.value.replace(/\D/g, '');
        if (value.length > 11) value = value.slice(0, 11);
        value = value.replace(/^(\d{2})(\d)/g, '($1) $2');
        value = value.replace(/(\d)(\d{4})$/, '$1-$2');
        setTelefone(value);
    };

    const handleCadastrarClick = async (e: any) => {
        if (e && e.preventDefault) e.preventDefault();

        if (!nome || !email || !senha || !cpf || !telefone) {
            toast.current?.show({ severity: 'warn', summary: 'Atenção', detail: 'Todos os campos são obrigatórios!', life: 3000 });
            return;
        }

        if (cpf.length < 14) {
            toast.current?.show({ severity: 'warn', summary: 'Atenção', detail: 'Digite um CPF válido!', life: 3000 });
            return;
        }

        setLoading(true);

        try {
            const resposta = await fetch(`${apiUrl}/cadastro`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ nome, email, cpf, telefone, senha })
            });

            const dados = await resposta.json();

            if (resposta.ok) {
                toast.current?.show({ severity: 'success', summary: 'Bem-vindo!', detail: 'Cadastro realizado com sucesso!', life: 2000 });
                setTimeout(() => { history.push('/public/login'); }, 1500);
            } else {
                toast.current?.show({ severity: 'error', summary: 'Erro no Cadastro', detail: dados.erro, life: 3000 });
                setLoading(false);
            }
        } catch (erro: any) {
            console.error(erro);
            toast.current?.show({ severity: 'error', summary: 'Erro', detail: 'Falha na comunicação com o servidor.', life: 3000 });
            setLoading(false);
        }
    };

    return (
        <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#0f172a', padding: '40px 20px' }}>
            <Toast position="top-center" ref={toast} />

            <Card style={{ width: '100%', maxWidth: '450px', borderRadius: '16px', backgroundColor: '#1e293b', border: '1px solid #334155', boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.5)', padding: '10px' }}>
                <div style={{ textAlign: 'center', marginBottom: '25px' }}>
                    <img src="/media/goleador-logo.png" alt="Logo" style={{ height: '70px', width: 'auto', marginBottom: '10px' }} />
                    <h2 style={{ margin: 0, color: '#ffffff', fontSize: '24px', fontWeight: 'bold' }}>Crie sua conta</h2>
                    <p style={{ margin: '5px 0 0 0', color: '#94a3b8', fontSize: '14px' }}>Preencha seus dados para participar do bolão</p>
                </div>

                <form onSubmit={handleCadastrarClick} style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
                    
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                        <label style={{ color: '#94a3b8', fontSize: '13px', fontWeight: 'bold' }}>Nome e Sobrenome *</label>
                        <InputText value={nome} onChange={(e) => setNome(e.target.value)} placeholder="Nome e Sobrenome" style={{ width: '100%', backgroundColor: '#0f172a', border: '1px solid #475569', color: '#ffffff', borderRadius: '8px', padding: '12px' }} />
                    </div>

                    <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                        <label style={{ color: '#94a3b8', fontSize: '13px', fontWeight: 'bold' }}>Email *</label>
                        <InputText value={email} onChange={(e) => setEmail(e.target.value)} placeholder="seu@email.com" style={{ width: '100%', backgroundColor: '#0f172a', border: '1px solid #475569', color: '#ffffff', borderRadius: '8px', padding: '12px' }} />
                    </div>

                    <div style={{ display: 'flex', gap: '15px' }}>
                        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '6px' }}>
                            <label style={{ color: '#94a3b8', fontSize: '13px', fontWeight: 'bold' }}>CPF *</label>
                            <InputText value={cpf} onChange={handleCpfChange} placeholder="000.000.000-00" style={{ width: '100%', backgroundColor: '#0f172a', border: '1px solid #475569', color: '#ffffff', borderRadius: '8px', padding: '12px' }} />
                        </div>

                        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '6px' }}>
                            <label style={{ color: '#94a3b8', fontSize: '13px', fontWeight: 'bold' }}>WhatsApp *</label>
                            <InputText value={telefone} onChange={handleTelefoneChange} placeholder="(00) 00000-0000" style={{ width: '100%', backgroundColor: '#0f172a', border: '1px solid #475569', color: '#ffffff', borderRadius: '8px', padding: '12px' }} />
                        </div>
                    </div>

                    <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                        <label style={{ color: '#94a3b8', fontSize: '13px', fontWeight: 'bold' }}>Senha *</label>
                        <div style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
                            <InputText type={mostrarSenha ? "text" : "password"} value={senha} onChange={(e) => setSenha(e.target.value)} placeholder="Crie uma senha segura" style={{ width: '100%', backgroundColor: '#0f172a', border: '1px solid #475569', color: '#ffffff', borderRadius: '8px', padding: '12px', paddingRight: '45px' }} />
                            <i className={mostrarSenha ? "pi pi-eye-slash" : "pi pi-eye"} onClick={() => setMostrarSenha(!mostrarSenha)} style={{ position: 'absolute', right: '15px', color: '#64748b', cursor: 'pointer', fontSize: '18px' }} title={mostrarSenha ? "Ocultar Senha" : "Mostrar Senha"} />
                        </div>
                    </div>

                    <AppButton label={loading ? "Cadastrando..." : "Finalizar Cadastro"} onClick={handleCadastrarClick} disabled={loading} style={{ width: '100%', padding: '14px', borderRadius: '8px', backgroundColor: '#10b981', border: 'none', fontSize: '18px', fontWeight: 'bold', marginTop: '15px', color: '#ffffff' }} />
                </form>

                <div style={{ display: 'flex', alignItems: 'center', margin: '25px 0' }}>
                    <div style={{ flex: 1, height: '1px', backgroundColor: '#334155' }}></div>
                    <span style={{ padding: '0 15px', color: '#64748b', fontSize: '12px', fontWeight: 'bold' }}>OU</span>
                    <div style={{ flex: 1, height: '1px', backgroundColor: '#334155' }}></div>
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '15px' }}>
                    <span onClick={() => history.push("/public/login")} style={{ color: '#60a5fa', fontSize: '16px', fontWeight: 'bold', cursor: 'pointer', textDecoration: 'none' }}>Já possuo conta (Fazer Login)</span>
                    <span onClick={() => history.push('/')} style={{ color: '#94a3b8', fontSize: '14px', fontWeight: 'bold', cursor: 'pointer', textDecoration: 'none' }}>Voltar para o Início</span>
                </div>
            </Card>
        </div>
    );
}