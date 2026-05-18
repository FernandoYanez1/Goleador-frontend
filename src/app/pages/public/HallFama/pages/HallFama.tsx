import React, { useState, useEffect } from 'react';
import { Container, Typography, Paper, Box, Avatar, CircularProgress } from '@mui/material';
import { EmojiEvents } from '@mui/icons-material';
import { useHistory } from 'react-router-dom';
import AppButton from '../../../../../vendors/components/Button';

export default function HallFama() {
    const history = useHistory();
    const apiUrl = process.env.REACT_APP_API_URL || 'http://localhost:3001';
    const [rodadasFinalizadas, setRodadasFinalizadas] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetch(`${apiUrl}/hall-da-fama`)
            .then(res => res.json())
            .then(data => {
                // Agrupar por Rodada
                const agrupado: any = {};
                data.forEach((item: any) => {
                    if (!agrupado[item.rodada_id]) {
                        agrupado[item.rodada_id] = {
                            nome: item.rodada_nome,
                            participantes: []
                        };
                    }
                    agrupado[item.rodada_id].participantes.push(item);
                });

                // Transformar em array, pegar as últimas 40 e processar o Top 3
                const lista = Object.values(agrupado).reverse().slice(0, 40).map((rodada: any) => {
                    
                    // LÓGICA BLINDADA CONTRA ERRO DE TYPESCRIPT
                    const pontuacoesUnicas = rodada.participantes
                        .map((p: any) => Number(p.pontuacao_total))
                        .filter((valor: number, indice: number, array: number[]) => array.indexOf(valor) === indice)
                        .sort((a: number, b: number) => b - a);
                    
                    return {
                        ...rodada,
                        top1: rodada.participantes.filter((p: any) => Number(p.pontuacao_total) === pontuacoesUnicas[0]),
                        top2: rodada.participantes.filter((p: any) => Number(p.pontuacao_total) === pontuacoesUnicas[1]),
                        top3: rodada.participantes.filter((p: any) => Number(p.pontuacao_total) === pontuacoesUnicas[2])
                    };
                });

                setRodadasFinalizadas(lista);
                setLoading(false);
            })
            .catch(() => setLoading(false));
    }, [apiUrl]);

    if (loading) {
        return (
            <Box display="flex" justifyContent="center" alignItems="center" minHeight="100vh">
                <CircularProgress />
            </Box>
        );
    }

    return (
        <div style={{ backgroundColor: "#0f172a", minHeight: "100vh", padding: "40px 20px", color: "white" }}>
            <Container maxWidth="md">
                <Box textAlign="center" mb={6}>
                    <Typography variant="h3" fontWeight="900" style={{ color: "#fcd34d", textShadow: "0 0 20px rgba(252, 211, 77, 0.3)" }}>
                        HALL DA FAMA 🏆
                    </Typography>
                    <Typography variant="h6" color="#94a3b8">Galeria de Grandes Campeões do Goleador VIP</Typography>
                </Box>

                {rodadasFinalizadas.map((rodada, idx) => (
                    <Paper key={idx} style={{ backgroundColor: "#1e293b", borderRadius: "16px", padding: "25px", marginBottom: "30px", border: "1px solid #334155" }}>
                        <Typography variant="h5" fontWeight="bold" color="#fcd34d" mb={3} textAlign="center">
                            {rodada.nome}
                        </Typography>

                        <Box display="flex" justifyContent="space-around" alignItems="flex-end" flexWrap="wrap" gap={2}>
                            {/* PRATA */}
                            {rodada.top2.length > 0 && (
                                <Box textAlign="center" order={{ xs: 2, sm: 1 }}>
                                    <Avatar style={{ backgroundColor: "#94a3b8", width: 50, height: 50, margin: "0 auto 10px auto" }}>2º</Avatar>
                                    {rodada.top2.map((p: any) => (
                                        <Typography key={p.cartela_id} variant="body2" fontWeight="bold">{p.usuario_nome}</Typography>
                                    ))}
                                    <Typography variant="caption" color="#94a3b8">{rodada.top2[0].pontuacao_total} pts</Typography>
                                </Box>
                            )}

                            {/* OURO */}
                            {rodada.top1.length > 0 && (
                                <Box textAlign="center" order={{ xs: 1, sm: 2 }} mb={2}>
                                    <EmojiEvents style={{ color: "#fbbf24", fontSize: "60px" }} />
                                    <Avatar style={{ backgroundColor: "#fbbf24", width: 70, height: 70, margin: "0 auto 10px auto", border: "4px solid #fcd34d" }}>1º</Avatar>
                                    {rodada.top1.map((p: any) => (
                                        <Typography key={p.cartela_id} variant="h6" fontWeight="900" color="#fbbf24">{p.usuario_nome}</Typography>
                                    ))}
                                    <Typography variant="body1" fontWeight="bold">{rodada.top1[0].pontuacao_total} pts</Typography>
                                </Box>
                            )}

                            {/* BRONZE */}
                            {rodada.top3.length > 0 && (
                                <Box textAlign="center" order={{ xs: 3, sm: 3 }}>
                                    <Avatar style={{ backgroundColor: "#cd7f32", width: 45, height: 45, margin: "0 auto 10px auto" }}>3º</Avatar>
                                    {rodada.top3.map((p: any) => (
                                        <Typography key={p.cartela_id} variant="body2" fontWeight="bold">{p.usuario_nome}</Typography>
                                    ))}
                                    <Typography variant="caption" color="#94a3b8">{rodada.top3[0].pontuacao_total} pts</Typography>
                                </Box>
                            )}
                        </Box>
                    </Paper>
                ))}

                <Box mt={4} textAlign="center">
                    <AppButton label="Voltar ao Início" onClick={() => history.push('/public')} style={{ backgroundColor: "#334155", border: "none" }} />
                </Box>
            </Container>
        </div>
    );
}