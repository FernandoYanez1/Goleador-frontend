import React, { useState, useEffect } from 'react';
import { useHistory } from 'react-router-dom';
import { Container, Typography, Paper, Box, CircularProgress, MenuItem, TextField, Table, TableBody, TableCell, TableContainer, TableHead, TableRow } from '@mui/material';
import { EmojiEvents } from '@mui/icons-material';
import AppButton from '../../../../../vendors/components/Button';

export default function Ranking() {
    const history = useHistory();
    const apiUrl = process.env.REACT_APP_API_URL || 'http://localhost:3001';

    const [rodadas, setRodadas] = useState<any[]>([]);
    const [rodadaSelecionada, setRodadaSelecionada] = useState<number | ''>('');
    const [rankingData, setRankingData] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        // Puxa as rodadas e o ranking global
        Promise.all([
            fetch(`${apiUrl}/rodadas`).then(res => res.json()),
            fetch(`${apiUrl}/ranking`).then(res => res.json())
        ])
        .then(([rodadasData, rankingResponse]) => {
            setRodadas(rodadasData);
            
            // BLINDAGEM DO TYPESCRIPT AQUI: Aceita número ou texto vazio
            let rodadaPadrao: number | '' = '';
            
            if (rodadasData.length > 0) {
                const fixada = rodadasData.find((r: any) => r.exibir_no_ranking === true);
                if (fixada) {
                    rodadaPadrao = fixada.id;
                } else {
                    const abertas = rodadasData.filter((r: any) => r.status === 'aberta');
                    rodadaPadrao = abertas.length > 0 ? abertas[0].id : rodadasData[0].id;
                }
            }
            
            setRodadaSelecionada(rodadaPadrao);
            setRankingData(rankingResponse);
            setLoading(false);
        })
        .catch(() => setLoading(false));
    }, [apiUrl]);

    const rankingFiltrado = rankingData.filter(item => item.rodada_id === rodadaSelecionada);

    if (loading) {
        return <Box display="flex" justifyContent="center" alignItems="center" minHeight="100vh" bgcolor="#0f172a"><CircularProgress style={{ color: "#fbbf24" }} /></Box>;
    }

    return (
        <div style={{ backgroundColor: "#0f172a", minHeight: "100vh", padding: "40px 20px", color: "white" }}>
            <Container maxWidth="md">
                
                <Box textAlign="center" mb={4}>
                    <EmojiEvents style={{ color: "#fbbf24", fontSize: "60px" }} />
                    <Typography variant="h3" fontWeight="900" style={{ color: "#fcd34d" }}>RANKING GERAL</Typography>
                    <Typography variant="body1" color="#94a3b8" mt={1}>Acompanhe a pontuação dos aprovados em tempo real</Typography>
                </Box>

                <Paper style={{ padding: '20px', borderRadius: '16px', backgroundColor: '#1e293b', border: '1px solid #334155' }}>
                    <Box mb={4}>
                        <TextField
                            select
                            label="Filtrar por Desafio/Rodada"
                            value={rodadaSelecionada}
                            onChange={(e) => setRodadaSelecionada(Number(e.target.value))}
                            fullWidth
                            variant="filled"
                            sx={{ backgroundColor: '#fff', borderRadius: '8px' }}
                        >
                            {rodadas.map((rodada) => (
                                <MenuItem key={rodada.id} value={rodada.id}>
                                    {rodada.nome} {rodada.exibir_no_ranking ? "🌟 (OFICIAL)" : ""}
                                </MenuItem>
                            ))}
                        </TextField>
                    </Box>

                    <TableContainer>
                        <Table>
                            <TableHead style={{ backgroundColor: '#0f172a' }}>
                                <TableRow>
                                    <TableCell style={{ color: '#94a3b8', fontWeight: 'bold' }}>Posição</TableCell>
                                    <TableCell style={{ color: '#94a3b8', fontWeight: 'bold' }}>Apostador</TableCell>
                                    <TableCell style={{ color: '#94a3b8', fontWeight: 'bold', textAlign: 'center' }}>Bilhete</TableCell>
                                    <TableCell style={{ color: '#fbbf24', fontWeight: '900', textAlign: 'right' }}>Pontos</TableCell>
                                </TableRow>
                            </TableHead>
                            <TableBody>
                                {rankingFiltrado.length === 0 ? (
                                    <TableRow>
                                        <TableCell colSpan={4} align="center" style={{ color: '#94a3b8', padding: '30px' }}>
                                            Nenhum bilhete aprovado nesta rodada ainda.
                                        </TableCell>
                                    </TableRow>
                                ) : (
                                    rankingFiltrado.map((item, index) => {
                                        const ePodio = index < 3;
                                        return (
                                            <TableRow key={item.cartela_id} style={{ backgroundColor: ePodio ? 'rgba(251, 191, 36, 0.1)' : 'transparent' }}>
                                                <TableCell style={{ color: ePodio ? '#fbbf24' : 'white', fontWeight: 'bold', fontSize: ePodio ? '18px' : '14px' }}>
                                                    {index + 1}º
                                                </TableCell>
                                                <TableCell style={{ color: 'white', fontWeight: ePodio ? 'bold' : 'normal' }}>
                                                    {item.nome}
                                                </TableCell>
                                                <TableCell style={{ color: '#94a3b8', textAlign: 'center' }}>
                                                    #{item.numero_bilhete || item.cartela_id}
                                                </TableCell>
                                                <TableCell style={{ color: '#fbbf24', fontWeight: '900', textAlign: 'right', fontSize: '16px' }}>
                                                    {item.pontuacao_total}
                                                </TableCell>
                                            </TableRow>
                                        );
                                    })
                                )}
                            </TableBody>
                        </Table>
                    </TableContainer>
                </Paper>

                <Box mt={4} textAlign="center">
                    <AppButton label="Voltar ao Início" onClick={() => history.push('/public')} style={{ backgroundColor: "#334155", border: "none" }} />
                </Box>
            </Container>
        </div>
    );
}