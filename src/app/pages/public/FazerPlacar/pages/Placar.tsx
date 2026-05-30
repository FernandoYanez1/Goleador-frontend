import React, { useState, useEffect } from 'react';
import { useHistory } from 'react-router-dom';
import { Container, Typography, Paper, Box, Grid, Card, CardContent, CardActions, CircularProgress, TextField, Button, Dialog, DialogContent, DialogTitle, IconButton } from '@mui/material';
import { SportsSoccer, Public, Stars, Timer } from '@mui/icons-material';
import CloseIcon from '@mui/icons-material/Close';
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

    const [modalPixAberto, setModalPixAberto] = useState(false);
    const [pixData, setPixData] = useState<any>(null);

    // NOVO: Estado que guarda os cronômetros de TODAS as rodadas simultaneamente
    const [timers, setTimers] = useState<Record<number, { alvo: number | null, restante: any }>>({});

    // CSS Injetado para ocultar as "setinhas" de input number e ajustar responsivo
    useEffect(() => {
        const style = document.createElement("style");
        style.innerHTML = `
            input[type=number]::-webkit-inner-spin-button, 
            input[type=number]::-webkit-outer-spin-button { -webkit-appearance: none; margin: 0; }
            input[type=number] { -moz-appearance: textfield; }
            .team-name { white-space: nowrap; overflow: hidden; text-overflow: ellipsis; max-width: 80px; display: inline-block; }
            @media (max-width: 400px) { .team-name { max-width: 60px; } }
        `;
        document.head.appendChild(style);
        return () => { document.head.removeChild(style); };
    }, []);

    // 1. CARREGAR DADOS E CALCULAR DATA ALVO DE CADA RODADA
    useEffect(() => {
        const salvo = localStorage.getItem('usuarioLogado');
        if (!salvo) { history.push('/public/login'); return; }
        setUsuario(JSON.parse(salvo));

        Promise.all([
            fetch(`${apiUrl}/rodadas`).then(res => res.json()),
            fetch(`${apiUrl}/teams`).then(res => res.json())
        ]).then(async ([rodadasData, teamsData]) => {
            const abertas = rodadasData.filter((r: any) => r.status === 'aberta');
            setRodadas(abertas);
            setTeams(teamsData);
            
            // Define o Alvo (Data Final) para cada rodada
            const initialTimers: any = {};
            
            await Promise.all(abertas.map(async (r: any) => {
                if (r.tipo === 'campeao') {
                    // Data fixa da Copa do Mundo (Mude se precisar)
                    initialTimers[r.id] = { alvo: new Date('2026-06-11T15:00:00').getTime(), restante: null };
                } else if (r.tipo === 'placares') {
                    try {
                        const res = await fetch(`${apiUrl}/jogos?rodada_id=${r.id}`);
                        const data = await res.json();
                        if (data.length > 0) {
                            const validDates = data.map((j: any) => new Date(j.data_hora).getTime()).filter((n: any) => !isNaN(n));
                            if (validDates.length > 0) {
                                const primeiroJogo = Math.min(...validDates);
                                initialTimers[r.id] = { alvo: primeiroJogo - (30 * 60000), restante: null }; // 30 min antes do primeiro jogo
                            }
                        }
                    } catch (e) { console.error(e); }
                }
            }));
            
            setTimers(initialTimers);

            if (abertas.length === 1) selecionarModoJogo(abertas[0]);
            else setLoading(false);
        }).catch(err => {
            console.error(err);
            setLoading(false);
        });
    }, [history, apiUrl]);

    // 2. ATUALIZAR TODOS OS CRONÔMETROS POR SEGUNDO
    useEffect(() => {
        const intervalo = setInterval(() => {
            const agora = new Date().getTime();
            
            setTimers(prevTimers => {
                const updated = { ...prevTimers };
                Object.keys(updated).forEach(key => {
                    const id = Number(key);
                    const alvo = updated[id].alvo;
                    
                    if (alvo) {
                        const diferenca = alvo - agora;
                        if (diferenca <= 0) {
                            updated[id].restante = { dias: 0, horas: 0, minutos: 0, segundos: 0, expirado: true };
                        } else {
                            updated[id].restante = { 
                                dias: Math.floor(diferenca / (1000 * 60 * 60 * 24)), 
                                horas: Math.floor((diferenca % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60)), 
                                minutos: Math.floor((diferenca % (1000 * 60 * 60)) / (1000 * 60)), 
                                segundos: Math.floor((diferenca % (1000 * 60)) / 1000), 
                                expirado: false 
                            };
                        }
                    }
                });
                return updated;
            });
        }, 1000);

        return () => clearInterval(intervalo);
    }, []);

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
        }
    };

    const handlePlacarChange = (matchId: number, campo: 'casa' | 'visitante', valor: string) => {
        const valorLimpo = valor.replace(/\D/g, ''); 
        setPalpitesPlacares({ ...palpitesPlacares, [matchId]: { ...palpitesPlacares[matchId], [campo]: valorLimpo } });
    };

    const submeterApostaPlacares = async () => {
        const timerRodada = timers[rodadaAtiva.id]?.restante;
        if (timerRodada?.expirado) return alert("O tempo limite para apostar nesta rodada expirou!");

        for (let jogo of jogos) {
            const p = palpitesPlacares[jogo.id];
            if (!p || p.casa === undefined || p.visitante === undefined || p.casa === '' || p.visitante === '') {
                return alert(`Por favor, preencha o palpite para o jogo: ${jogo.time_casa} x ${jogo.time_visitante}`);
            }
        }

        setEnviandoAposta(true);
        const formatado = jogos.map(j => ({ match_id: j.id, palpite_casa: parseInt(palpitesPlacares[j.id].casa, 10), palpite_visitante: parseInt(palpitesPlacares[j.id].visitante, 10) }));

        try {
            const res = await fetch(`${apiUrl}/apostar`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ usuario_id: usuario.id, rodada_id: rodadaAtiva.id, apostas: formatado })
            });
            const dados = await res.json();
            if (res.ok) {
                setPixData({ pix_copia_cola: dados.pix_copia_cola, qr_code_base64: dados.qr_code_base64, cartela_id: dados.cartela_id, valor: rodadaAtiva.preco, rodada_nome: rodadaAtiva.nome });
                setModalPixAberto(true);
            } else { alert(dados.erro || "Erro ao registar palpites."); }
        } catch (err) { alert("Erro na conexão com o servidor."); } 
        finally { setEnviandoAposta(false); }
    };

    const submeterApostaCampeao = async () => {
        const timerRodada = timers[rodadaAtiva.id]?.restante;
        if (!selecaoEscolhida) return alert("Escolha uma seleção para ser campeã!");
        if (timerRodada?.expirado) return alert("As apostas para Campeão da Copa já foram encerradas!");

        setEnviandoAposta(true);
        try {
            const res = await fetch(`${apiUrl}/apostar`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ usuario_id: usuario.id, rodada_id: rodadaAtiva.id, palpite_campeao: selecaoEscolhida })
            });
            const dados = await res.json();
            if (res.ok) {
                setPixData({ pix_copia_cola: dados.pix_copia_cola, qr_code_base64: dados.qr_code_base64, cartela_id: dados.cartela_id, valor: rodadaAtiva.preco, rodada_nome: rodadaAtiva.nome });
                setModalPixAberto(true);
            } else { alert(dados.erro || "Erro ao processar bilhete."); }
        } catch (err) { alert("Erro na ligação ao servidor."); } 
        finally { setEnviandoAposta(false); }
    };

    const handleVoltar = () => {
        if (rodadas.length > 1) {
            setRodadaAtiva(null);
        } else { history.push('/public'); }
    };

    const formatarDataJogo = (dataStr: string) => {
        if (!dataStr) return "Data indefinida";
        const d = new Date(dataStr);
        return isNaN(d.getTime()) ? dataStr : d.toLocaleString("pt-BR", { day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit' });
    };

    // LÓGICA DE FILTRO E ORDENAÇÃO (COPA DO MUNDO)
    const selecoesCopa = teams.filter(t => t.id >= 19 && t.id <= 66);
    const idsFavoritos = [27, 51, 55, 47, 63, 59, 35];
    const favoritos = idsFavoritos.map(id => selecoesCopa.find(t => t.id === id)).filter(Boolean);
    const outrasSelecoes = selecoesCopa.filter(t => !idsFavoritos.includes(t.id));

    if (loading) return <Box display="flex" justifyContent="center" alignItems="center" minHeight="100vh" bgcolor="#f4f6f9"><CircularProgress /></Box>;

    return (
        <div style={{ background: 'linear-gradient(180deg,#f8fafc 0%, #eef2ff 100%)', minHeight: "100vh", padding: "40px 10px" }}>
            <Container maxWidth="md" style={{ padding: 0 }}>
                
                <Box display="flex" justifyContent="space-between" alignItems="center" mb={4} flexWrap="wrap" gap={2}>
                    <Button variant="outlined" onClick={() => history.push('/public')} style={{ borderRadius: '12px', padding: '10px 18px', fontWeight: 'bold', borderColor: '#cbd5e1', color: '#1e293b' }}>← Voltar</Button>
                    <Typography variant="h5" fontWeight="900" color="#1e293b" style={{ flexGrow: 1, textAlign: 'center' }}>⚽ Fazer Aposta</Typography>
                    <Button variant="contained" onClick={() => history.push('/public/meus-palpites')} style={{ borderRadius: '12px', padding: '10px 18px', fontWeight: 'bold', background: 'linear-gradient(135deg,#2563eb,#1d4ed8)', boxShadow: '0 6px 18px rgba(37,99,235,0.25)' }}>🎟️ Meus Bilhetes</Button>
                </Box>
                
                {/* ETAPA 1: LOBBY DE SELEÇÃO */}
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
                                const tRestante = timers[rodada.id]?.restante;
                                
                                // Lógica de cores do Timer no Card
                                let tBg = 'rgba(255, 255, 255, 0.05)';
                                let tColor = '#94a3b8';
                                let tBorder = '1px solid rgba(255, 255, 255, 0.1)';

                                if (tRestante) {
                                    if (tRestante.expirado) {
                                        // Encerrado (Cinza Escuro / Vermelho)
                                        tBg = 'rgba(239, 68, 68, 0.15)'; tColor = '#ef4444'; tBorder = '1px solid rgba(239, 68, 68, 0.4)';
                                    } else if (tRestante.dias === 0) {
                                        // Menos de 24h (Vermelho de Urgência)
                                        tBg = 'rgba(239, 68, 68, 0.15)'; tColor = '#ef4444'; tBorder = '1px solid rgba(239, 68, 68, 0.4)';
                                    } else if (tRestante.dias > 0) {
                                        // 1 dia ou mais (Amarelado de Atenção)
                                        tBg = 'rgba(245, 158, 11, 0.15)'; tColor = '#fbbf24'; tBorder = '1px solid rgba(245, 158, 11, 0.4)';
                                    }
                                }
                                
                                return (
                                    <Grid item xs={12} sm={5} md={4} key={rodada.id}>
                                        <Card style={{ height: '100%', display: 'flex', flexDirection: 'column', justifyContent: 'between', borderRadius: '16px', boxShadow: '0 4px 20px rgba(0,0,0,0.05)', border: eCampeao ? '2px solid #fbbf24' : 'none', backgroundColor: '#1e293b', color: 'white' }}>
                                            <CardContent style={{ textAlign: 'center', flexGrow: 1, padding: '25px' }}>
                                                <Box mb={2} display="flex" justifyContent="center">
                                                    {eCampeao ? <Stars style={{ fontSize: 50, color: '#fbbf24' }} /> : eCopa ? <Public style={{ fontSize: 50, color: '#3b82f6' }} /> : <SportsSoccer style={{ fontSize: 50, color: '#10b981' }} />}
                                                </Box>
                                                <Typography variant="h5" fontWeight="900" style={{ color: '#ffffff', marginTop: '10px', lineHeight: 1.2 }}>{rodada.nome}</Typography>
                                                <Typography variant="h4" fontWeight="900" color="#10b981" my={2}>{Number(rodada.preco).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}</Typography>

                                                {/* COUNTDOWN NO QUADRADO DO LOBBY */}
                                                {tRestante ? (
                                                    <Box style={{ backgroundColor: tBg, border: tBorder, padding: '10px', borderRadius: '8px', marginTop: '15px' }}>
                                                        <Typography variant="caption" style={{ color: tColor, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '4px', fontWeight: 'bold' }}>
                                                            <Timer fontSize="small" /> 
                                                            {tRestante.expirado 
                                                                ? "ENCERRADO" 
                                                                : `Restam: ${tRestante.dias > 0 ? `${tRestante.dias}d ` : ''}${tRestante.horas}h e ${tRestante.minutos} min`}
                                                        </Typography>
                                                    </Box>
                                                ) : (
                                                    <Box style={{ height: '42px', marginTop: '15px' }} /> // Espaçador para não quebrar a altura se a data não existir
                                                )}

                                            </CardContent>
                                            <CardActions style={{ padding: '20px', paddingTop: 0 }}>
                                                <AppButton 
                                                    label={tRestante?.expirado ? "Inscrições Fechadas" : "Escolher Bilhete"} 
                                                    disabled={tRestante?.expirado}
                                                    onClick={() => selecionarModoJogo(rodada)} 
                                                    style={{ width: '100%', border: 'none', backgroundColor: eCampeao ? '#fbbf24' : '#3b82f6', color: eCampeao ? '#1e293b' : '#ffffff', fontWeight: 'bold', fontSize: '15px', padding: '12px' }} 
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
                    <Paper style={{ padding: '20px', borderRadius: '24px', background: '#ffffff', boxShadow: '0 10px 40px rgba(15,23,42,0.08)', border: '1px solid #e2e8f0' }}>
                        <Box display="flex" justifyContent="space-between" alignItems="center" mb={4} flexWrap="wrap" gap={2} style={{ background: 'linear-gradient(135deg,#1e293b,#334155)', borderRadius: '18px', padding: '18px 22px' }}>
                            <Box>
                                <Typography variant="overline" style={{ color: '#94a3b8', fontWeight: 'bold', letterSpacing: 1 }}>RODADA ATIVA</Typography>
                                <Typography variant="h5" style={{ color: '#ffffff', fontWeight: 900 }}>{rodadaAtiva.nome}</Typography>
                            </Box>
                            <Box style={{ background: '#10b981', color: '#fff', padding: '10px 16px', borderRadius: '14px', fontWeight: 'bold', fontSize: '18px', boxShadow: '0 4px 15px rgba(16,185,129,0.25)' }}>
                                {Number(rodadaAtiva.preco).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
                            </Box>
                        </Box>

                        {/* TIMER GLOBAL DA RODADA DE PLACARES ATIVA */}
                        {timers[rodadaAtiva.id]?.restante && (
                            <Box mb={4} p={3} style={{ backgroundColor: timers[rodadaAtiva.id].restante.expirado ? '#fef2f2' : '#0f172a', color: timers[rodadaAtiva.id].restante.expirado ? '#ef4444' : '#ffffff', borderRadius: '12px', border: timers[rodadaAtiva.id].restante.expirado ? '2px solid #ef4444' : '1px solid #334155', textAlign: 'center' }}>
                                <Typography variant="caption" style={{ color: timers[rodadaAtiva.id].restante.expirado ? '#ef4444' : '#38bdf8', fontWeight: 'bold', letterSpacing: '1px' }}>
                                    {timers[rodadaAtiva.id].restante.expirado ? "TEMPO ESGOTADO" : "AS APOSTAS SE ENCERRAM EM:"}
                                </Typography>
                                {!timers[rodadaAtiva.id].restante.expirado ? (
                                    <Box display="flex" justifyContent="center" gap={3} mt={1}>
                                        {[{l:'DIAS', v:timers[rodadaAtiva.id].restante.dias}, {l:'HRS', v:timers[rodadaAtiva.id].restante.horas}, {l:'MIN', v:timers[rodadaAtiva.id].restante.minutos}, {l:'SEG', v:timers[rodadaAtiva.id].restante.segundos}].map(i => (
                                            <Box key={i.l}>
                                                <Typography variant="h4" fontWeight="900" color="#38bdf8">{i.v.toString().padStart(2, '0')}</Typography>
                                                <Typography variant="caption" color="#94a3b8">{i.l}</Typography>
                                            </Box>
                                        ))}
                                    </Box>
                                ) : (
                                    <Typography variant="body1" mt={1} fontWeight="bold">As apostas para esta rodada foram bloqueadas (limite: 30 minutos antes do 1º jogo).</Typography>
                                )}
                            </Box>
                        )}

                        <div style={{ opacity: timers[rodadaAtiva.id]?.restante?.expirado ? 0.6 : 1, pointerEvents: timers[rodadaAtiva.id]?.restante?.expirado ? 'none' : 'auto' }}>
                            {jogos.map((jogo) => (
                                <Box key={jogo.id} mb={3} p={2} style={{ border: '1px solid #e2e8f0', borderRadius: '12px', background: 'linear-gradient(180deg,#ffffff,#f8fafc)', boxShadow: '0 4px 10px rgba(15,23,42,0.04)', transition: '0.2s ease' }}>
                                    <Typography style={{ textAlign: "center", color: "#94a3b8", fontSize: "11px", fontWeight: "bold", marginBottom: "15px", letterSpacing: "0.5px" }}>
                                        {formatarDataJogo(jogo.data_hora)}
                                    </Typography>
                                    <Grid container alignItems="center" justifyContent="center" wrap="nowrap" spacing={1}>
                                        <Grid item xs={4} style={{ display: 'flex', flexDirection: 'row-reverse', alignItems: 'center', justifyContent: 'flex-start', gap: '8px' }}>
                                            <Box display="flex" flexDirection="column" alignItems="center">
                                                <img src={jogo.logo_casa || "/media/escudos-times/default.png"} alt="casa" style={{ width: 35, height: 35, objectFit: 'contain' }} />
                                                <Typography fontWeight="900" fontSize="14px" color="#1e293b" mt={0.5}>{jogo.sigla_casa}</Typography>
                                            </Box>
                                            <Typography className="team-name" variant="caption" color="#64748b" fontWeight="bold" textAlign="right" style={{ lineHeight: 1.1 }}>{jogo.time_casa}</Typography>
                                        </Grid>
                                        
                                        <Grid item xs={4} display="flex" justifyContent="center" alignItems="center" gap={1}>
                                            <input type="text" inputMode="numeric" pattern="[0-9]*" value={palpitesPlacares[jogo.id]?.casa ?? ''} onChange={(e) => handlePlacarChange(jogo.id, 'casa', e.target.value)} style={{ width: '45px', height: '45px', textAlign: 'center', fontSize: '20px', fontWeight: '900', borderRadius: '10px', border: '2px solid #cbd5e1', backgroundColor: '#fff', color: '#1e293b', outline: 'none', boxShadow: 'inset 0 2px 4px rgba(0,0,0,0.05)' }} />
                                            <Typography color="#cbd5e1" fontWeight="900" fontSize="14px">X</Typography>
                                            <input type="text" inputMode="numeric" pattern="[0-9]*" value={palpitesPlacares[jogo.id]?.visitante ?? ''} onChange={(e) => handlePlacarChange(jogo.id, 'visitante', e.target.value)} style={{ width: '45px', height: '45px', textAlign: 'center', fontSize: '20px', fontWeight: '900', borderRadius: '10px', border: '2px solid #cbd5e1', backgroundColor: '#fff', color: '#1e293b', outline: 'none', boxShadow: 'inset 0 2px 4px rgba(0,0,0,0.05)' }} />
                                        </Grid>

                                        <Grid item xs={4} style={{ display: 'flex', flexDirection: 'row', alignItems: 'center', justifyContent: 'flex-start', gap: '8px' }}>
                                            <Box display="flex" flexDirection="column" alignItems="center">
                                                <img src={jogo.logo_visitante || "/media/escudos-times/default.png"} alt="visitante" style={{ width: 35, height: 35, objectFit: 'contain' }} />
                                                <Typography fontWeight="900" fontSize="14px" color="#1e293b" mt={0.5}>{jogo.sigla_visitante}</Typography>
                                            </Box>
                                            <Typography className="team-name" variant="caption" color="#64748b" fontWeight="bold" textAlign="left" style={{ lineHeight: 1.1 }}>{jogo.time_visitante}</Typography>
                                        </Grid>
                                    </Grid>
                                </Box>
                            ))}

                            <Box mt={4}>
                                <AppButton 
                                    label={timers[rodadaAtiva.id]?.restante?.expirado ? "Apostas Encerradas" : (enviandoAposta ? "Gerando Pix..." : `Finalizar e Pagar (R$ ${Number(rodadaAtiva.preco).toFixed(2).replace('.',',')})`)} 
                                    disabled={enviandoAposta || timers[rodadaAtiva.id]?.restante?.expirado}
                                    onClick={submeterApostaPlacares} 
                                    style={{ width: '100%', padding: '14px', fontSize: '18px', border: 'none', background: timers[rodadaAtiva.id]?.restante?.expirado ? '#94a3b8' : 'linear-gradient(135deg,#10b981,#059669)', borderRadius: '14px', fontWeight: '900', boxShadow: '0 10px 20px rgba(16,185,129,0.3)', color: 'white' }} 
                                />
                            </Box>
                        </div>
                    </Paper>
                )}

                {/* ETAPA 2: APOSTA DIRETA (CAMPEÃO) */}
                {rodadaAtiva && rodadaAtiva.tipo === 'campeao' && (
                    <Paper style={{ padding: '40px 20px', borderRadius: '16px', textAlign: 'center', boxShadow: '0 4px 20px rgba(0,0,0,0.05)' }}>
                        <Box display="flex" justifyContent="space-between" alignItems="center" mb={4}>
                            <Typography variant="h5" fontWeight="bold" color="#1e293b">Aposta: Campeão da Copa</Typography>
                            <Button variant="text" color="secondary" onClick={handleVoltar}>Voltar</Button>
                        </Box>

                        {/* TIMER GLOBAL CAMPEÃO ATIVO */}
                        {timers[rodadaAtiva.id]?.restante && (
                            <Box mb={4} p={3} style={{ backgroundColor: timers[rodadaAtiva.id].restante.expirado ? '#fef2f2' : '#0f172a', color: timers[rodadaAtiva.id].restante.expirado ? '#ef4444' : '#ffffff', borderRadius: '12px', border: timers[rodadaAtiva.id].restante.expirado ? '2px solid #ef4444' : '1px solid #334155' }}>
                                <Typography variant="caption" style={{ color: timers[rodadaAtiva.id].restante.expirado ? '#ef4444' : '#fbbf24', fontWeight: 'bold', letterSpacing: '1px' }}>
                                    {timers[rodadaAtiva.id].restante.expirado ? "TEMPO ESGOTADO" : "TEMPO PARA O INÍCIO"}
                                </Typography>
                                {!timers[rodadaAtiva.id].restante.expirado ? (
                                    <Box display="flex" justifyContent="center" gap={3} mt={2}>
                                        {[{l:'DIAS', v:timers[rodadaAtiva.id].restante.dias}, {l:'HRS', v:timers[rodadaAtiva.id].restante.horas}, {l:'MIN', v:timers[rodadaAtiva.id].restante.minutos}].map(i => (
                                            <Box key={i.l}><Typography variant="h4" fontWeight="900" color="#fbbf24">{i.v.toString().padStart(2, '0')}</Typography><Typography variant="caption" color="#94a3b8">{i.l}</Typography></Box>
                                        ))}
                                    </Box>
                                ) : (
                                    <Typography variant="body1" mt={1} fontWeight="bold">As apostas para Campeão foram encerradas.</Typography>
                                )}
                            </Box>
                        )}

                        <div style={{ opacity: timers[rodadaAtiva.id]?.restante?.expirado ? 0.6 : 1, pointerEvents: timers[rodadaAtiva.id]?.restante?.expirado ? 'none' : 'auto' }}>
                            <Typography variant="h6" fontWeight="bold" mt={3} mb={2} color="#b45309" style={{ backgroundColor: '#fffbeb', padding: '5px', borderRadius: '8px' }}>⭐ SELEÇÕES FAVORITAS</Typography>
                            <Grid container spacing={1} justifyContent="center" mb={4}>
                                {favoritos.map((team: any) => (
                                    <Grid item xs={4} sm={4} md={3} key={team.id}>
                                        <Box onClick={() => setSelecaoEscolhida(team.nome)} style={{ padding: '10px 5px', border: selecaoEscolhida === team.nome ? '2px solid #fbbf24' : '1px solid #e2e8f0', borderRadius: '12px', cursor: 'pointer', backgroundColor: selecaoEscolhida === team.nome ? '#fffbeb' : '#fff', textAlign: 'center' }}>
                                            <img src={team.bandeira || team.logo_url} alt={team.sigla} style={{ width: '40px', height: '28px', objectFit: 'cover', borderRadius: '2px', marginBottom: '5px' }} />
                                            <Typography variant="caption" display="block" fontWeight={selecaoEscolhida === team.nome ? "bold" : "normal"} style={{ lineHeight: 1 }}>{team.nome}</Typography>
                                        </Box>
                                    </Grid>
                                ))}
                            </Grid>

                            <Typography variant="h6" fontWeight="bold" mt={3} mb={2} color="#475569" style={{ backgroundColor: '#f1f5f9', padding: '5px', borderRadius: '8px' }}>🌍 OUTRAS SELEÇÕES</Typography>
                            <Grid container spacing={1} justifyContent="center" mb={4}>
                                {outrasSelecoes.map((team: any) => (
                                    <Grid item xs={4} sm={4} md={3} key={team.id}>
                                        <Box onClick={() => setSelecaoEscolhida(team.nome)} style={{ padding: '10px 5px', border: selecaoEscolhida === team.nome ? '2px solid #3b82f6' : '1px solid #e2e8f0', borderRadius: '12px', cursor: 'pointer', backgroundColor: selecaoEscolhida === team.nome ? '#eff6ff' : '#fff', textAlign: 'center' }}>
                                            <img src={team.bandeira || team.logo_url} alt={team.sigla} style={{ width: '40px', height: '28px', objectFit: 'cover', borderRadius: '2px', marginBottom: '5px' }} />
                                            <Typography variant="caption" display="block" fontWeight={selecaoEscolhida === team.nome ? "bold" : "normal"} style={{ lineHeight: 1 }}>{team.nome}</Typography>
                                        </Box>
                                    </Grid>
                                ))}
                            </Grid>

                            <Box mt={4}>
                                <AppButton 
                                    label={enviandoAposta ? "Gerando Pix..." : `Confirmar Aposta (R$ ${Number(rodadaAtiva.preco).toFixed(2).replace('.',',')})`} 
                                    disabled={enviandoAposta || timers[rodadaAtiva.id]?.restante?.expirado}
                                    onClick={submeterApostaCampeao} 
                                    style={{ width: '100%', padding: '14px', fontSize: '18px', border: 'none', background: 'linear-gradient(135deg,#10b981,#059669)', borderRadius: '16px', fontWeight: '900', boxShadow: '0 10px 25px rgba(16,185,129,0.3)', color: 'white' }} 
                                />
                            </Box>
                        </div>
                    </Paper>
                )}

                <Dialog open={modalPixAberto} onClose={() => { setModalPixAberto(false); history.push('/public/meus-palpites'); }} maxWidth="xs" fullWidth>
                    <DialogTitle style={{ fontWeight: 900, textAlign: 'center', color: '#1e293b' }}>
                        Pagamento via PIX
                        <IconButton onClick={() => { setModalPixAberto(false); history.push('/public/meus-palpites'); }} style={{ position: 'absolute', right: 10, top: 10 }}>
                            <CloseIcon />
                        </IconButton>
                    </DialogTitle>
                    <DialogContent>
                        {pixData && (
                            <Box textAlign="center">
                                <Typography variant="body2" color="#64748b" mb={2}>Escaneie o QRCode abaixo para finalizar sua aposta</Typography>
                                <img src={`data:image/png;base64,${pixData.qr_code_base64}`} alt="QR Code PIX" style={{ width: '220px', maxWidth: '100%', borderRadius: '12px', marginBottom: '20px' }} />
                                <TextField fullWidth multiline value={pixData.pix_copia_cola} variant="outlined" label="PIX Copia e Cola" />
                                <Button fullWidth variant="contained" onClick={() => { navigator.clipboard.writeText(pixData.pix_copia_cola); alert('PIX copiado!'); }} style={{ marginTop: '15px', background: 'linear-gradient(135deg,#10b981,#059669)', color: '#fff', fontWeight: 'bold', borderRadius: '12px', padding: '12px' }}>
                                    COPIAR PIX
                                </Button>
                                <Button fullWidth variant="outlined" onClick={() => { setModalPixAberto(false); history.push('/public/meus-palpites'); }} style={{ marginTop: '10px', borderRadius: '12px', padding: '12px', fontWeight: 'bold', borderColor: '#10b981', color: '#10b981' }}>
                                    Já fiz o pagamento
                                </Button>
                                <Typography variant="body2" mt={2} color="#64748b">Valor: <strong>{Number(pixData.valor).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}</strong></Typography>
                            </Box>
                        )}
                    </DialogContent>
                </Dialog>
            </Container>
        </div>
    );
}