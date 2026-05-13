import React, { useState, useEffect } from "react";
import { 
    Container, Typography, Paper, List, ListItem, ListItemText, 
    Divider, CircularProgress, Box, Dialog, DialogTitle, 
    DialogContent, Tooltip, IconButton, Fab 
} from "@mui/material";
import AppButton from "../../../../../vendors/components/Button";
import { useHistory } from "react-router-dom";
import { EmojiEvents, PictureAsPdf, MilitaryTech, Visibility, Lock, WhatsApp, Close } from "@mui/icons-material";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";

const Ranking = () => {
    const apiUrl = process.env.REACT_APP_API_URL || 'http://localhost:3001';
    
    const [aprovados, setAprovados] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [gerandoPdf, setGerandoPdf] = useState(false);
    const [usuarioLogado, setUsuarioLogado] = useState<any>(null);
    const history = useHistory();

    const [apostasBloqueadas, setApostasBloqueadas] = useState(false);
    const [modalAberto, setModalAberto] = useState(false);
    const [usuarioSelecionado, setUsuarioSelecionado] = useState<any>(null);
    const [cartelasUsuarioSecado, setCartelasUsuarioSecado] = useState<any[]>([]);

    const [mostrarBannerWpp, setMostrarBannerWpp] = useState(() => {
        return localStorage.getItem("bannerWppOculto") !== "true";
    });

    const VALOR_INSCRICAO = 25;

    useEffect(() => {
        const salvo = localStorage.getItem("usuarioLogado");
        if (salvo) setUsuarioLogado(JSON.parse(salvo));

        fetch(`${apiUrl}/ranking`)
            .then((res) => res.json())
            .then((dados) => {
                if (Array.isArray(dados)) {
                    // Sem filtro de pontos! Aparecem todos que têm bilhete aprovado.
                    setAprovados(dados);
                }
                setLoading(false);
            })
            .catch((err) => {
                console.error("Erro ao buscar ranking:", err);
                setLoading(false);
            });

        fetch(`${apiUrl}/rodadas`)
            .then(res => res.json())
            .then(data => {
                const temRodadaAberta = data.some((r: any) => r.status === 'aberta');
                setApostasBloqueadas(!temRodadaAberta);
            });
    }, [apiUrl]);

    // O Prêmio agora é calculado pelo total de BILHETES, não apenas por pessoa!
    const totalCartelasCompradas = aprovados.reduce((acc, user) => acc + Number(user.total_cartelas || 1), 0);
    const valorPremioTotal = totalCartelasCompradas * VALOR_INSCRICAO;

    const pontuacoesUnicas = aprovados
        .map(p => p.pontuacao_total)
        .filter((valor, indice, array) => array.indexOf(valor) === indice);

    const score1 = pontuacoesUnicas[0]; 
    const score2 = pontuacoesUnicas[1]; 
    const score3 = pontuacoesUnicas[2]; 

    const ganhadores1 = aprovados.filter(p => p.pontuacao_total === score1);
    const ganhadores2 = aprovados.filter(p => p.pontuacao_total === score2);
    const ganhadores3 = aprovados.filter(p => p.pontuacao_total === score3);

    const premio1PorPessoa = (valorPremioTotal * 0.60) / (ganhadores1.length || 1);
    const premio2PorPessoa = (valorPremioTotal * 0.30) / (ganhadores2.length || 1);
    const premio3PorPessoa = (valorPremioTotal * 0.10) / (ganhadores3.length || 1);

    const abrirSecador = async (usuario: any) => {
        if (!apostasBloqueadas) {
            alert("🔒 O Modo Secador só é liberado quando o Admin encerrar as apostas da rodada!");
            return;
        }

        setUsuarioSelecionado(usuario);
        try {
            const res = await fetch(`${apiUrl}/meus-palpites/${usuario.id}`);
            const dados = await res.json();
            
            // Pega apenas as cartelas aprovadas inteiras para renderizar separado
            const cartelasAprovadas = dados.filter((c: any) => c.status_pagamento === 'aprovado');
            setCartelasUsuarioSecado(cartelasAprovadas);
            setModalAberto(true);
        } catch (error) {
            alert("Erro ao buscar os palpites deste usuário.");
        }
    };

    const handleBaixarAuditoria = async () => {
        setGerandoPdf(true);
        try {
            const res = await fetch(`${apiUrl}/auditoria`);
            if (!res.ok) throw new Error("Rota não encontrada.");

            const dadosAuditoria = await res.json();
            const doc = new jsPDF();
            doc.setFontSize(18);
            doc.text("Auditoria do Bolão - Palpites Registrados", 14, 20);
            doc.setFontSize(10);
            doc.text(`Gerado em: ${new Date().toLocaleString('pt-BR')}`, 14, 28);

            const palpitesValidos = dadosAuditoria.filter((item: any) => item.status_pagamento === 'aprovado');
            doc.text(`Total de Palpites Validados: ${palpitesValidos.length}`, 14, 34);

            const palpitesPorUsuario: any = {};
            palpitesValidos.forEach((item: any) => {
                if (!palpitesPorUsuario[item.usuario_nome]) palpitesPorUsuario[item.usuario_nome] = [];
                palpitesPorUsuario[item.usuario_nome].push([
                    `Cartela #${item.cartela_id}`,
                    `${item.time_casa} x ${item.time_visitante}`,
                    `${item.palpite_casa} x ${item.palpite_visitante}`
                ]);
            });

            let startY = 45;
            Object.keys(palpitesPorUsuario).forEach((nome) => {
                doc.setFontSize(12);
                doc.text(`Participante: ${nome}`, 14, startY);
                autoTable(doc, {
                    startY: startY + 5,
                    head: [['Nº Cartela', 'Partida', 'Palpite do Usuário']],
                    body: palpitesPorUsuario[nome],
                    theme: 'grid',
                    headStyles: { fillColor: [30, 41, 59] },
                    margin: { left: 14 }
                });
                startY = (doc as any).lastAutoTable.finalY + 15;
                if (startY > 250) { doc.addPage(); startY = 20; }
            });

            doc.save("Auditoria-Bolao.pdf");
        } catch (error) {
            alert("Erro ao gerar PDF.");
        } finally {
            setGerandoPdf(false);
        }
    };

    const fecharBannerWpp = () => {
        setMostrarBannerWpp(false);
        localStorage.setItem("bannerWppOculto", "true");
    };

    const linkGrupoWpp = 'https://chat.whatsapp.com/KzLHler3sA95Bh5EuKmEs2';

    if (loading) {
        return (
            <Container maxWidth="md" style={{ textAlign: "center", marginTop: "100px" }}>
                <CircularProgress style={{ color: "#fbbf24" }} />
                <Typography style={{ color: "#1e293b", marginTop: "20px", fontWeight: "bold" }}>Calculando Ranking Oficial...</Typography>
            </Container>
        );
    }

    const todosDoPodioIds = [...ganhadores1, ...ganhadores2, ...ganhadores3].map(u => u.id);
    const restoRanking = aprovados.filter(u => !todosDoPodioIds.includes(u.id));

    return (
        <div style={{ backgroundColor: "#e2e8f0", minHeight: "100vh", padding: "40px 0", position: "relative" }}>
            <Container maxWidth="md">
                
                <Paper elevation={0} style={{ backgroundColor: "#1e293b", color: "white", padding: "30px", borderRadius: "16px", textAlign: "center", marginBottom: "20px", boxShadow: "0 10px 25px -5px rgba(0,0,0,0.2)" }}>
                    <Typography variant="h6" style={{ color: "#94a3b8", fontWeight: "bold", letterSpacing: "2px" }}>
                        PREMIAÇÃO ACUMULADA
                    </Typography>
                    <Typography variant="h2" style={{ color: "#10b981", fontWeight: "900", marginTop: "10px" }}>
                        {valorPremioTotal.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
                    </Typography>
                    <Typography variant="subtitle1" style={{ color: "#cbd5e1", marginTop: "10px" }}>
                        Disputado por {totalCartelasCompradas} bilhetes validados.
                    </Typography>
                    
                    <Box mt={3} display="flex" justifyContent="center" gap={2} flexWrap="wrap" alignItems="center">
                        <Tooltip title={apostasBloqueadas ? "Baixar todos os palpites registrados" : "A auditoria só será liberada quando encerrar a rodada de apostas."} arrow>
                            <span>
                                <AppButton 
                                    label={gerandoPdf ? "Gerando..." : "Baixar Auditoria"} 
                                    icon={apostasBloqueadas ? <PictureAsPdf style={{ marginRight: '8px' }} /> : <Lock style={{ marginRight: '8px' }} />}
                                    onClick={handleBaixarAuditoria}
                                    disabled={!apostasBloqueadas || gerandoPdf} 
                                    style={{ 
                                        backgroundColor: apostasBloqueadas ? "#3b82f6" : "#475569", 
                                        border: "none", 
                                        color: "white", 
                                        padding: "10px 20px",
                                        opacity: apostasBloqueadas ? 1 : 0.6,
                                        cursor: apostasBloqueadas ? "pointer" : "not-allowed"
                                    }}
                                />
                            </span>
                        </Tooltip>

                        <div style={{ backgroundColor: apostasBloqueadas ? "#10b981" : "#ef4444", color: "white", padding: "10px 20px", borderRadius: "8px", display: "flex", alignItems: "center", gap: "8px", fontWeight: "bold" }}>
                            {apostasBloqueadas ? <Visibility /> : <Lock />}
                            {apostasBloqueadas ? "Modo Secador Liberado" : "Secador Bloqueado"}
                        </div>
                    </Box>
                </Paper>

                {mostrarBannerWpp && (
                    <Box mb={4} style={{
                        position: 'relative',
                        background: 'linear-gradient(135deg, #1e293b 0%, #064e3b 100%)',
                        borderRadius: '16px',
                        padding: '25px 20px',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        flexWrap: 'wrap',
                        gap: '15px',
                        border: '1px solid #10b981',
                        boxShadow: '0 10px 15px -3px rgba(16, 185, 129, 0.15)'
                    }}>
                        <IconButton onClick={fecharBannerWpp} style={{ position: 'absolute', top: '5px', right: '5px', color: '#94a3b8' }} size="small">
                            <Close fontSize="small" />
                        </IconButton>

                        <div style={{ display: 'flex', alignItems: 'center', gap: '18px' }}>
                            <div style={{ backgroundColor: '#25D366', borderRadius: '50%', width: '50px', height: '50px', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 4px 6px rgba(0,0,0,0.3)' }}>
                                <WhatsApp style={{ fontSize: '30px', color: '#ffffff' }} />
                            </div>
                            <div>
                                <Typography variant="h6" style={{ color: '#ffffff', margin: 0, fontWeight: 'bold' }}>Seja um Goleador e entre no nosso grupo</Typography>
                                <Typography variant="body2" style={{ color: '#94a3b8', margin: '4px 0 0 0' }}>Avisos, ranking atualizado e mais informações no nosso grupo VIP.</Typography>
                            </div>
                        </div>

                        <button onClick={() => window.open(linkGrupoWpp, '_blank')} style={{ backgroundColor: '#25D366', color: '#ffffff', border: 'none', padding: '12px 24px', borderRadius: '8px', fontWeight: 'bold', fontSize: '15px', cursor: 'pointer', boxShadow: '0 4px 6px rgba(37, 211, 102, 0.3)' }}>
                            Entrar no Grupo
                        </button>
                    </Box>
                )}

                <Box mb={5}>
                    {ganhadores1.length > 0 && (
                        <Paper style={{ padding: "20px", borderRadius: "12px", backgroundColor: "#fffbeb", borderLeft: "6px solid #fbbf24", marginBottom: "15px" }}>
                            <Typography variant="subtitle2" style={{ color: "#b45309", fontWeight: "bold", marginBottom: "10px", display: "flex", alignItems: "center", gap: "5px" }}>
                                <EmojiEvents style={{ color: "#fbbf24" }} /> 1º Lugar (60%) 
                            </Typography>
                            {ganhadores1.map(g => (
                                <div key={g.id} onClick={() => abrirSecador(g)} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "10px", borderBottom: "1px dashed #fcd34d", paddingBottom: "10px", cursor: "pointer" }}>
                                    <Typography variant="h6" style={{ fontWeight: "900", color: "#1e293b", display: "flex", alignItems: "center", gap: "8px" }}>
                                        {g.nome} 
                                        {g.total_cartelas > 1 && (
                                            <span style={{ fontSize: '11px', backgroundColor: '#fcd34d', color: '#92400e', padding: '2px 8px', borderRadius: '10px' }}>
                                                x{g.total_cartelas} Bilhetes
                                            </span>
                                        )}
                                        <Visibility style={{ fontSize: "16px", color: "#94a3b8" }} />
                                    </Typography>
                                    <div style={{ textAlign: "right" }}>
                                        <Typography style={{ fontWeight: "900", color: "#d97706" }}>{g.pontuacao_total} pts</Typography>
                                        <Typography variant="caption" style={{ color: "#047857", fontWeight: "bold", backgroundColor: "#d1fae5", padding: "4px 8px", borderRadius: "4px" }}>{premio1PorPessoa.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}</Typography>
                                    </div>
                                </div>
                            ))}
                        </Paper>
                    )}

                    {ganhadores2.length > 0 && (
                        <Paper style={{ padding: "20px", borderRadius: "12px", backgroundColor: "#f1f5f9", borderLeft: "6px solid #94a3b8", marginBottom: "15px" }}>
                            <Typography variant="subtitle2" style={{ color: "#475569", fontWeight: "bold", marginBottom: "10px", display: "flex", alignItems: "center", gap: "5px" }}>
                                <MilitaryTech style={{ color: "#94a3b8" }} /> 2º Lugar (30%)
                            </Typography>
                            {ganhadores2.map(g => (
                                <div key={g.id} onClick={() => abrirSecador(g)} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "10px", borderBottom: "1px dashed #cbd5e1", paddingBottom: "10px", cursor: "pointer" }}>
                                    <Typography variant="h6" style={{ fontWeight: "bold", color: "#1e293b", display: "flex", alignItems: "center", gap: "8px" }}>
                                        {g.nome} 
                                        {g.total_cartelas > 1 && (
                                            <span style={{ fontSize: '11px', backgroundColor: '#cbd5e1', color: '#334155', padding: '2px 8px', borderRadius: '10px' }}>
                                                x{g.total_cartelas} Bilhetes
                                            </span>
                                        )}
                                        <Visibility style={{ fontSize: "16px", color: "#94a3b8" }} />
                                    </Typography>
                                    <div style={{ textAlign: "right" }}>
                                        <Typography style={{ fontWeight: "900", color: "#64748b" }}>{g.pontuacao_total} pts</Typography>
                                        <Typography variant="caption" style={{ color: "#047857", fontWeight: "bold", backgroundColor: "#d1fae5", padding: "4px 8px", borderRadius: "4px" }}>{premio2PorPessoa.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}</Typography>
                                    </div>
                                </div>
                            ))}
                        </Paper>
                    )}

                    {ganhadores3.length > 0 && (
                        <Paper style={{ padding: "20px", borderRadius: "12px", backgroundColor: "#fef2f2", borderLeft: "6px solid #b45309", marginBottom: "15px" }}>
                            <Typography variant="subtitle2" style={{ color: "#9a3412", fontWeight: "bold", marginBottom: "10px", display: "flex", alignItems: "center", gap: "5px" }}>
                                <MilitaryTech style={{ color: "#b45309" }} /> 3º Lugar (10%)
                            </Typography>
                            {ganhadores3.map(g => (
                                <div key={g.id} onClick={() => abrirSecador(g)} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "10px", borderBottom: "1px dashed #fed7aa", paddingBottom: "10px", cursor: "pointer" }}>
                                    <Typography variant="h6" style={{ fontWeight: "bold", color: "#1e293b", display: "flex", alignItems: "center", gap: "8px" }}>
                                        {g.nome} 
                                        {g.total_cartelas > 1 && (
                                            <span style={{ fontSize: '11px', backgroundColor: '#fed7aa', color: '#9a3412', padding: '2px 8px', borderRadius: '10px' }}>
                                                x{g.total_cartelas} Bilhetes
                                            </span>
                                        )}
                                        <Visibility style={{ fontSize: "16px", color: "#94a3b8" }} />
                                    </Typography>
                                    <div style={{ textAlign: "right" }}>
                                        <Typography style={{ fontWeight: "900", color: "#9a3412" }}>{g.pontuacao_total} pts</Typography>
                                        <Typography variant="caption" style={{ color: "#047857", fontWeight: "bold", backgroundColor: "#d1fae5", padding: "4px 8px", borderRadius: "4px" }}>{premio3PorPessoa.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}</Typography>
                                    </div>
                                </div>
                            ))}
                        </Paper>
                    )}
                </Box>

                {restoRanking.length > 0 && (
                    <Paper elevation={2} style={{ padding: "10px", borderRadius: "16px", backgroundColor: "white" }}>
                        <List>
                            {restoRanking.map((participant, index) => (
                                <React.Fragment key={index}>
                                    <ListItem onClick={() => abrirSecador(participant)} style={{ padding: "15px", cursor: "pointer" }}>
                                        <div style={{ display: "flex", alignItems: "center", width: "100%" }}>
                                            <Typography style={{ fontWeight: "900", color: "#94a3b8", width: "40px" }}>#</Typography>
                                            <ListItemText primary={
                                                <span style={{ display: "flex", alignItems: "center", gap: "8px", fontWeight: "bold", color: "#334155" }}>
                                                    {participant.nome} 
                                                    {participant.total_cartelas > 1 && (
                                                        <span style={{ fontSize: '10px', backgroundColor: '#f1f5f9', color: '#64748b', padding: '2px 6px', borderRadius: '10px' }}>
                                                            x{participant.total_cartelas} Bilhetes
                                                        </span>
                                                    )}
                                                    <Visibility style={{ fontSize: "16px", color: "#cbd5e1" }} />
                                                </span>
                                            } />
                                            <Typography style={{ fontWeight: "900", color: "#1e293b" }}>{participant.pontuacao_total} pts</Typography>
                                        </div>
                                    </ListItem>
                                    {index < restoRanking.length - 1 && <Divider />}
                                </React.Fragment>
                            ))}
                        </List>
                    </Paper>
                )}

                <Box mt={4} display="flex" gap={2} justifyContent="center" flexWrap="wrap">
                    <AppButton style={{ width: "200px", padding: "12px", backgroundColor: "#f97316", border: "none" }} label="Meus Palpites" onClick={() => history.push("/public/placar")} />
                    <AppButton style={{ width: "200px", padding: "12px", backgroundColor: "#64748b", border: "none" }} label="Voltar à Home" onClick={() => history.push("/public")} />
                </Box>

                <Dialog open={modalAberto} onClose={() => setModalAberto(false)} fullWidth maxWidth="md" PaperProps={{ style: { borderRadius: "16px", backgroundColor: "#f8fafc" } }}>
                    <DialogTitle style={{ backgroundColor: "#1e293b", color: "white", display: "flex", justifyContent: "space-between", alignItems: "center", padding: "20px" }}>
                        <span style={{ fontWeight: "bold", color: "white" }}>🔍 Secador: Palpites de {usuarioSelecionado?.nome}</span>
                        <AppButton label="X" onClick={() => setModalAberto(false)} style={{ background: "rgba(255,255,255,0.1)", border: "none", color: "white", padding: "5px 15px", minWidth: "auto" }} />
                    </DialogTitle>
                    <DialogContent style={{ padding: "20px" }}>
                        {cartelasUsuarioSecado.length === 0 ? (
                            <Typography style={{ textAlign: "center", color: "#64748b", padding: "30px 0" }}>Nenhum bilhete validado encontrado.</Typography>
                        ) : (
                            cartelasUsuarioSecado.map((cartela, index) => (
                                <Box key={cartela.cartela_id} mb={4} p={3} style={{ backgroundColor: '#e2e8f0', borderRadius: '16px', border: '2px solid #cbd5e1' }}>
                                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px', borderBottom: '2px dashed #94a3b8', paddingBottom: '10px' }}>
                                        <Typography variant="h6" style={{ fontWeight: "900", color: "#1e293b" }}>
                                            🎟️ Bilhete #{cartela.cartela_id}
                                        </Typography>
                                        <Typography style={{ fontWeight: "bold", color: "#059669", backgroundColor: "#d1fae5", padding: "4px 12px", borderRadius: "8px" }}>
                                            Total: {cartela.total_pontos} pts
                                        </Typography>
                                    </div>
                                    
                                    {cartela.palpites.map((p: any, i: number) => {
                                        const jogoFinalizado = p.gols_casa !== null && p.gols_visitante !== null;
                                        return (
                                            <div key={i} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', backgroundColor: 'white', padding: '15px', borderRadius: '12px', marginBottom: '10px', boxShadow: '0 4px 6px rgba(0,0,0,0.05)' }}>
                                                <div style={{ textAlign: 'center', width: '60px' }}>
                                                    <img src={p.logo_casa || "/media/escudos-times/default.png"} alt="casa" style={{ width: '40px', height: '40px', objectFit: 'contain' }} />
                                                    <div style={{ fontSize: '13px', fontWeight: 'bold', color: "#1e293b", marginTop: "5px" }}>{p.sigla_casa}</div>
                                                </div>
                                                
                                                <div style={{ textAlign: "center", display: "flex", flexDirection: "column", alignItems: "center" }}>
                                                    <div style={{ fontSize: '22px', fontWeight: '900', backgroundColor: '#f1f5f9', padding: '8px 24px', borderRadius: '8px', border: "1px solid #e2e8f0", color: "#1e293b", display: "flex", alignItems: "center", gap: "10px" }}>
                                                        {p.palpite_casa} <span style={{ color: "#94a3b8", fontSize: "16px" }}>X</span> {p.palpite_visitante}
                                                    </div>
                                                    {jogoFinalizado && (
                                                        <div style={{ fontSize: "13px", color: "#059669", fontWeight: "bold", marginTop: "8px", backgroundColor: "#a7f3d0", padding: "4px 12px", borderRadius: "10px" }}>
                                                            +{p.pontos_ganhos} pts
                                                        </div>
                                                    )}
                                                </div>

                                                <div style={{ textAlign: 'center', width: '60px' }}>
                                                    <img src={p.logo_visitante || "/media/escudos-times/default.png"} alt="visitante" style={{ width: '40px', height: '40px', objectFit: 'contain' }} />
                                                    <div style={{ fontSize: '13px', fontWeight: 'bold', color: "#1e293b", marginTop: "5px" }}>{p.sigla_visitante}</div>
                                                </div>
                                            </div>
                                        );
                                    })}
                                </Box>
                            ))
                        )}
                    </DialogContent>
                </Dialog>
            </Container>

            {!mostrarBannerWpp && (
                <Fab 
                    color="success" aria-label="whatsapp" onClick={() => window.open(linkGrupoWpp, '_blank')}
                    style={{ position: 'fixed', bottom: '30px', right: '30px', backgroundColor: '#25D366', color: 'white', boxShadow: '0 4px 10px rgba(37, 211, 102, 0.4)' }}
                >
                    <WhatsApp style={{ fontSize: '30px' }} />
                </Fab>
            )}
        </div>
    );
};

export default Ranking;