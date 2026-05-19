import React, { useState, useEffect } from 'react';
import { useHistory } from 'react-router-dom';
import { Container, Typography, Paper, Box, Grid, Card, CardContent, CardActions, CircularProgress, MenuItem, TextField, Button } from '@mui/material';
import { SportsSoccer, Public, Stars, Timer } from '@mui/icons-material';
import AppButton from '../../../../../vendors/components/Button';

export default function Placar() {
    const history = useHistory();
    const apiUrl = process.env.REACT_APP_API_URL || 'http://localhost:3001';

    const [usuario, setUsuario] = useState<any>(null);
    const [rodadas, setRodadas] = useState<any[]>([]);
    const [teams, setTeams] = useState<any[]>([]); 
    const [loading, setLoading] = useState(true);

    const [rodadaAtiva, setRodadaAtiva] = useState<any>(null);
    const [jogos, setJogos] = useState<any[]>([]);
    const [palpitesPlacares, setPalpitesPlacares] = useState<any>({});
    const [selecaoEscolhida, setSelecaoEscolhida] = useState<string>('');
    const [enviandoAposta, setEnviandoAposta] = useState(false);

    const [tempoRestante, setTempoRestante] = useState({ dias: 0, horas: 0, minutos: 0, segundos: 0, expirado: false });

    useEffect(() => {
        const salvo = localStorage.getItem('usuarioLogado');
        if (!salvo) {
            history.push('/public/login');
            return;
        }
        setUsuario(JSON.parse(salvo));

        Promise.all([
            fetch(`${apiUrl}/rodadas`).then(res => res.json()),
            fetch(`${apiUrl}/teams`).then(res => res.json())
        ])
        .then(([rodadasData, teamsData]) => {
            const abertas = rodadasData.filter((r: any) => r.status === 'aberta');
            setRodadas(abertas);
            setTeams(teamsData);
            
            // LÓGICA DE SALTO INTELIGENTE: Se só tem 1 aberta, já seleciona ela direto.
            if (abertas.length === 1) {
                setRodadaAtiva(abertas[0]);
                if (abertas[0].tipo === 'placares') {
                    fetch(`${apiUrl}/jogos?rodada_id=${abertas[0].id}`)
                        .then(res => res.json())
                        .then(data => {
                            setJogos(data);
                            setLoading(false);
                        });
                } else {
                    setLoading(false);
                }
            } else {
                setLoading(false);
            }
        })
        .catch(err => {
            console.error(err);
            setLoading(false);
        });

        // Configuração do Countdown (Copa do Mundo)
        const dataAlvo = new Date('2026-06-11T15:00:00').getTime();
        const intervalo = setInterval(() => {
            const agora = new Date().getTime();
            const diferenca = dataAlvo - agora;

            if (diferenca <= 0) {
                setTempoRestante(prev => ({ ...prev, expirado: true }));
                clearInterval(intervalo);
            } else {
                const dias = Math.floor(diferenca / (1000 * 60 * 60 * 24));
                const horas = Math.floor((diferenca % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
                const minutos = Math.floor((diferenca % (1000 * 60 * 60)) / (1000 * 60));
                const segundos = Math.floor((diferenca % (1000 * 60)) / 1000);
                setTempoRestante({ dias, horas, minutos, segundos, expirado: false });
            }
        }, 1000);

        return () => clearInterval(intervalo);
    }, [history, apiUrl]);

    const selecionarModoJogo = (rodada: any) => {
        setRodadaAtiva(rodada);
        if (rodada.tipo === 'placares') {
            setLoading(true);
            fetch(`${apiUrl}/jogos?rodada_id=${rodada.id}`)
                .then(res => res.json())
                .then(data => {
                    setJogos(data);
                    setLoading(false);
                });
        } else {
            setLoading(false);
        }
    };

    const handlePlacarChange = (matchId: number, campo: 'casa' | 'visitante', valor: string) => {
        // Remove tudo que não for número (bloqueia letras e sinais)
        const valorLimpo = valor.replace(/\D/g, ''); 
        
        setPalpitesPlacares({
            ...palpitesPlacares,
            [matchId]: {
                ...palpitesPlacares[matchId],
                [campo]: valorLimpo
            }
        });
    };

    const submeterApostaPlacares = async () => {
        for (let jogo of jogos) {
            const p = palpitesPlacares[jogo.id];
            if (!p || p.casa === undefined || p.visitante === undefined || p.casa === '' || p.visitante === '') {
                return alert(`Por favor, preencha o palpite para o jogo: ${jogo.time_casa} x ${jogo.time_visitante}`);
            }
        }

        setEnviandoAposta(true);
        const formatado = jogos.map(j => ({
            match_id: j.id,
            palpite_casa: parseInt(palpitesPlacares[j.id].casa, 10),
            palpite_visitante: parseInt(palpitesPlacares[j.id].visitante, 10)
        }));

        try {
            const res = await fetch(`${apiUrl}/apostar`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    usuario_id: usuario.id,
                    rodada_id: rodadaAtiva.id,
                    apostas: formatado
                })
            });
            const dados = await res.json();
            if (res.ok) {
                history.push({
                    pathname: '/public/pagamento',
                    state: { pix_copia_cola: dados.pix_copia_cola, qr_code_base64: dados.qr_code_base64, cartela_id: dados.cartela_id }
                });
            } else {
                alert(dados.erro || "Erro ao registar palpites.");
            }
        } catch (err) {
            alert("Erro na conexão com o servidor.");
        } finally {
            setEnviandoAposta(false);
        }
    };

    const submeterApostaCampeao = async () => {
        if (!selecaoEscolhida) return alert("Escolha uma seleção para ser campeã!");
        if (tempoRestante.expirado) return alert("As apostas para Campeão da Copa já foram encerradas!");

        setEnviandoAposta(true);
        try {
            const res = await fetch(`${apiUrl}/apostar`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    usuario_id: usuario.id,
                    rodada_id: rodadaAtiva.id,
                    palpite_campeao: selecaoEscolhida
                })
            });
            const dados = await res.json();
            if (res.ok) {
                history.push({
                    pathname: '/public/pagamento',
                    state: { pix_copia_cola: dados.pix_copia_cola, qr_code_base64: dados.qr_code_base64, cartela_id: dados.cartela_id }
                });
            } else {
                alert(dados.erro || "Erro ao processar bilhete.");
            }
        } catch (err) {
            alert("Erro na ligação ao servidor.");
        } finally {
            setEnviandoAposta(false);
        }
    };

    // Botão Voltar: Só exibe se houver MAIS de uma rodada aberta, permitindo voltar ao Lobby
    const handleVoltar = () => {
        if (rodadas.length > 1) {
            setRodadaAtiva(null);
        } else {
            history.push('/public');
        }
    };

    if (loading) {
        return (
            <Box display="flex" justifyContent="center" alignItems="center" minHeight="100vh" bgcolor="#f4f6f9">
                <CircularProgress />
            </Box>
        );
    }

    return (
        <div style={{ backgroundColor: "#f4f6f9", minHeight: "100vh", padding: "40px 20px" }}>
            <Container maxWidth="md">
                
                {/* ETAPA 1: LOBBY DE SELEÇÃO (Ocultado automaticamente se só houver 1 rodada) */}
                {!rodadaAtiva && (
                    <>
                        <Box textAlign="center" mb={5}>
                            <Typography variant="h4" fontWeight="900" color="#1e293b">Escolha o seu Desafio ⚽</Typography>
                            <Typography variant="body1" color="#64748b" mt={1}>Temos múltiplas rodadas abertas. Selecione qual deseja participar.</Typography>
                        </Box>

                        <Grid container spacing={3} justifyContent="center">
                            {rodadas.map((rodada) => {
                                const eCampeao = rodada.tipo === 'campeao';
                                const eCopa = rodada.nome.toLowerCase().includes('copa');
                                
                                return (
                                    <Grid item xs={12} sm={5} md={4} key={rodada.id}>
                                        <Card style={{ height: '100%', display: 'flex', flexDirection: 'column', justifyContent: 'between', borderRadius: '16px', boxShadow: '0 4px 20px rgba(0,0,0,0.05)', border: eCampeao ? '2px solid #fbbf24' : 'none', backgroundColor: '#1e293b', color: 'white' }}>
                                            <CardContent style={{ textAlign: 'center', flexGrow: 1, padding: '25px' }}>
                                                <Box mb={2} display="flex" justifyContent="center">
                                                    {eCampeao ? <Stars style={{ fontSize: 50, color: '#fbbf24' }} /> : eCopa ? <Public style={{ fontSize: 50, color: '#3b82f6' }} /> : <SportsSoccer style={{ fontSize: 50, color: '#10b981' }} />}
                                                </Box>
                                                <Typography variant="h5" fontWeight="bold">{rodada.nome}</Typography>
                                                
                                                <Typography variant="h4" fontWeight="900" color="#10b981" my={2}>
                                                    {Number(rodada.preco).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
                                                </Typography>

                                                {eCampeao && (
                                                    <Box style={{ backgroundColor: 'rgba(251, 191, 36, 0.1)', border: '1px solid rgba(251, 191, 36, 0.3)', padding: '10px', borderRadius: '8px', marginTop: '15px' }}>
                                                        <Typography variant="caption" style={{ color: '#fbbf24', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '4px', fontWeight: 'bold' }}>
                                                            <Timer fontSize="small" /> 
                                                            {tempoRestante.expirado ? "ENCERRADO" : `Restam: ${tempoRestante.dias}d ${tempoRestante.horas}h`}
                                                        </Typography>
                                                    </Box>
                                                )}
                                            </CardContent>
                                            <CardActions style={{ padding: '20px', paddingTop: 0 }}>
                                                <AppButton 
                                                    label={eCampeao && tempoRestante.expirado ? "Inscrições Fechadas" : "Escolher Bilhete"} 
                                                    disabled={eCampeao && tempoRestante.expirado}
                                                    onClick={() => selecionarModoJogo(rodada)} 
                                                    style={{ 
                                                        width: '100%', 
                                                        border: 'none', 
                                                        backgroundColor: eCampeao ? '#fbbf24' : '#3b82f6', 
                                                        color: eCampeao ? '#1e293b' : '#ffffff', 
                                                        fontWeight: 'bold', 
                                                        fontSize: '15px', 
                                                        padding: '12px' 
                                                    }} 
                                                />
                                            </CardActions>
                                        </Card>
                                    </Grid>
                                );
                            })}
                        </Grid>
                    </>
                )}

                {/* ETAPA 2: FORMULÁRIO DE PLACARES */}
                {rodadaAtiva && rodadaAtiva.tipo === 'placares' && (
                    <Paper style={{ padding: '30px', borderRadius: '16px', boxShadow: '0 4px 20px rgba(0,0,0,0.05)' }}>
                        <Box display="flex" justifyContent="space-between" alignItems="center" mb={4}>
                            <Typography variant="h5" fontWeight="bold" color="#1e293b">{rodadaAtiva.nome}</Typography>
                            <Button variant="text" color="secondary" onClick={handleVoltar}>Voltar</Button>
                        </Box>

                        {jogos.map((jogo) => (
                            <Box key={jogo.id} mb={3} p={2} style={{ border: '1px solid #e2e8f0', borderRadius: '12px', backgroundColor: '#fff' }}>
                                <Grid container alignItems="center" justifyContent="center" spacing={1}>
                                    
                                    {/* Time Casa (Escudo e Sigla centralizados, nome abaixo) */}
                                    <Grid item xs={4} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
                                        <Box display="flex" alignItems="center" gap={1}>
                                            <img src={jogo.logo_casa || "/media/escudos-times/default.png"} alt="casa" style={{ width: 40, height: 40, objectFit: 'contain' }} />
                                            <Typography fontWeight="900" fontSize="18px" color="#1e293b">{jogo.sigla_casa}</Typography>
                                        </Box>
                                        <Typography variant="caption" color="#64748b" fontWeight="bold" style={{ marginTop: '4px', textAlign: 'center', lineHeight: 1 }}>{jogo.time_casa}</Typography>
                                    </Grid>
                                    
                                    {/* Inputs de Placar (Limpos e sem setas) */}
                                    <Grid item xs={4} display="flex" justifyContent="center" alignItems="center" gap={1}>
                                        <input 
                                            type="text"
                                            inputMode="numeric"
                                            pattern="[0-9]*"
                                            value={palpitesPlacares[jogo.id]?.casa ?? ''}
                                            onChange={(e) => handlePlacarChange(jogo.id, 'casa', e.target.value)}
                                            style={{ width: '45px', height: '45px', textAlign: 'center', fontSize: '20px', fontWeight: '900', borderRadius: '8px', border: '2px solid #cbd5e1', backgroundColor: '#f8fafc', color: '#1e293b', outline: 'none' }}
                                        />
                                        <Typography color="#94a3b8" fontWeight="900" fontSize="16px">X</Typography>
                                        <input 
                                            type="text"
                                            inputMode="numeric"
                                            pattern="[0-9]*"
                                            value={palpitesPlacares[jogo.id]?.visitante ?? ''}
                                            onChange={(e) => handlePlacarChange(jogo.id, 'visitante', e.target.value)}
                                            style={{ width: '45px', height: '45px', textAlign: 'center', fontSize: '20px', fontWeight: '900', borderRadius: '8px', border: '2px solid #cbd5e1', backgroundColor: '#f8fafc', color: '#1e293b', outline: 'none' }}
                                        />
                                    </Grid>

                                    {/* Time Visitante (Sigla e Escudo centralizados, nome abaixo) */}
                                    <Grid item xs={4} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
                                        <Box display="flex" alignItems="center" gap={1}>
                                            <Typography fontWeight="900" fontSize="18px" color="#1e293b">{jogo.sigla_visitante}</Typography>
                                            <img src={jogo.logo_visitante || "/media/escudos-times/default.png"} alt="visitante" style={{ width: 40, height: 40, objectFit: 'contain' }} />
                                        </Box>
                                        <Typography variant="caption" color="#64748b" fontWeight="bold" style={{ marginTop: '4px', textAlign: 'center', lineHeight: 1 }}>{jogo.time_visitante}</Typography>
                                    </Grid>

                                </Grid>
                            </Box>
                        ))}

                        <Box mt={4}>
                            <AppButton 
                                label={enviandoAposta ? "Gerando Pix..." : `Finalizar e Pagar (R$ ${Number(rodadaAtiva.preco).toFixed(2).replace('.',',')})`} 
                                disabled={enviandoAposta}
                                onClick={submeterApostaPlacares} 
                                style={{ width: '100%', padding: '14px', fontSize: '18px', border: 'none', backgroundColor: '#10b981', color: 'white' }} 
                            />
                        </Box>
                    </Paper>
                )}

                {/* ETAPA 2: APOSTA DIRETA (CAMPEÃO) */}
                {rodadaAtiva && rodadaAtiva.tipo === 'campeao' && (
                    <Paper style={{ padding: '40px 30px', borderRadius: '16px', textAlign: 'center', boxShadow: '0 4px 20px rgba(0,0,0,0.05)' }}>
                        <Box display="flex" justifyContent="space-between" alignItems="center" mb={4}>
                            <Typography variant="h5" fontWeight="bold" color="#1e293b">Aposta: Campeão da Copa</Typography>
                            <Button variant="text" color="secondary" onClick={handleVoltar}>Voltar</Button>
                        </Box>

                        <Box mb={4} p={3} style={{ background: 'linear-gradient(135deg, #1e293b 0%, #0f172a 100%)', color: 'white', borderRadius: '12px' }}>
                            <Typography variant="h6" style={{ color: '#fbbf24', fontWeight: 'bold' }}>CONTAGEM REGRESSIVA ⌛</Typography>
                            <Typography variant="h4" fontWeight="900" my={2}>
                                {tempoRestante.dias}d : {tempoRestante.horas}h : {tempoRestante.minutos}m : {tempoRestante.segundos}s
                            </Typography>
                            <Typography variant="caption" color="#94a3b8">O mercado fecha estritamente no dia 11/06 às 15:00h.</Typography>
                        </Box>

                        <Box my={4} maxWidth="400px" margin="0 auto">
                            <TextField
                                select
                                label="Selecione o País Campeão"
                                value={selecaoEscolhida}
                                onChange={(e) => setSelecaoEscolhida(e.target.value)}
                                fullWidth
                                variant="outlined"
                            >
                                {teams.map((team) => (
                                    <MenuItem key={team.id} value={team.nome}>
                                        <Box display="flex" alignItems="center" gap={2}>
                                            <img src={team.bandeira || team.logo_url} alt={team.sigla} style={{ width: '25px', height: '18px', objectFit: 'cover', borderRadius: '2px' }} />
                                            <Typography fontWeight="bold">{team.nome} ({team.sigla})</Typography>
                                        </Box>
                                    </MenuItem>
                                ))}
                            </TextField>
                        </Box>

                        <Box mt={4}>
                            <AppButton 
                                label={enviandoAposta ? "Gerando Pix..." : `Confirmar Seleção (R$ ${Number(rodadaAtiva.preco).toFixed(2).replace('.',',')})`} 
                                disabled={enviandoAposta || tempoRestante.expirado}
                                onClick={submeterApostaCampeao} 
                                style={{ width: '100%', padding: '14px', fontSize: '18px', border: 'none', backgroundColor: '#fbbf24', color: '#1e293b' }} 
                            />
                        </Box>
                    </Paper>
                )}
            </Container>
        </div>
    );
}