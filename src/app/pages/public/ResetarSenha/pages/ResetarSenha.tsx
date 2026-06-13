import React, { useState, useRef, useEffect } from 'react';
import { InputText } from 'primereact/inputtext';
import { Toast } from 'primereact/toast';
import { Card } from 'primereact/card';
import { useHistory, useLocation } from 'react-router-dom';
import AppButton from '../../../../../vendors/components/Button';

export default function ResetarSenha() {
    const apiUrl = process.env.REACT_APP_API_URL || 'http://localhost:3001';
    
    const [novaSenha, setNovaSenha] = useState('');
    const [confirmarSenha, setConfirmarSenha] = useState('');
    const [loading, setLoading] = useState(false);
    const [token, setToken] = useState<string | null>(null);
    
    const history = useHistory();
    const location = useLocation();
    const toast = useRef<Toast>(null);

    // Captura o token da URL assim que a página carrega
    useEffect(() => {
        const queryParams = new URLSearchParams(location.search);
        const tokenUrl = queryParams.get('token');
        if (tokenUrl) {
            setToken(tokenUrl);
        } else {
            toast.current?.show({ severity: 'error', summary: 'Erro', detail: 'Link de recuperação inválido ou ausente.', life: 5000 });
        }
    }, [location]);

    const handleSalvarNovaSenha = async (e: any) => {
        if (e && e.preventDefault) e.preventDefault();

        if (!token) {
            toast.current?.show({ severity: 'error', summary: 'Erro', detail: 'Token não encontrado. Solicite um novo link.', life: 3000 });
            return;
        }

        if (!novaSenha || !confirmarSenha) {
            toast.current?.show({ severity: 'warn', summary: 'Atenção', detail: 'Preencha todos os campos!', life: 3000 });
            return;
        }

        if (novaSenha !== confirmarSenha) {
            toast.current?.show({ severity: 'warn', summary: 'Atenção', detail: 'As senhas não coincidem!', life: 3000 });
            return;
        }

        setLoading(true);

        try {
            const resposta = await fetch(`${apiUrl}/redefinir-senha-token`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ token, novaSenha })
            });

            const dados = await resposta.json();

            if (resposta.ok) {
                toast.current?.show({ severity: 'success', summary: 'Sucesso', detail: 'Senha alterada com sucesso! Redirecionando...', life: 3000 });
                setTimeout(() => { history.push('/public/login'); }, 2000);
            } else {
                toast.current?.show({ severity: 'error', summary: 'Erro', detail: dados.erro, life: 3000 });
                setLoading(false);
            }
        } catch (erro: any) {
            toast.current?.show({ severity: 'error', summary: 'Erro', detail: 'Falha na conexão com o servidor.', life: 3000 });
            setLoading(false);
        }
    };

    return (
        <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#0f172a', padding: '20px' }}>
            <Toast position="top-center" ref={toast} />

            <Card style={{ width: '100%', maxWidth: '400px', borderRadius: '16px', backgroundColor: '#1e293b', border: '1px solid #334155', boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.5)', padding: '10px' }}>
                
                <div style={{ textAlign: 'center', marginBottom: '25px' }}>
                    <img src="/media/goleador-logo.png" alt="Logo" style={{ height: '80px', width: 'auto', marginBottom: '10px' }} />
                    <h2 style={{ margin: 0, color: '#ffffff', fontSize: '24px', fontWeight: 'bold' }}>Criar Nova Senha</h2>
                    <p style={{ color: '#cbd5e1', fontSize: '14px', marginTop: '10px' }}>Digite e confirme sua nova senha abaixo.</p>
                </div>

                <form onSubmit={handleSalvarNovaSenha} style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                    
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                        <label style={{ color: '#94a3b8', fontSize: '14px', fontWeight: 'bold' }}>Nova Senha</label>
                        <InputText 
                            type="password" 
                            value={novaSenha} 
                            onChange={(e) => setNovaSenha(e.target.value)} 
                            placeholder="••••••••"
                            style={{ width: '100%', backgroundColor: '#0f172a', border: '1px solid #475569', color: '#ffffff', borderRadius: '8px', padding: '14px' }} 
                        />
                    </div>

                    <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                        <label style={{ color: '#94a3b8', fontSize: '14px', fontWeight: 'bold' }}>Confirmar Nova Senha</label>
                        <InputText 
                            type="password" 
                            value={confirmarSenha} 
                            onChange={(e) => setConfirmarSenha(e.target.value)} 
                            placeholder="••••••••"
                            style={{ width: '100%', backgroundColor: '#0f172a', border: '1px solid #475569', color: '#ffffff', borderRadius: '8px', padding: '14px' }} 
                        />
                    </div>

                    <AppButton 
                        label={loading ? "Salvando..." : "Redefinir Senha"} 
                        onClick={handleSalvarNovaSenha} 
                        disabled={loading || !token}
                        style={{ width: '100%', padding: '14px', borderRadius: '8px', backgroundColor: '#10b981', border: 'none', fontSize: '18px', fontWeight: 'bold', marginTop: '10px', color: '#ffffff' }} 
                    />
                </form>

                <div style={{ textAlign: 'center', marginTop: '25px' }}>
                    <span 
                        onClick={() => history.push('/public/login')} 
                        style={{ color: '#94a3b8', fontSize: '14px', fontWeight: 'bold', cursor: 'pointer' }}
                    >
                        Voltar para o Login
                    </span>
                </div>
            </Card>
        </div>
    );
}