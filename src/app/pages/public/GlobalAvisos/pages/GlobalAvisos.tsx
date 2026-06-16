import React, { useState, useEffect } from 'react';
import { Dialog, DialogTitle, DialogContent, DialogActions, Button, Typography } from '@mui/material';
import { Campaign } from '@mui/icons-material';

export default function GlobalAvisos() {
    const apiUrl = process.env.REACT_APP_API_URL || 'http://localhost:3001';
    const [avisos, setAvisos] = useState<any[]>([]);
    const [avisoAtual, setAvisoAtual] = useState<any>(null);
    const [usuarioLogado, setUsuarioLogado] = useState<any>(null);

    useEffect(() => {
        const salvo = localStorage.getItem('usuarioLogado');
        if (salvo) {
            const user = JSON.parse(salvo);
            setUsuarioLogado(user);
            buscarAvisos(user.id);
        }
    }, []);

    const buscarAvisos = async (userId: number) => {
        try {
            const res = await fetch(`${apiUrl}/notificacoes/nao-lidas/${userId}`);
            const data = await res.json();
            if (data.length > 0) {
                setAvisos(data);
                setAvisoAtual(data[0]); // Mostra o primeiro aviso da fila
            }
        } catch (err) {
            console.error("Erro ao buscar avisos:", err);
        }
    };

    const handleMarcarComoLido = async () => {
        if (!avisoAtual || !usuarioLogado) return;

        try {
            // Marca como lido no banco
            await fetch(`${apiUrl}/notificacoes/marcar-lida`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ usuario_id: usuarioLogado.id, notificacao_id: avisoAtual.id })
            });

            // Tira o aviso atual da lista
            const novaLista = avisos.filter(a => a.id !== avisoAtual.id);
            setAvisos(novaLista);

            // Se tiver mais avisos, mostra o próximo, senão fecha tudo
            if (novaLista.length > 0) {
                setAvisoAtual(novaLista[0]);
            } else {
                setAvisoAtual(null);
            }
        } catch (err) {
            console.error("Erro ao fechar aviso:", err);
        }
    };

    if (!avisoAtual) return null; // Se não tem aviso, o componente fica invisível

    return (
        <Dialog open={!!avisoAtual} fullWidth maxWidth="xs" PaperProps={{ style: { borderRadius: '16px' } }}>
            <DialogTitle style={{ backgroundColor: '#3b82f6', color: 'white', display: 'flex', alignItems: 'center', gap: '10px', fontWeight: 'bold' }}>
                <Campaign fontSize="large" /> Aviso
            </DialogTitle>
            <DialogContent style={{ padding: '25px 20px', textAlign: 'center' }}>
                <Typography variant="h6" fontWeight="bold" color="#1e293b" gutterBottom>
                    {avisoAtual.titulo}
                </Typography>
                <Typography variant="body1" color="#475569" style={{ whiteSpace: 'pre-wrap' }}>
                    {avisoAtual.mensagem}
                </Typography>
            </DialogContent>
            <DialogActions style={{ justifyContent: 'center', padding: '15px' }}>
                <Button 
                    onClick={handleMarcarComoLido} 
                    variant="contained" 
                    style={{ backgroundColor: '#10b981', color: 'white', fontWeight: 'bold', padding: '10px 30px', borderRadius: '30px' }}
                >
                    Entendi, fechar!
                </Button>
            </DialogActions>
        </Dialog>
    );
}