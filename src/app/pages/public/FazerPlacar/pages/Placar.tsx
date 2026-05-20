import React, { useState, useEffect } from 'react';
import { useHistory } from 'react-router-dom';
import { Container, Typography, Paper, Box, Grid, Card, CardContent, CardActions, CircularProgress, MenuItem, TextField, Button, ListSubheader } from '@mui/material';
import { SportsSoccer, Public, Stars, Timer } from '@mui/icons-material';
import AppButton from '../../../../../vendors/components/Button';
import {
    Dialog,
    DialogContent,
    DialogTitle,
    IconButton
} from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';

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

    const [tempoRestante, setTempoRestante] = useState({ dias: 0, horas: 0, minutos: 0, segundos: 0, expirado: false });

    // CSS Injetado para ocultar as "setinhas" de input number
    useEffect(() => {
        const style = document.createElement("style");
        style.innerHTML = `
            input[type=number]::-webkit-inner-spin-button, 
            input[type=number]::-webkit-outer-spin-button { 
                -webkit-appearance: none; 
                margin: 0; 
            }
            input[type=number] {
                -moz-appearance: textfield;
            }
        `;
        document.head.appendChild(style);
        return () => { document.head.removeChild(style); };
    }, []);

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
            
            // LÓGICA DE SALTO INTELIGENTE
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
            console.log("Dados do Backend:", dados);
            if (res.ok) {
                setPixData({
    pix_copia_cola: dados.pix_copia_cola,
    qr_code_base64: dados.qr_code_base64,
    cartela_id: dados.cartela_id,
    valor: rodadaAtiva.preco,
    rodada_nome: rodadaAtiva.nome
});

setModalPixAberto(true);
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
                setPixData({
    pix_copia_cola: dados.pix_copia_cola,
    qr_code_base64: dados.qr_code_base64,
    cartela_id: dados.cartela_id,
    valor: rodadaAtiva.preco,
    rodada_nome: rodadaAtiva.nome
});

setModalPixAberto(true);
            } else {
                alert(dados.erro || "Erro ao processar bilhete.");
            }
        } catch (err) {
            alert("Erro na ligação ao servidor.");
        } finally {
            setEnviandoAposta(false);
        }
    };

    const handleVoltar = () => {
        if (rodadas.length > 1) {
            setRodadaAtiva(null);
        } else {
            history.push('/public');
        }
    };

    // ==========================================
    // LÓGICA DE FILTRO E ORDENAÇÃO (COPA DO MUNDO)
    // ==========================================
    const selecoesCopa = teams.filter(t => t.id >= 19 && t.id <= 66);
    const idsFavoritos = [27, 51, 55, 47, 63, 59, 35]; // Brasil, França, Argentina, Espanha, Inglaterra, Portugal, Alemanha
    
    // Separa os favoritos na ordem exata solicitada
    const favoritos = idsFavoritos
        .map(id => selecoesCopa.find(t => t.id === id))
        .filter(Boolean); // Remove nulos caso algum ID não exista

    // Pega o restante das seleções
    const outrasSelecoes = selecoesCopa.filter(t => !idsFavoritos.includes(t.id));


    if (loading) {
        return (
            <Box display="flex" justifyContent="center" alignItems="center" minHeight="100vh" bgcolor="#f4f6f9">
                <CircularProgress />
            </Box>
        );
    }

    return (
       <div 
         style={{ 
         background: 'linear-gradient(180deg,#f8fafc 0%, #eef2ff 100%)',
         minHeight: "100vh",
         padding: "40px 20px"
    }}
>
            <Container maxWidth="md">
    
    <Box 
        display="flex" 
        justifyContent="space-between" 
        alignItems="center"
        mb={4}
        flexWrap="wrap"
        gap={2}
    >
        <Button
            variant="outlined"
            onClick={() => history.push('/public')}
            style={{
                borderRadius: '12px',
                padding: '10px 18px',
                fontWeight: 'bold',
                borderColor: '#cbd5e1',
                color: '#1e293b'
            }}
        >
            ← Voltar
        </Button>

        <Typography
            variant="h5"
            fontWeight="900"
            color="#1e293b"
        >
            ⚽ Fazer Aposta
        </Typography>

        <Button
            variant="contained"
            onClick={() => history.push('/public/meus-palpites')}
            style={{
                borderRadius: '12px',
                padding: '10px 18px',
                fontWeight: 'bold',
                background: 'linear-gradient(135deg,#2563eb,#1d4ed8)',
                boxShadow: '0 6px 18px rgba(37,99,235,0.25)'
            }}
        >
            🎟️ Meus Bilhetes
        </Button>
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
                                
                                return (
                                    <Grid item xs={12} sm={5} md={4} key={rodada.id}>
                                        <Card style={{ height: '100%', display: 'flex', flexDirection: 'column', justifyContent: 'between', borderRadius: '16px', boxShadow: '0 4px 20px rgba(0,0,0,0.05)', border: eCampeao ? '2px solid #fbbf24' : 'none', backgroundColor: '#1e293b', color: 'white' }}>
                                            <CardContent style={{ textAlign: 'center', flexGrow: 1, padding: '25px' }}>
                                                <Box mb={2} display="flex" justifyContent="center">
                                                    {eCampeao ? <Stars style={{ fontSize: 50, color: '#fbbf24' }} /> : eCopa ? <Public style={{ fontSize: 50, color: '#3b82f6' }} /> : <SportsSoccer style={{ fontSize: 50, color: '#10b981' }} />}
                                                </Box>
                                                <Typography
    variant="h5"
    fontWeight="900"
    style={{
        color: '#ffffff',
        marginTop: '10px',
        lineHeight: 1.2
    }}
>
    {rodada.nome}
</Typography>
                                                
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
                    <Paper 
    style={{ 
        padding: '30px',
        borderRadius: '24px',
        background: '#ffffff',
        boxShadow: '0 10px 40px rgba(15,23,42,0.08)',
        border: '1px solid #e2e8f0'
    }}
>
                        <Box
    display="flex"
    justifyContent="space-between"
    alignItems="center"
    mb={4}
    flexWrap="wrap"
    gap={2}
    style={{
        background: 'linear-gradient(135deg,#1e293b,#334155)',
        borderRadius: '18px',
        padding: '18px 22px'
    }}
>
    <Box>
        <Typography
            variant="overline"
            style={{
                color: '#94a3b8',
                fontWeight: 'bold',
                letterSpacing: 1
            }}
        >
            RODADA ATIVA
        </Typography>

        <Typography
            variant="h5"
            style={{
                color: '#ffffff',
                fontWeight: 900
            }}
        >
            {rodadaAtiva.nome}
        </Typography>
    </Box>

    <Box
        style={{
            background: '#10b981',
            color: '#fff',
            padding: '10px 16px',
            borderRadius: '14px',
            fontWeight: 'bold',
            fontSize: '18px',
            boxShadow: '0 4px 15px rgba(16,185,129,0.25)'
        }}
    >
        {Number(rodadaAtiva.preco).toLocaleString('pt-BR', {
            style: 'currency',
            currency: 'BRL'
        })}
    </Box>
</Box>

                        {jogos.map((jogo) => (
                            <Box key={jogo.id} mb={3} p={2} style={{ border: '1px solid #e2e8f0', borderRadius: '12px', background: 'linear-gradient(180deg,#ffffff,#f8fafc)',
boxShadow: '0 6px 20px rgba(15,23,42,0.06)',
transition: '0.2s ease' }}>
                                <Grid container alignItems="center" justifyContent="center" spacing={1}>
                                    
                                    <Grid item xs={4} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
                                        <Box display="flex" alignItems="center" gap={1}>
                                            <img src={jogo.logo_casa || "/media/escudos-times/default.png"} alt="casa" style={{ width: 40, height: 40, objectFit: 'contain' }} />
                                            <Typography fontWeight="900" fontSize="18px" color="#1e293b">{jogo.sigla_casa}</Typography>
                                        </Box>
                                        <Typography variant="caption" color="#64748b" fontWeight="bold" style={{ marginTop: '4px', textAlign: 'center', lineHeight: 1 }}>{jogo.time_casa}</Typography>
                                    </Grid>
                                    
                                    <Grid item xs={4} display="flex" justifyContent="center" alignItems="center" gap={1}>
                                        <input 
                                            type="text"
                                            inputMode="numeric"
                                            pattern="[0-9]*"
                                            value={palpitesPlacares[jogo.id]?.casa ?? ''}
                                            onChange={(e) => handlePlacarChange(jogo.id, 'casa', e.target.value)}
                                            style={{
    width: '56px',
    height: '56px',
    textAlign: 'center',
    fontSize: '22px',
    fontWeight: '900',
    borderRadius: '14px',
    border: '2px solid #dbeafe',
    backgroundColor: '#f8fbff',
    color: '#1e293b',
    outline: 'none',
    boxShadow: '0 2px 10px rgba(37,99,235,0.08)'
}}
                                            />
                                        <Typography color="#94a3b8" fontWeight="900" fontSize="16px">X</Typography>
                                        <input 
                                            type="text"
                                            inputMode="numeric"
                                            pattern="[0-9]*"
                                            value={palpitesPlacares[jogo.id]?.visitante ?? ''}
                                            onChange={(e) => handlePlacarChange(jogo.id, 'visitante', e.target.value)}
                                            style={{
    width: '56px',
    height: '56px',
    textAlign: 'center',
    fontSize: '22px',
    fontWeight: '900',
    borderRadius: '14px',
    border: '2px solid #dbeafe',
    backgroundColor: '#f8fbff',
    color: '#1e293b',
    outline: 'none',
    boxShadow: '0 2px 10px rgba(37,99,235,0.08)'
}}
                                        />
                                    </Grid>

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
                                style={{ width: '100%', padding: '14px', fontSize: '18px', border: 'none', background: 'linear-gradient(135deg,#10b981,#059669)',
borderRadius: '14px',
fontWeight: '900',
boxShadow: '0 10px 20px rgba(16,185,129,0.3)', color: 'white' }} 
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

        {/* Countdown Escuro e Elegante */}
        <Box mb={4} p={3} style={{ backgroundColor: '#0f172a', color: '#ffffff', borderRadius: '12px', border: '1px solid #334155' }}>
            <Typography variant="caption" style={{ color: '#fbbf24', fontWeight: 'bold' }}>TEMPO PARA O INÍCIO</Typography>
            <Box display="flex" justifyContent="center" gap={3} mt={2}>
                {[{l:'DIAS', v:tempoRestante.dias}, {l:'HRS', v:tempoRestante.horas}, {l:'MIN', v:tempoRestante.minutos}].map(i => (
                    <Box key={i.l}><Typography variant="h4" fontWeight="900" color="#fbbf24">{i.v}</Typography><Typography variant="caption" color="#94a3b8">{i.l}</Typography></Box>
                ))}
            </Box>
        </Box>

        {/* SELEÇÃO DE FAVORITOS COM TARJA */}
        <Typography variant="h6" fontWeight="bold" mt={3} mb={2} color="#b45309" style={{ backgroundColor: '#fffbeb', padding: '5px', borderRadius: '8px' }}>
            ⭐ SELEÇÕES FAVORITAS
        </Typography>
        <Grid container spacing={2} justifyContent="center" mb={4}>
            {favoritos.map((team: any) => (
                <Grid item xs={6} sm={4} md={3} key={team.id}>
                    <Box onClick={() => setSelecaoEscolhida(team.nome)} style={{ padding: '10px', border: selecaoEscolhida === team.nome ? '2px solid #fbbf24' : '1px solid #e2e8f0', borderRadius: '12px', cursor: 'pointer', backgroundColor: selecaoEscolhida === team.nome ? '#fffbeb' : '#fff', textAlign: 'center' }}>
                        <img src={team.bandeira || team.logo_url} alt={team.sigla} style={{ width: '40px', height: '28px', objectFit: 'cover', borderRadius: '2px', marginBottom: '5px' }} />
                        <Typography variant="body2" fontWeight={selecaoEscolhida === team.nome ? "bold" : "normal"}>{team.nome}</Typography>
                    </Box>
                </Grid>
            ))}
        </Grid>

        {/* SELEÇÃO DO RESTANTE COM TARJA */}
        <Typography variant="h6" fontWeight="bold" mt={3} mb={2} color="#475569" style={{ backgroundColor: '#f1f5f9', padding: '5px', borderRadius: '8px' }}>
            🌍 OUTRAS SELEÇÕES
        </Typography>
        <Grid container spacing={2} justifyContent="center" mb={4}>
            {outrasSelecoes.map((team: any) => (
                <Grid item xs={6} sm={4} md={3} key={team.id}>
                    <Box onClick={() => setSelecaoEscolhida(team.nome)} style={{ padding: '10px', border: selecaoEscolhida === team.nome ? '2px solid #3b82f6' : '1px solid #e2e8f0', borderRadius: '12px', cursor: 'pointer', backgroundColor: selecaoEscolhida === team.nome ? '#eff6ff' : '#fff', textAlign: 'center' }}>
                        <img src={team.bandeira || team.logo_url} alt={team.sigla} style={{ width: '40px', height: '28px', objectFit: 'cover', borderRadius: '2px', marginBottom: '5px' }} />
                        <Typography variant="body2" fontWeight={selecaoEscolhida === team.nome ? "bold" : "normal"}>{team.nome}</Typography>
                    </Box>
                </Grid>
            ))}
        </Grid>

        <Box mt={4}>
            <AppButton 
                label={enviandoAposta ? "Gerando Pix..." : `Confirmar Aposta (R$ ${Number(rodadaAtiva.preco).toFixed(2).replace('.',',')})`} 
                disabled={enviandoAposta || tempoRestante.expirado}
                onClick={submeterApostaCampeao} 
                style={{ width: '100%', padding: '14px', fontSize: '18px', border: 'none', background: 'linear-gradient(135deg,#10b981,#059669)',
borderRadius: '16px',
fontWeight: '900',
boxShadow: '0 10px 25px rgba(16,185,129,0.3)', color: 'white' }} 
            />
        </Box>
    </Paper>
)}
<Dialog
    open={modalPixAberto}
    onClose={() => setModalPixAberto(false)}
    maxWidth="xs"
    fullWidth
>
    <DialogTitle
        style={{
            fontWeight: 900,
            textAlign: 'center',
            color: '#1e293b'
        }}
    >
        Pagamento via PIX

        <IconButton
            onClick={() => setModalPixAberto(false)}
            style={{
                position: 'absolute',
                right: 10,
                top: 10
            }}
        >
            <CloseIcon />
        </IconButton>
    </DialogTitle>

    <DialogContent>
        {pixData && (
            <Box textAlign="center">

                <Typography
                    variant="body2"
                    color="#64748b"
                    mb={2}
                >
                    Escaneie o QRCode abaixo para finalizar sua aposta
                </Typography>

                <img
                    src={`data:image/png;base64,${pixData.qr_code_base64}`}
                    alt="QR Code PIX"
                    style={{
                        width: '220px',
                        maxWidth: '100%',
                        borderRadius: '12px',
                        marginBottom: '20px'
                    }}
                />

                <TextField
                    fullWidth
                    multiline
                    value={pixData.pix_copia_cola}
                    variant="outlined"
                    label="PIX Copia e Cola"
                />

                <Button
                    fullWidth
                    variant="contained"
                    onClick={() => {
                        navigator.clipboard.writeText(
                            pixData.pix_copia_cola
                        );

                        alert('PIX copiado!');
                    }}
                    style={{
                        marginTop: '15px',
                        background:
                            'linear-gradient(135deg,#10b981,#059669)',
                        color: '#fff',
                        fontWeight: 'bold',
                        borderRadius: '12px',
                        padding: '12px'
                    }}
                >
                    COPIAR PIX
                </Button>

                <Typography
                    variant="body2"
                    mt={2}
                    color="#64748b"
                >
                    Valor:
                    <strong>
                        {' '}
                        {Number(pixData.valor).toLocaleString(
                            'pt-BR',
                            {
                                style: 'currency',
                                currency: 'BRL'
                            }
                        )}
                    </strong>
                </Typography>

            </Box>
        )}
    </DialogContent>
</Dialog>
            </Container>
        </div>
    );
}