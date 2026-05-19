import React, { useState, useEffect } from "react";
import { 
    Container, Typography, Paper, List, ListItem, ListItemText, 
    Divider, CircularProgress, Box, Dialog, DialogTitle, 
    DialogContent, Tooltip, IconButton, Fab, MenuItem, TextField 
} from "@mui/material";
import AppButton from "../../../../../vendors/components/Button";
import { useHistory } from "react-router-dom";
import { EmojiEvents, PictureAsPdf, MilitaryTech, Visibility, Lock, WhatsApp, Close, Checkroom } from "@mui/icons-material";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";

const Ranking = () => {
    const apiUrl = process.env.REACT_APP_API_URL || 'http://localhost:3001';
    const history = useHistory();
    
    const [listaRodadas, setListaRodadas] = useState<any[]>([]);
    const [rodadaAtual, setRodadaAtual] = useState<any>(null);
    const [aprovados, setAprovados] = useState<any[]>([]); 
    const [loading, setLoading] = useState(true);
    const [gerandoPdf, setGerandoPdf] = useState(false);
    const [usuarioLogado, setUsuarioLogado] = useState<any>(null);
    
    const [statusJogos, setStatusJogos] = useState({ finalizados: 0, total: 0 });
    const [modalAberto, setModalAberto] = useState(false);
    const [cartelaSelecionada, setCartelaSelecionada] = useState<any>(null);
    const [palpitesSecador, setPalpitesSecador] = useState<any[]>([]);

    const [mostrarBannerWpp, setMostrarBannerWpp] = useState(() => localStorage.getItem("bannerWppOculto") !== "true");
    const [mostrarBannerPremio, setMostrarBannerPremio] = useState(() => localStorage.getItem("bannerPremioOculto") !== "true");

    const VALOR_INSCRICAO = 20;

    const mascararTelefone = (tel: string) => {
        if (!tel) return "Não Informado";
        const limpo = tel.replace(/\D/g, "");
        if (limpo.length === 11) {
            return `(${limpo.substring(0, 2)}) ${limpo.substring(2, 3)}****-${limpo.substring(7)}`;
        }
        return tel;
    };

    const carregarDadosRodada = (rodada: any) => {
        if (!rodada) return;
        setLoading(true);
        
        Promise.all([
            fetch(`${apiUrl}/ranking`).then(res => res.json()),
            fetch(`${apiUrl}/jogos?rodada_id=${rodada.id}`).then(res => res.json())
        ]).then(([rankData, jogosData]) => {
            if (Array.isArray(rankData)) {
                const rankDaRodada = rankData.filter((r: any) => r.rodada_id === rodada.id);
                rankDaRodada.sort((a, b) => b.pontuacao_total - a.pontuacao_total);
                setAprovados(rankDaRodada);
            }
            if (Array.isArray(jogosData)) {
                const jogosFinalizados = jogosData.filter((j: any) => j.gols_casa !== null && j.gols_visitante !== null).length;
                setStatusJogos({ finalizados: jogosFinalizados, total: jogosData.length });
            }
            setLoading(false);
        }).catch(err => {
            console.error(err);
            setLoading(false);
        });
    };

    useEffect(() => {
        const salvo = localStorage.getItem("usuarioLogado");
        if (salvo) setUsuarioLogado(JSON.parse(salvo));

        fetch(`${apiUrl}/rodadas`)
            .then(res => res.json())
            .then(rodadasData => {
                const exibiveis = rodadasData.filter((r: any) => r.status !== 'arquivada');
                setListaRodadas(exibiveis);

                if (exibiveis.length > 0) {
                    let ativa = exibiveis.find((r: any) => r.exibir_no_ranking === true);
                    if (!ativa) ativa = exibiveis.find((r: any) => r.status === 'aberta' || r.status === 'pausada');
                    if (!ativa) ativa = exibiveis[0];

                    setRodadaAtual(ativa);
                    carregarDadosRodada(ativa);
                } else {
                    setLoading(false);
                }
            }).catch(() => setLoading(false));
    }, [apiUrl]);

    const handleMudarRodada = (id: number) => {
        const rodada = listaRodadas.find(r => r.id === id);
        if (rodada) {
            setRodadaAtual(rodada);
            carregarDadosRodada(rodada);
        }
    };

    const totalCartelasCompradas = aprovados.length;
    const valorArrecadadoTotal = totalCartelasCompradas * (rodadaAtual?.preco || VALOR_INSCRICAO);
    const valorPremioTotal = valorArrecadadoTotal * 0.90;
    const mostrarPodio = statusJogos.finalizados > 0;

    const pontuacoesUnicas = aprovados
        .map(p => Number(p.pontuacao_total))
        .filter((valor, indice, array) => array.indexOf(valor) === indice)
        .sort((a, b) => b - a);

    const score1 = pontuacoesUnicas[0];
    const score2 = pontuacoesUnicas[1];
    const score3 = pontuacoesUnicas[2];

    const ganhadores1 = mostrarPodio ? aprovados.filter(p => Number(p.pontuacao_total) === score1) : [];
    const ganhadores2 = mostrarPodio ? aprovados.filter(p => Number(p.pontuacao_total) === score2) : [];
    const ganhadores3 = mostrarPodio ? aprovados.filter(p => Number(p.pontuacao_total) === score3) : [];
    
    const todosDoPodioIds = [...ganhadores1, ...ganhadores2, ...ganhadores3].map(u => u.cartela_id);
    const restoRanking = mostrarPodio ? aprovados.filter(u => !todosDoPodioIds.includes(u.cartela_id)) : [...aprovados];

    const premio1PorPessoa = (valorPremioTotal * 0.60) / (ganhadores1.length || 1);
    const premio2PorPessoa = (valorPremioTotal * 0.30) / (ganhadores2.length || 1);
    const premio3PorPessoa = (valorPremioTotal * 0.10) / (ganhadores3.length || 1);

    const modoSecadorLiberado = rodadaAtual?.status === 'pausada' || rodadaAtual?.status === 'finalizada';

    const abrirSecador = async (itemRanking: any) => {
        if (!modoSecadorLiberado) {
            alert("🔒 O Modo Secador só é liberado quando o mercado de apostas for pausado pelo administrador!");
            return;
        }
        setCartelaSelecionada(itemRanking);
        try {
            const res = await fetch(`${apiUrl}/meus-palpites/${itemRanking.usuario_id}`);
            const dados = await res.json();
            const bilheteEspecifico = dados.find((c: any) => c.cartela_id === itemRanking.cartela_id);
            setPalpitesSecador(bilheteEspecifico ? bilheteEspecifico.palpites : []);
            setModalAberto(true);
        } catch {
            alert("Erro ao buscar registros.");
        }
    };

    const handleBaixarAuditoria = async () => {
        setGerandoPdf(true);
        try {
            const res = await fetch(`${apiUrl}/auditoria`);
            const dadosAuditoria = await res.json();
            const idsAprovadosNaTela = aprovados.map(a => a.cartela_id);
            const palpitesValidos = dadosAuditoria.filter((item: any) => idsAprovadosNaTela.includes(item.cartela_id));

            const doc = new jsPDF();
            doc.setFontSize(16);
            doc.text(`Auditoria Oficial - ${rodadaAtual?.nome}`, 14, 20);
            
            const mapaParticipantes: any = {};
            palpitesValidos.forEach((item: any) => {
                const chave = `${item.usuario_nome} (${mascararTelefone(item.telefone)})`;
                if (!mapaParticipantes[chave]) mapaParticipantes[chave] = [];
                mapaParticipantes[chave].push([
                    `Bilhete #${item.numero_bilhete || item.cartela_id}`,
                    item.palpite_texto ? `Escolha: ${item.palpite_texto}` : `${item.time_casa} x ${item.time_visitante}`,
                    item.palpite_texto ? 'Aposta Direta' : `${item.palpite_casa} x ${item.palpite_visitante}`
                ]);
            });

            let y = 35;
            Object.keys(mapaParticipantes).forEach(p => {
                if (y > 250) { doc.addPage(); y = 20; }
                doc.setFontSize(11);
                doc.text(p, 14, y);
                autoTable(doc, {
                    startY: y + 3,
                    head: [['Referência', 'Confronto/Evento', 'Palpite']],
                    body: mapaParticipantes[p],
                    theme: 'grid',
                    headStyles: { fillColor: [30, 41, 59] }
                });
                y = (doc as any).lastAutoTable.finalY + 10;
            });

            doc.save(`Auditoria-${rodadaAtual?.nome}.pdf`);
        } catch {
            alert("Erro ao gerar relatório.");
        } finally {
            setGerandoPdf(false);
        }
    };

    if (loading) {
        return (
            <Container maxWidth="md" style={{ textAlign: "center", marginTop: "100px" }}>
                <CircularProgress style={{ color: "#fbbf24" }} />
                <Typography style={{ marginTop: "20px", fontWeight: "bold" }}>Sincronizando Parciais...</Typography>
            </Container>
        );
    }

    return (
        <div style={{ backgroundColor: "#e2e8f0", minHeight: "100vh", padding: "40px 0" }}>
            <Container maxWidth="md">
                
                {/* SELETOR DE RANKINGS (DROPBOX FLUIDO) */}
                {listaRodadas.length > 1 && (
                    <Box mb={3} display="flex" justifyContent="center">
                        <TextField
                            select
                            label="Visualizar Outro Ranking"
                            value={rodadaAtual?.id || ''}
                            onChange={(e) => handleMudarRodada(Number(e.target.value))}
                            style={{ width: '100%', maxWidth: '400px', backgroundColor: 'white', borderRadius: '8px' }}
                            variant="outlined"
                        >
                            {listaRodadas.map((r) => (
                                <MenuItem key={r.id} value={r.id}>
                                    {r.nome} {r.status === 'pausada' ? '⏱️ (Em Andamento)' : ''}
                                </MenuItem>
                            ))}
                        </TextField>
                    </Box>
                )}

                {/* BANNER PRINCIPAL */}
                <Paper style={{ backgroundColor: "#1e293b", color: "white", padding: "30px", borderRadius: "16px", textAlign: "center", marginBottom: "20px" }}>
                    <Typography style={{ color: "#fcd34d", fontWeight: "bold", fontSize: "14px", marginBottom: "10px" }}>
                        EVENTO ATUAL: {rodadaAtual?.nome?.toUpperCase()}
                    </Typography>
                    
                    <Box display="inline-block" px={2} py={0.5} borderRadius={2} mb={2} style={{ backgroundColor: rodadaAtual?.status === 'pausada' ? '#3b82f6' : '#10b981', fontWeight: "bold", fontSize: "12px" }}>
                        {rodadaAtual?.status === 'pausada' ? `🔄 PARCIAL (${statusJogos.finalizados}/${statusJogos.total} JOGOS)` : '🟢 MERCADO ABERTO'}
                    </Box>

                    <Typography variant="h6" style={{ color: "#94a3b8", fontWeight: "bold", letterSpacing: "1px" }}>PRÊMIO ACUMULADO (90%)</Typography>
                    
                    {/* Linha que estava dando erro foi corrigida aqui (margin: '8px 0') */}
                    <Typography variant="h2" style={{ color: "#10b981", fontWeight: "900", margin: "8px 0" }}>
                        {valorPremioTotal.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
                    </Typography>
                    
                    <Box mt={3} display="flex" justifyContent="center" gap={2} flexWrap="wrap">
                        <AppButton 
                            label={gerandoPdf ? "Processando..." : "Baixar Auditoria"} 
                            onClick={handleBaixarAuditoria}
                            disabled={!modoSecadorLiberado || gerandoPdf}
                            style={{ backgroundColor: modoSecadorLiberado ? "#3b82f6" : "#475569", border: "none" }}
                        />
                        <div style={{ backgroundColor: modoSecadorLiberado ? "#10b981" : "#ef4444", color: "white", padding: "10px 20px", borderRadius: "8px", fontWeight: "bold", display: "flex", alignItems: "center", gap: "5px" }}>
                            {modoSecadorLiberado ? <Visibility /> : <Lock />} {modoSecadorLiberado ? "Secador Liberado" : "Secador Bloqueado"}
                        </div>
                    </Box>
                </Paper>

                {/* BANNERS ADICIONAIS */}
                {mostrarBannerPremio && (
                    <Box mb={3} style={{ position: 'relative', background: 'linear-gradient(135deg, #f59e0b 0%, #d97706 100%)', borderRadius: '12px', padding: '20px', color: 'white', display: 'flex', alignItems: 'center', gap: '15px' }}>
                        <IconButton onClick={() => setMostrarBannerPremio(false)} style={{ position: 'absolute', top: 5, right: 5, color: 'white' }} size="small"><Close fontSize="small"/></IconButton>
                        <Checkroom style={{ fontSize: 40 }} />
                        <Typography variant="body1" fontWeight="bold">👕 Prêmio Extra: O primeiro lugar isolado garante uma Camisa Oficial de Futebol!</Typography>
                    </Box>
                )}

                {/* VISUAL LAYOUT ANTIGO: OS BOXES DE PÓDIO */}
                <Box mb={4}>
                    {mostrarPodio && ganhadores1.length > 0 && (
                        <Paper style={{ padding: "20px", borderRadius: "12px", backgroundColor: "#fffbeb", borderLeft: "6px solid #fbbf24", marginBottom: "15px" }}>
                            <Typography variant="subtitle2" style={{ color: "#b45309", fontWeight: "bold", display: "flex", alignItems: "center", gap: "5px", marginBottom: "10px" }}>
                                <EmojiEvents /> 1º Lugar (60%)
                            </Typography>
                            {ganhadores1.map(g => (
                                <div key={g.cartela_id} onClick={() => abrirSecador(g)} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", cursor: "pointer", borderBottom: "1px dashed #fcd34d", paddingBottom: "8px", marginBottom: "8px" }}>
                                    <Typography variant="h6" fontWeight="900" color="#1e293b">{g.nome} <span style={{ fontSize: 11, backgroundColor: '#fde68a', padding: '2px 6px', borderRadius: 4 }}>#{g.numero_bilhete || g.cartela_id}</span></Typography>
                                    <div style={{ textAlign: "right" }}>
                                        <Typography fontWeight="900" color="#d97706">{g.pontuacao_total} pts</Typography>
                                        <Typography variant="caption" style={{ backgroundColor: "#d1fae5", color: "#047857", padding: "2px 6px", borderRadius: 4, fontWeight: "bold" }}>{premio1PorPessoa.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}</Typography>
                                    </div>
                                </div>
                            ))}
                        </Paper>
                    )}

                    {mostrarPodio && ganhadores2.length > 0 && (
                        <Paper style={{ padding: "20px", borderRadius: "12px", backgroundColor: "#f1f5f9", borderLeft: "6px solid #94a3b8", marginBottom: "15px" }}>
                            <Typography variant="subtitle2" style={{ color: "#475569", fontWeight: "bold", display: "flex", alignItems: "center", gap: "5px", marginBottom: "10px" }}>
                                <MilitaryTech /> 2º Lugar (30%)
                            </Typography>
                            {ganhadores2.map(g => (
                                <div key={g.cartela_id} onClick={() => abrirSecador(g)} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", cursor: "pointer", borderBottom: "1px dashed #cbd5e1", paddingBottom: "8px", marginBottom: "8px" }}>
                                    <Typography variant="h6" fontWeight="bold" color="#1e293b">{g.nome} <span style={{ fontSize: 11, backgroundColor: '#e2e8f0', padding: '2px 6px', borderRadius: 4 }}>#{g.numero_bilhete || g.cartela_id}</span></Typography>
                                    <div style={{ textAlign: "right" }}>
                                        <Typography fontWeight="bold" color="#475569">{g.pontuacao_total} pts</Typography>
                                        <Typography variant="caption" style={{ backgroundColor: "#d1fae5", color: "#047857", padding: "2px 6px", borderRadius: 4, fontWeight: "bold" }}>{premio2PorPessoa.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}</Typography>
                                    </div>
                                </div>
                            ))}
                        </Paper>
                    )}

                    {mostrarPodio && ganhadores3.length > 0 && (
                        <Paper style={{ padding: "20px", borderRadius: "12px", backgroundColor: "#fef2f2", borderLeft: "6px solid #b45309", marginBottom: "15px" }}>
                            <Typography variant="subtitle2" style={{ color: "#9a3412", fontWeight: "bold", display: "flex", alignItems: "center", gap: "5px", marginBottom: "10px" }}>
                                <MilitaryTech /> 3º Lugar (10%)
                            </Typography>
                            {ganhadores3.map(g => (
                                <div key={g.cartela_id} onClick={() => abrirSecador(g)} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", cursor: "pointer", borderBottom: "1px dashed #fed7aa", paddingBottom: "8px", marginBottom: "8px" }}>
                                    <Typography variant="h6" fontWeight="bold" color="#1e293b">{g.nome} <span style={{ fontSize: 11, backgroundColor: '#ffedd5', padding: '2px 6px', borderRadius: 4 }}>#{g.numero_bilhete || g.cartela_id}</span></Typography>
                                    <div style={{ textAlign: "right" }}>
                                        <Typography fontWeight="bold" color="#9a3412">{g.pontuacao_total} pts</Typography>
                                        <Typography variant="caption" style={{ backgroundColor: "#d1fae5", color: "#047857", padding: "2px 6px", borderRadius: 4, fontWeight: "bold" }}>{premio3PorPessoa.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}</Typography>
                                    </div>
                                </div>
                            ))}
                        </Paper>
                    )}
                </Box>

                {/* RESTANTE DOS PARTICIPANTES */}
                {restoRanking.length > 0 && (
                    <Paper style={{ borderRadius: "16px", backgroundColor: "white", padding: "10px" }}>
                        <List>
                            {restoRanking.map((p, i) => (
                                <React.Fragment key={p.cartela_id}>
                                    <ListItem onClick={() => abrirSecador(p)} style={{ cursor: "pointer", padding: "15px" }}>
                                        <Typography style={{ fontWeight: "bold", width: "40px", color: "#94a3b8" }}>{mostrarPodio ? `#${i + 4}` : `${i + 1}º`}</Typography>
                                        <ListItemText primary={<span style={{ fontWeight: "bold", color: "#334155", display: "flex", alignItems: "center", gap: "8px" }}>{p.nome} <span style={{ fontSize: 10, color: "#94a3b8" }}>#{p.numero_bilhete || p.cartela_id}</span> <Visibility style={{ fontSize: 14, color: "#cbd5e1" }} /></span>} />
                                        <Typography fontWeight="bold" color="#1e293b">{p.pontuacao_total} pts</Typography>
                                    </ListItem>
                                    {i < restoRanking.length - 1 && <Divider />}
                                </React.Fragment>
                            ))}
                        </List>
                    </Paper>
                )}

                {/* BOTÕES INFERIORES */}
                <Box mt={4} display="flex" gap={2} justifyContent="center">
                    <AppButton style={{ backgroundColor: "#f97316", border: "none", width: "180px" }} label="Meus Palpites" onClick={() => history.push("/public/palpites")} />
                    <AppButton style={{ backgroundColor: "#64748b", border: "none", width: "180px" }} label="Voltar" onClick={() => history.push("/public")} />
                </Box>
            </Container>

            {/* MODAL DO SECADOR */}
            <Dialog open={modalAberto} onClose={() => setModalAberto(false)} fullWidth maxWidth="sm">
                <DialogTitle style={{ backgroundColor: "#1e293b", color: "white", display: "flex", justifyContent: "space-between" }}>
                    <span style={{ color: 'white' }}>🔍 Cartela #{cartelaSelecionada?.numero_bilhete || cartelaSelecionada?.cartela_id} ({cartelaSelecionada?.nome})</span>
                    <IconButton onClick={() => setModalAberto(false)} style={{ color: 'white' }} size="small"><Close/></IconButton>
                </DialogTitle>
                <DialogContent style={{ padding: "20px" }}>
                    {palpitesSecador.map((p: any, idx: number) => (
                        <Box key={idx} display="flex" justifyContent="space-between" alignItems="center" p={2} mb={1} style={{ backgroundColor: 'white', borderRadius: 8, boxShadow: '0 2px 4px rgba(0,0,0,0.05)' }}>
                            <Box display="flex" alignItems="center" gap={1} width="35%">
                                <img src={p.logo_casa} style={{ width: 25 }} alt="" />
                                <Typography variant="body2" fontWeight="bold">{p.sigla_casa}</Typography>
                            </Box>
                            <Typography variant="h6" fontWeight="bold" style={{ backgroundColor: '#f1f5f9', padding: '4px 12px', borderRadius: 4 }}>
                                {p.palpite_casa} x {p.palpite_visitante}
                            </Typography>
                            <Box display="flex" alignItems="center" gap={1} width="35%" justifyContent="flex-end">
                                <Typography variant="body2" fontWeight="bold">{p.sigla_visitante}</Typography>
                                <img src={p.logo_visitante} style={{ width: 25 }} alt="" />
                            </Box>
                        </Box>
                    ))}
                </DialogContent>
            </Dialog>
        </div>
    );
};

export default Ranking;