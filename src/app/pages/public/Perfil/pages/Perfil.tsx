import React, { useEffect, useState } from 'react';
import { Card } from 'primereact/card';
import { Button } from 'primereact/button';
import { useHistory } from 'react-router-dom';

export default function Perfil() {
    const history = useHistory();
    const [usuario, setUsuario] = useState<any>(null);

    useEffect(() => {
        // Verifica na memória quem está logado
        const usuarioSalvo = localStorage.getItem('usuarioLogado');
        if (usuarioSalvo) {
            setUsuario(JSON.parse(usuarioSalvo));
        } else {
            // Se não tiver ninguém logado, expulsa pra tela de login
            history.push('/public/login');
        }
    }, [history]);

    const handleSairClick = () => {
    // 1. Limpa a memória do navegador
    localStorage.removeItem('usuarioLogado');
    
    // 2. Redireciona para a tela de login
    history.push('/public/login');
};

    const handleVoltarClick = () => {
        history.push('/public/palpites'); // Ajuste para a rota correta dos palpites
    };

    // Enquanto carrega os dados, não mostra nada pra não quebrar a tela
    if (!usuario) return null;

    return (
        <div style={{ display: 'flex', justifyContent: 'center', marginTop: '50px' }}>
            <Card title="Meu Perfil" style={{ width: '400px', textAlign: 'center', boxShadow: '0 4px 8px rgba(0,0,0,0.1)' }}>
                
                <i className="pi pi-user" style={{ fontSize: '3rem', color: '#ff6b00', marginBottom: '20px' }}></i>
                
                <h2 style={{ margin: '10px 0' }}>{usuario.nome}</h2>
                <p style={{ fontSize: '18px', color: '#666' }}>
                    <b>Pontuação Atual:</b> {usuario.pontuacao_total} pontos
                </p>

                <div style={{ marginTop: '40px', display: 'flex', flexDirection: 'column', gap: '10px' }}>
                    <Button 
                        label="Meus Palpites" 
                        icon="pi pi-th-large" 
                        onClick={handleVoltarClick} 
                        style={{ backgroundColor: '#ff6b00', borderColor: '#ff6b00' }}
                    />
                    <Button 
                        label="Sair da Conta" 
                        icon="pi pi-sign-out" 
                        severity="danger" 
                        outlined
                        onClick={handleSairClick} 
                    />
                </div>
            </Card>
        </div>
    );
}