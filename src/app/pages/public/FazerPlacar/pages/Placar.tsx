import React, { useState, useEffect } from 'react';
import { useHistory } from 'react-router-dom';
import { Container, Typography, Paper, Box, Grid, CircularProgress, Chip } from '@mui/material';
import { SportsSoccer, Stars, CheckCircle, HourglassEmpty } from '@mui/icons-material';
import AppButton from '../../../../../vendors/components/Button';

export default function Palpites() {
    const history = useHistory();
    const apiUrl = process.env.REACT_APP_API_URL || 'http://localhost:3001';
    
    const [usuario, setUsuario] = useState<any>(null);
    const [cartelas, setCartelas] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const salvo = localStorage.getItem('usuarioLogado');
        if (!salvo) {
            history.push('/public/login');
            return;
        }
        const user = JSON.parse(salvo);
        setUsuario(user);

        fetch(`${apiUrl}/meus-palpites/${user.id}`)
            .then(res => res.json())
            .then(data => {
                setCartelas(data);
                setLoading(false);
            })
            .catch(() => setLoading(false));
    }, [history, apiUrl]);

    if (loading) {
        return <Box display="flex" justifyContent="center" alignItems="center" minHeight="100vh" bgcolor="#f8fafc"><CircularProgress /></Box>;
    }

    return (
        <div style={{ backgroundColor: "#f8fafc", minHeight: "100vh", padding: "40px 20px" }}>
            <Container maxWidth="md">
                <Box display="flex" justifyContent="space-between" alignItems="center" mb={4}>
                    <Typography variant="h4" fontWeight="900" color="#1e293b">Meus Bilhetes 🎟️</Typography>
                    <AppButton label="Voltar à Home" onClick={() => history.push('/public')} style={{ backgroundColor: "#64748b", border: "none" }} />
                </Box>

                {cartelas.length === 0 ? (
                    <Paper style={{ padding: '40px', textAlign: 'center', borderRadius: '16px' }}>
                        <Typography variant="h6" color="#64748b">Você ainda não tem palpites registados.</Typography>
                        <AppButton label="Fazer um Palpite Agora" onClick={() => history.push('/public/placar')} style={{ marginTop: '20px', backgroundColor: '#10b981', border: 'none' }} />
                    </Paper>
                ) : (
                    cartelas.map((cartela) => (
                        <Paper key={cartela.cartela_id} style={{ marginBottom: '30px', borderRadius: '16px', overflow: 'hidden', boxShadow: '0 10px 25px -5px rgba(0,0,0,0.05)' }}>
                            {/* CABEÇALHO DO BILHETE */}
                            <Box style={{ backgroundColor: '#1e293b', color: 'white', padding: '20px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '15px' }}>
                                <Box>
                                    <Typography variant="h6" fontWeight="bold" style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                        {cartela.rodada_tipo === 'campeao' ? <Stars style={{ color: '#fbbf24' }}/> : <SportsSoccer style={{ color: '#10b981' }}/>}
                                        {cartela.rodada_nome}
                                    </Typography>
                                    <Typography variant="body2" color="#94a3b8">
                                        Bilhete #{cartela.numero_bilhete || cartela.cartela_id} • Emitido em {new Date(cartela.data_criacao).toLocaleDateString('pt-BR')}
                                    </Typography>
                                </Box>
                                
                                <Box display="flex" gap="10px" alignItems="center">
                                    <Typography variant="h6" fontWeight="bold" color="#fbbf24">{cartela.total_pontos} pts</Typography>
                                    <Chip 
                                        icon={cartela.status_pagamento === 'aprovado' ? <CheckCircle /> : <HourglassEmpty />} 
                                        label={cartela.status_pagamento === 'aprovado' ? "Aprovado" : "Pendente"} 
                                        color={cartela.status_pagamento === 'aprovado' ? "success" : "warning"} 
                                        style={{ fontWeight: 'bold' }}
                                    />
                                </Box>
                            </Box>

                            {/* CORPO DO BILHETE (DINÂMICO) */}
                            <Box style={{ padding: '20px', backgroundColor: '#ffffff' }}>
                                
                                {cartela.rodada_tipo === 'campeao' ? (
                                    // VISUAL PARA APOSTA DE CAMPEÃO
                                    <Box textAlign="center" py={4} style={{ backgroundColor: '#fffbeb', border: '1px dashed #fcd34d', borderRadius: '12px' }}>
                                        <Typography variant="overline" color="#b45309" fontWeight="bold">SELEÇÃO ESCOLHIDA PARA CAMPEÃ</Typography>
                                        <Typography variant="h3" fontWeight="900" color="#1e293b" mt={1}>
                                            {cartela.palpites[0]?.palpite_texto?.toUpperCase() || "NÃO INFORMADA"}
                                        </Typography>
                                    </Box>
                                ) : (
                                    // VISUAL PARA APOSTAS DE PLACAR
                                    <Grid container spacing={2}>
                                        {cartela.palpites.map((p: any) => (
                                            <Grid item xs={12} sm={6} key={p.palpite_id}>
                                                <Box style={{ border: '1px solid #e2e8f0', borderRadius: '8px', padding: '15px', position: 'relative' }}>
                                                    
                                                    {/* Badge de Pontos Ganhos neste Jogo */}
                                                    <Box style={{ position: 'absolute', top: -10, right: 10, backgroundColor: p.pontos_ganhos > 0 ? '#10b981' : '#e2e8f0', color: p.pontos_ganhos > 0 ? 'white' : '#64748b', padding: '2px 8px', borderRadius: '12px', fontSize: '11px', fontWeight: 'bold' }}>
                                                        +{p.pontos_ganhos} pts
                                                    </Box>

                                                    <Box display="flex" justifyContent="center" alignItems="center" gap={2}>
                                                        <Box textAlign="center" flex={1}>
                                                            <img src={p.logo_casa || "/media/escudos-times/default.png"} alt="casa" style={{ width: 30, height: 30, objectFit: 'contain' }} />
                                                            <Typography variant="caption" display="block" fontWeight="bold">{p.time_casa}</Typography>
                                                        </Box>
                                                        
                                                        <Box textAlign="center">
                                                            <Typography variant="h5" fontWeight="900" color="#1e293b">{p.palpite_casa}</Typography>
                                                        </Box>
                                                        <Typography variant="body2" color="#94a3b8" fontWeight="bold">X</Typography>
                                                        <Box textAlign="center">
                                                            <Typography variant="h5" fontWeight="900" color="#1e293b">{p.palpite_visitante}</Typography>
                                                        </Box>

                                                        <Box textAlign="center" flex={1}>
                                                            <img src={p.logo_visitante || "/media/escudos-times/default.png"} alt="visit" style={{ width: 30, height: 30, objectFit: 'contain' }} />
                                                            <Typography variant="caption" display="block" fontWeight="bold">{p.time_visitante}</Typography>
                                                        </Box>
                                                    </Box>
                                                </Box>
                                            </Grid>
                                        ))}
                                    </Grid>
                                )}
                            </Box>
                        </Paper>
                    ))
                )}
            </Container>
        </div>
    );
}