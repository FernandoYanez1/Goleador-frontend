import React, { useState, useEffect } from 'react';
import { useHistory } from 'react-router-dom';
import AppButton from '../../../../../vendors/components/Button';
import { Box, Typography, Paper, Grid, Button, Divider } from '@mui/material';
import { EmojiEvents, ConfirmationNumber, TrackChanges, Logout } from '@mui/icons-material';

export default function Perfil() {
    const history = useHistory();
    const apiUrl = process.env.REACT_APP_API_URL || 'http://localhost:3001';
    
    const [usuario, setUsuario] = useState<any>(null);
    const [estatisticas, setEstatisticas] = useState({ bilhetes: 0, cravadas: 0, podios: 0 });

    useEffect(() => {
        const salvo = localStorage.getItem('usuarioLogado');
        if (!salvo) {
            history.push('/public/login');
            return;
        }
        const user = JSON.parse(salvo);
        setUsuario(user);

        const carregarEstatisticas = async () => {
            try {
                // 1. Busca Bilhetes e Cravadas
                const resEst = await fetch(`${apiUrl}/estatisticas/${user.id}`);
                let bilhetes = 0;
                let cravadas = 0;
                
                if (resEst.ok) {
                    const data = await resEst.json();
                    bilhetes = data.total_bilhetes || 0;
                    cravadas = data.placares_exatos || 0;
                }

                // 2. Busca Hall da Fama para contar os pódios
                const resHall = await fetch(`${apiUrl}/hall-da-fama`);
                let podiosConta = 0;

                if (resHall.ok) {
                    const hallData = await resHall.json();
                    const rodadasAgrupadas: any = {};
                    
                    hallData.forEach((item: any) => {
                        if (!rodadasAgrupadas[item.rodada_id]) rodadasAgrupadas[item.rodada_id] = [];
                        rodadasAgrupadas[item.rodada_id].push(item);
                    });

                    Object.keys(rodadasAgrupadas).forEach(rodadaId => {
                        const ranking = rodadasAgrupadas[rodadaId];
                        
                        const pontuacoes = ranking
                            .map((r: any) => Number(r.pontuacao_total))
                            .filter((valor: number, indice: number, array: number[]) => array.indexOf(valor) === indice)
                            .sort((a: number, b: number) => b - a);
                            
                        const top3 = pontuacoes.slice(0, 3);
                        
                        // Garante que os tipos sejam iguais (Number)
                        const meusBilhetesAqui = ranking.filter((r: any) => Number(r.usuario_id) === Number(user.id));
                        meusBilhetesAqui.forEach((meu: any) => {
                            // TRAVA: Só conta pódio se a pessoa tiver mais que 0 pontos (evita contar empate geral no início da rodada)
                            if (top3.includes(Number(meu.pontuacao_total)) && Number(meu.pontuacao_total) > 0) {
                                podiosConta++;
                            }
                        });
                    });
                }

                setEstatisticas({
                    bilhetes,
                    cravadas,
                    podios: podiosConta
                });

            } catch (error) {
                console.error("Erro ao carregar estatísticas:", error);
            }
        };

        carregarEstatisticas();
    }, [history, apiUrl]);

    const handleLogout = () => {
        if(window.confirm("Deseja mesmo sair da sua conta?")) {
            localStorage.removeItem('usuarioLogado');
            history.push('/public/login');
        }
    };

    if (!usuario) return null;

    return (
        <div style={{ backgroundColor: "#e2e8f0", minHeight: "100vh", padding: "40px 20px" }}>
            <Box maxWidth="600px" margin="0 auto">
                
                {/* CABEÇALHO DO PERFIL CORRIGIDO AS CORES */}
                <Paper style={{ padding: "30px", borderRadius: "16px", textAlign: "center", backgroundColor: "#1e293b", marginBottom: "30px", boxShadow: "0 10px 25px -5px rgba(0,0,0,0.2)" }}>
                    <div style={{ width: "80px", height: "80px", backgroundColor: "#3b82f6", borderRadius: "50%", margin: "0 auto 15px auto", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "32px", fontWeight: "bold", color: "white" }}>
                        {usuario.nome.charAt(0).toUpperCase()}
                    </div>
                    {/* Forçamos a cor branca no nome e cinza claro no email */}
                    <Typography variant="h5" fontWeight="bold" style={{ color: "#ffffff" }}>{usuario.nome}</Typography>
                    <Typography variant="body2" mt={1} style={{ color: "#94a3b8" }}>{usuario.email}</Typography>
                </Paper>

                {/* ESTATÍSTICAS */}
                <Typography variant="h6" fontWeight="900" color="#1e293b" mb={2} style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    📊 Suas Estatísticas
                </Typography>
                
                <Grid container spacing={2} mb={4}>
                    <Grid item xs={12} sm={4}>
                        <Paper style={{ padding: "20px", textAlign: "center", borderRadius: "12px", borderTop: "4px solid #3b82f6", boxShadow: "0 4px 6px rgba(0,0,0,0.05)" }}>
                            <ConfirmationNumber style={{ color: "#3b82f6", fontSize: "36px", marginBottom: "10px" }} />
                            <Typography variant="h3" fontWeight="900" color="#1e293b">{estatisticas.bilhetes}</Typography>
                            <Typography variant="caption" color="#64748b" fontWeight="bold">BILHETES APROVADOS</Typography>
                        </Paper>
                    </Grid>
                    <Grid item xs={12} sm={4}>
                        <Paper style={{ padding: "20px", textAlign: "center", borderRadius: "12px", borderTop: "4px solid #10b981", boxShadow: "0 4px 6px rgba(0,0,0,0.05)" }}>
                            <TrackChanges style={{ color: "#10b981", fontSize: "36px", marginBottom: "10px" }} />
                            <Typography variant="h3" fontWeight="900" color="#1e293b">{estatisticas.cravadas}</Typography>
                            <Typography variant="caption" color="#64748b" fontWeight="bold">PLACARES EXATOS</Typography>
                        </Paper>
                    </Grid>
                    <Grid item xs={12} sm={4}>
                        <Paper style={{ padding: "20px", textAlign: "center", borderRadius: "12px", borderTop: "4px solid #f59e0b", boxShadow: "0 4px 6px rgba(0,0,0,0.05)" }}>
                            <EmojiEvents style={{ color: "#f59e0b", fontSize: "36px", marginBottom: "10px" }} />
                            <Typography variant="h3" fontWeight="900" color="#1e293b">{estatisticas.podios}</Typography>
                            <Typography variant="caption" color="#64748b" fontWeight="bold">PÓDIOS (TOP 3)</Typography>
                        </Paper>
                    </Grid>
                </Grid>

                {/* BOTÕES DE AÇÃO */}
                <Box display="flex" flexDirection="column" gap={2}>
                    <AppButton label="Histórico de Pódios" onClick={() => history.push('/public/hall-da-fama')} style={{ backgroundColor: "#1e293b", border: "1px solid #334155", padding: "14px", fontSize: "16px", fontWeight: "bold", color: "white" }} />
                    <AppButton label="Ver Meus Bilhetes" onClick={() => history.push('/public/palpites')} style={{ backgroundColor: "#f97316", border: "none", padding: "14px", fontSize: "16px", fontWeight: "bold" }} />
                    <AppButton label="Voltar à Home" onClick={() => history.push('/public')} style={{ backgroundColor: "#64748b", border: "none", padding: "14px", fontSize: "16px", fontWeight: "bold" }} />
                    
                    <Divider style={{ margin: "10px 0" }} />
                    
                    <Button 
                        variant="outlined" 
                        color="error" 
                        onClick={handleLogout} 
                        style={{ border: "2px solid #ef4444", color: "#ef4444", padding: "10px", borderRadius: "8px", fontWeight: "bold", textTransform: "none", fontSize: "16px", display: "flex", gap: "10px" }}
                    >
                        <Logout /> Sair da Conta
                    </Button>
                </Box>
            </Box>
        </div>
    );
}