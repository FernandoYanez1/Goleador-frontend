import React, { useState, useEffect } from "react";
import { 
    Container, Typography, Paper, List, ListItem, ListItemText, 
    Divider, CircularProgress, Box, Dialog, DialogTitle, 
    DialogContent, Tooltip, IconButton, Fab 
} from "@mui/material";
import AppButton from "../../../../../vendors/components/Button";
import { useHistory } from "react-router-dom";
import { EmojiEvents, PictureAsPdf, MilitaryTech, Visibility, Lock, WhatsApp, Close, Checkroom } from "@mui/icons-material";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";

const Ranking = () => {
    const apiUrl = process.env.REACT_APP_API_URL || 'http://localhost:3001';
    
    const [todasRodadas, setTodasRodadas] = useState<any[]>([]);
    const [rankingCompleto, setRankingCompleto] = useState<any[]>([]);
    const [aprovados, setAprovados] = useState<any[]>([]); 
    
    const [loading, setLoading] = useState(true);
    const [gerandoPdf, setGerandoPdf] = useState(false);
    const [usuarioLogado, setUsuarioLogado] = useState<any>(null);
    const history = useHistory();

    const [rodadaAtual, setRodadaAtual] = useState<any>(null);
    const [apostasBloqueadas, setApostasBloqueadas] = useState(false);
    const [statusJogos, setStatusJogos] = useState({ finalizados: 0, total: 0 });
    
    const [modalAberto, setModalAberto] = useState(false);
    const [cartelaSelecionada, setCartelaSelecionada] = useState<any>(null);
    const [palpitesSecador, setPalpitesSecador] = useState<any[]>([]);

    const [mostrarBannerWpp, setMostrarBannerWpp] = useState(() => {
        return localStorage.getItem("bannerWppOculto") !== "true";
    });

    const [mostrarBannerPremio, setMostrarBannerPremio] = useState(() => {
        return localStorage.getItem("bannerPremioOculto") !== "true";
    });

    const fecharBannerPremio = () => {
        setMostrarBannerPremio(false);
        localStorage.setItem("bannerPremioOculto", "true");
    };

    const VALOR_INSCRICAO = 20;

    const mascararTelefone = (tel: string) => {
        if (!tel) return "Não Informado";
        const limpo = tel.replace(/\D/g, "");
        if (limpo.length === 11) {
            return `(${limpo.substring(0, 2)}) ${limpo.substring(2, 3)}****-${limpo.substring(7)}`;
        } else if (limpo.length === 10) {
            return `(${limpo.substring(0, 2)}) ****-${limpo.substring(6)}`;
        }
        return tel;
    };

    // CARGA INICIAL DE DADOS
    useEffect(() => {
        const salvo = localStorage.getItem("usuarioLogado");
        if (salvo) setUsuarioLogado(JSON.parse(salvo));

        Promise.all([
            fetch(`${apiUrl}/rodadas`).then(res => res.json()),
            fetch(`${apiUrl}/ranking`).then(res => res.json())
        ]).then(([rodadasData, rankData]) => {
            
            if (Array.isArray(rodadasData) && rodadasData.length > 0) {
                setTodasRodadas(rodadasData);
                
                // LÓGICA INTELIGENTE: Prioriza Aberta -> Finalizada -> Rascunho
                let ativa = rodadasData.find((r: any) => r.status === 'aberta');
                if (!ativa) ativa = rodadasData.find((r: any) => r.status === 'finalizada');
                if (!ativa) ativa = rodadasData[0]; // Só pega rascunho se não tiver NENHUMA outra

                setRodadaAtual(ativa);
            }
            
            if (Array.isArray(rankData)) {
                setRankingCompleto(rankData);
            }
        }).catch(err => {
            console.error("Erro ao carregar dados iniciais:", err);
            setLoading(false);
        });
    }, [apiUrl]);

    // ATUALIZA A TELA QUANDO A RODADA MUDA NO DROPDOWN
    useEffect(() => {
        if (rodadaAtual) {
            setApostasBloqueadas(rodadaAtual.status !== 'aberta');
            
            if (rankingCompleto.length > 0) {
                const rankDaRodada = rankingCompleto.filter((r: any) => r.rodada_id === rodadaAtual.id);
                rankDaRodada.sort((a, b) => b.pontuacao_total - a.pontuacao_total);
                setAprovados(rankDaRodada);
            } else {
                setAprovados([]);
            }

            // Conta quantos jogos já terminaram na rodada selecionada
            fetch(`${apiUrl}/jogos?rodada_id=${rodadaAtual.id}`)
                .then(res => res.json())
                .then(jogosData => {
                    if (Array.isArray(jogosData)) {
                        const jogosFinalizados = jogosData.filter((j: any) => j.gols_casa !== null && j.gols_visitante !== null).length;
                        setStatusJogos({ finalizados: jogosFinalizados, total: jogosData.length });
                    }
                    setLoading(false);
                })
                .catch(() => setLoading(false));
        }
    }, [rodadaAtual, rankingCompleto, apiUrl]);

    const totalCartelasCompradas = aprovados.length;
    const valorArrecadadoTotal = totalCartelasCompradas * VALOR_INSCRICAO;
    const valorPremioTotal = valorArrecadadoTotal * 0.90;

    // REGRA DO PÓDIO: Só exibe se 1 ou mais jogos já tiverem resultado
    const mostrarPodio = statusJogos.finalizados > 0;

    const pontuacoesUnicas = aprovados
        .map(p => p.pontuacao_total)
        .filter((valor, indice, array) => array.indexOf(valor) === indice)
        .sort((a, b) => b - a);

    const score1 = pontuacoesUnicas[0]; 
    const score2 = pontuacoesUnicas[1]; 
    const score3 = pontuacoesUnicas[2]; 

    let ganhadores1: any[] = [];
    let ganhadores2: any[] = [];
    let ganhadores3: any[] = [];
    let restoRanking: any[] = [];

    if (mostrarPodio) {
        ganhadores1 = aprovados.filter(p => p.pontuacao_total === score1);
        ganhadores2 = aprovados.filter(p => p.pontuacao_total === score2);
        ganhadores3 = aprovados.filter(p => p.pontuacao_total === score3);
        
        const todosDoPodioIds = [...ganhadores1, ...ganhadores2, ...ganhadores3].map(u => u.cartela_id);
        restoRanking = aprovados.filter(u => !todosDoPodioIds.includes(u.cartela_id));
    } else {
        restoRanking = [...aprovados]; // Todo mundo vira lista de espera
    }

    const premio1PorPessoa = (valorPremioTotal * 0.60) / (ganhadores1.length || 1);
    const premio2PorPessoa = (valorPremioTotal * 0.30) / (ganhadores2.length || 1);
    const premio3PorPessoa = (valorPremioTotal * 0.10) / (ganhadores3.length || 1);

    // ETIQUETAS DE STATUS DA RODADA
    let textoStatusRodada = "Aguardando Resultados ⏳";
    let corStatusRodada = "#64748b"; 
    
    if (statusJogos.total > 0) {
        if (statusJogos.finalizados === statusJogos.total) {
            textoStatusRodada = "✅ RANKING FINAL (Concluído)";
            corStatusRodada = "#10b981"; 
        } else if (statusJogos.finalizados > 0) {
            textoStatusRodada = `🔄 PARCIAL (${statusJogos.finalizados}/${statusJogos.total} jogos)`;
            corStatusRodada = "#3b82f6"; 
        }
    }

    const abrirSecador = async (itemRanking: any) => {
        if (!apostasBloqueadas) {
            alert("🔒 O Modo Secador só é liberado quando o Admin encerrar as apostas da rodada!");
            return;
        }

        setCartelaSelecionada(itemRanking);
        try {
            const res = await fetch(`${apiUrl}/meus-palpites/${itemRanking.usuario_id}`);
            const dados = await res.json();
            const bilheteEspecifico = dados.find((c: any) => c.cartela_id === itemRanking.cartela_id);
            
            setPalpitesSecador(bilheteEspecifico ? bilheteEspecifico.palpites : []);
            setModalAberto(true);
        } catch (error) {
            alert("Erro ao buscar os palpites deste bilhete.");
        }
    };

    const handleBaixarAuditoria = async () => {
        setGerandoPdf(true);
        try {
            const res = await fetch(`${apiUrl}/auditoria`);
            if (!res.ok) throw new Error("Rota não encontrada.");

            const dadosAuditoria = await res.json();
            
            const palpitesValidosDaRodada = dadosAuditoria.filter((item: any) => {
                const rodadaNomeItem = item.rodada_nome || item.nome_rodada;
                const statusPg = item.status_pagamento || item.status_pag;
                return statusPg === 'aprovado' && rodadaNomeItem === rodadaAtual?.nome;
            });

            if (palpitesValidosDaRodada.length === 0) {
                alert("Nenhum palpite validado/pago foi encontrado para esta rodada ainda.");
                setGerandoPdf(false);
                return;
            }

            const doc = new jsPDF();
            doc.setFontSize(18);
            doc.text("Auditoria do Bolao - Palpites Registrados", 14, 20);
            doc.setFontSize(10);
            doc.text(`Gerado em: ${new Date().toLocaleString('pt-BR')}`, 14, 28);
            doc.text(`Rodada: ${rodadaAtual?.nome} | Total de Palpites Validados: ${palpitesValidosDaRodada.length}`, 14, 34);

            const palpitesPorUsuario: any = {};
            palpitesValidosDaRodada.forEach((item: any) => {
                const identificadorUsuario = item.usuario_nome || item.nome_usuario || item.nome || "Participante";
                const celularUsuario = item.telefone || item.celular || "";
                
                const nomeSeguro = identificadorUsuario; 
                const telefoneSeguro = celularUsuario ? ` - ${mascararTelefone(celularUsuario)}` : "";
                const chaveAgrupamento = `${nomeSeguro}${telefoneSeguro}`;

                if (!palpitesPorUsuario[chaveAgrupamento]) palpitesPorUsuario[chaveAgrupamento] = [];
                palpitesPorUsuario[chaveAgrupamento].push([
                    `Cartela #${item.cartela_id || item.id_cartela}`,
                    `${item.time_casa} x ${item.time_visitante}`,
                    `${item.palpite_casa} x ${item.palpite_visitante}`
                ]);
            });

            let startY = 45;
            Object.keys(palpitesPorUsuario).forEach((chaveParticipante) => {
                if (startY > 240) { doc.addPage(); startY = 20; }
                
                doc.setFontSize(11);
                doc.setTextColor(30, 41, 59);
                doc.text(`Participante: ${chaveParticipante}`, 14, startY);
                
                autoTable(doc, {
                    startY: startY + 3,
                    head: [['No Cartela', 'Partida', 'Palpite Registrado']],
                    body: palpitesPorUsuario[chaveParticipante],
                    theme: 'grid',
                    headStyles: { fillColor: [30, 41, 59], fontStyle: 'bold' },
                    styles: { fontSize: 9 },
                    margin: { left: 14, right: 14 }
                });
                startY = (doc as any).lastAutoTable.finalY + 12;
            });

            doc.save(`Auditoria-${rodadaAtual?.nome}.pdf`);
        } catch (error) {
            console.error(error);
            alert("Erro ao ler os registros da rota de auditoria do servidor.");
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

    return (
        <div style={{ backgroundColor: "#e2e8f0", minHeight: "100vh", padding: "40px 0", position: "relative" }}>
            <Container maxWidth="md">
                
                <Paper elevation={0} style={{ backgroundColor: "#1e293b", color: "white", padding: "30px", borderRadius: "16px", textAlign: "center", marginBottom: "20px", boxShadow: "0 10px 25px -5px rgba(0,0,0,0.2)" }}>
                    <Typography style={{ color: "#fcd34d", fontWeight: "bold", fontSize: "14px", marginBottom: "10px" }}>
                        SELECIONE A RODADA DO RANKING:
                    </Typography>
                    
                    {/* DROPDOWN DE SELEÇÃO DE RODADA */}
                    <Box mb={3} display="flex" justifyContent="center">
                        <select 
                            value={rodadaAtual?.id || ""} 
                            onChange={(e) => {
                                const r = todasRodadas.find(x => x.id === Number(e.target.value));
                                if (r) setRodadaAtual(r);
                            }}
                            style={{ padding: "10px 15px", borderRadius: "8px", border: "1px solid #cbd5e1", fontSize: "16px", fontWeight: "bold", color: "#1e293b", backgroundColor: "white", cursor: "pointer", width: "100%", maxWidth: "300px" }}
                        >
                            {todasRodadas.map(r => (
                                <option key={r.id} value={r.id}>
                                    {r.nome} {r.status === 'aberta' ? '🟢' : r.status === 'finalizada' ? '🔒' : '📝'}
                                </option>
                            ))}
                        </select>
                    </Box>

                    <Box display="inline-block" px={2} py={0.5} borderRadius={2} mb={2} style={{ backgroundColor: corStatusRodada, fontWeight: "bold", fontSize: "12px", color: "white" }}>
                        {textoStatusRodada}
                    </Box>

                    <Typography variant="h6" style={{ color: "#94a3b8", fontWeight: "bold", letterSpacing: "2px", marginTop: "10px" }}>
                        PREMIAÇÃO ACUMULADA
                    </Typography>
                    <Typography variant="h2" style={{ color: "#10b981", fontWeight: "900", marginTop: "10px" }}>
                        {valorPremioTotal.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
                    </Typography>
                    <Typography variant="subtitle1" style={{ color: "#cbd5e1", marginTop: "10px", lineHeight: "1.4" }}>
                        Disputado por {totalCartelasCompradas} bilhetes validados nesta rodada.
                        <br/>
                        <span style={{ fontSize: "12px", color: "#64748b" }}>*10% do valor total arrecadado é retido para custos de manutenção da plataforma.</span>
                    </Typography>
                    
                    <Box mt={3} display="flex" justifyContent="center" gap={2} flexWrap="wrap" alignItems="center">
                        <Tooltip title={apostasBloqueadas ? "Baixar todos os palpites registrados desta rodada" : "A auditoria só será liberada quando encerrar a rodada de apostas."} arrow>
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

                {mostrarBannerPremio && (
                    <Box mb={4} style={{
                        position: 'relative',
                        background: 'linear-gradient(135deg, #f59e0b 0%, #d97706 100%)',
                        borderRadius: '16px',
                        padding: '25px 20px',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        flexWrap: 'wrap',
                        gap: '15px',
                        border: '1px solid #fbbf24',
                        boxShadow: '0 10px 15px -3px rgba(245, 158, 11, 0.15)'
                    }}>
                        <IconButton onClick={fecharBannerPremio} style={{ position: 'absolute', top: '5px', right: '5px', color: '#fffbeb' }} size="small">
                            <Close fontSize="small" />
                        </IconButton>

                        <div style={{ display: 'flex', alignItems: 'center', gap: '18px' }}>
                            <div style={{ backgroundColor: '#ffffff', borderRadius: '50%', width: '50px', height: '50px', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 4px 6px rgba(0,0,0,0.1)' }}>
                                <Checkroom style={{ fontSize: '30px', color: '#059669' }} /> 
                            </div>
                            <div>
                                <Typography variant="h6" style={{ color: '#ffffff', margin: 0, fontWeight: 'bold' }}>👕 Sorteio Especial: Oitavas da Copa!</Typography>
                                <Typography variant="body2" style={{ color: '#fffbeb', margin: '4px 0 0 0' }}>O 1º lugar isolado leva uma Camisa Oficial da Seleção! (Em caso de empate, R$300 divididos).</Typography>
                            </div>
                        </div>
                    </Box>
                )}

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
                    {/* SÓ MOSTRA O PÓDIO SE TIVERMOS JOGOS FINALIZADOS */}
                    {mostrarPodio && ganhadores1.length > 0 && (
                        <Paper style={{ padding: "20px", borderRadius: "12px", backgroundColor: "#fffbeb", borderLeft: "6px solid #fbbf24", marginBottom: "15px" }}>
                            <Typography variant="subtitle2" style={{ color: "#b45309", fontWeight: "bold", marginBottom: "10px", display: "flex", alignItems: "center", gap: "5px" }}>
                                <EmojiEvents style={{ color: "#fbbf24" }} /> 1º Lugar (60%) 
                            </Typography>
                            {ganhadores1.map(g => (
                                <div key={g.cartela_id} onClick={() => abrirSecador(g)} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "10px", borderBottom: "1px dashed #fcd34d", paddingBottom: "10px", cursor: "pointer" }}>
                                    <Typography variant="h6" style={{ fontWeight: "900", color: "#1e293b", display: "flex", alignItems: "center", gap: "8px" }}>
                                        {g.nome || g.usuario_nome} 
                                        <span style={{ fontSize: '12px', backgroundColor: '#fde68a', color: '#92400e', padding: '2px 8px', borderRadius: '8px' }}>
                                            Bilhete #{g.cartela_id}
                                        </span>
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

                    {mostrarPodio && ganhadores2.length > 0 && (
                        <Paper style={{ padding: "20px", borderRadius: "12px", backgroundColor: "#f1f5f9", borderLeft: "6px solid #94a3b8", marginBottom: "15px" }}>
                            <Typography variant="subtitle2" style={{ color: "#475569", fontWeight: "bold", marginBottom: "10px", display: "flex", alignItems: "center", gap: "5px" }}>
                                <MilitaryTech style={{ color: "#94a3b8" }} /> 2º Lugar (30%)
                            </Typography>
                            {ganhadores2.map(g => (
                                <div key={g.cartela_id} onClick={() => abrirSecador(g)} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "10px", borderBottom: "1px dashed #cbd5e1", paddingBottom: "10px", cursor: "pointer" }}>
                                    <Typography variant="h6" style={{ fontWeight: "bold", color: "#1e293b", display: "flex", alignItems: "center", gap: "8px" }}>
                                        {g.nome || g.usuario_nome} 
                                        <span style={{ fontSize: '12px', backgroundColor: '#e2e8f0', color: '#475569', padding: '2px 8px', borderRadius: '8px' }}>
                                            Bilhete #{g.cartela_id}
                                        </span>
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

                    {mostrarPodio && ganhadores3.length > 0 && (
                        <Paper style={{ padding: "20px", borderRadius: "12px", backgroundColor: "#fef2f2", borderLeft: "6px solid #b45309", marginBottom: "15px" }}>
                            <Typography variant="subtitle2" style={{ color: "#9a3412", fontWeight: "bold", marginBottom: "10px", display: "flex", alignItems: "center", gap: "5px" }}>
                                <MilitaryTech style={{ color: "#b45309" }} /> 3º Lugar (10%)
                            </Typography>
                            {ganhadores3.map(g => (
                                <div key={g.cartela_id} onClick={() => abrirSecador(g)} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "10px", borderBottom: "1px dashed #fed7aa", paddingBottom: "10px", cursor: "pointer" }}>
                                    <Typography variant="h6" style={{ fontWeight: "bold", color: "#1e293b", display: "flex", alignItems: "center", gap: "8px" }}>
                                        {g.nome || g.usuario_nome} 
                                        <span style={{ fontSize: '12px', backgroundColor: '#ffedd5', color: '#9a3412', padding: '2px 8px', borderRadius: '8px' }}>
                                            Bilhete #{g.cartela_id}
                                        </span>
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

                {/* LISTA GERAL: Mostra todo mundo antes do 1º resultado sair, ou do 4º lugar pra baixo depois */}
                {restoRanking.length > 0 && (
                    <Paper elevation={2} style={{ padding: "10px", borderRadius: "16px", backgroundColor: "white" }}>
                        <List>
                            {restoRanking.map((participant, index) => (
                                <React.Fragment key={index}>
                                    <ListItem onClick={() => abrirSecador(participant)} style={{ padding: "15px", cursor: "pointer" }}>
                                        <div style={{ display: "flex", alignItems: "center", width: "100%" }}>
                                            
                                            {/* Se o Pódio está visível, mostra #4, #5. Se não, mostra só um traço pra todo mundo! */}
                                            <Typography style={{ fontWeight: "900", color: "#94a3b8", width: "40px" }}>
                                                {mostrarPodio ? `#${index + 4}` : "-"}
                                            </Typography>
                                            
                                            <ListItemText primary={
                                                <span style={{ display: "flex", alignItems: "center", gap: "8px", fontWeight: "bold", color: "#334155" }}>
                                                    {participant.nome || participant.usuario_nome} 
                                                    <span style={{ fontSize: '11px', backgroundColor: '#f1f5f9', color: '#64748b', padding: '2px 8px', borderRadius: '8px' }}>
                                                        Bilhete #{participant.cartela_id}
                                                    </span>
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
                    <AppButton style={{ width: "200px", padding: "12px", backgroundColor: "#f97316", border: "none" }} label="Meus Palpites" onClick={() => history.push("/public/palpites")} />
                    <AppButton style={{ width: "200px", padding: "12px", backgroundColor: "#64748b", border: "none" }} label="Voltar à Home" onClick={() => history.push("/public")} />
                </Box>

                <Dialog open={modalAberto} onClose={() => setModalAberto(false)} fullWidth maxWidth="sm" PaperProps={{ style: { borderRadius: "16px", backgroundColor: "#f8fafc" } }}>
                    <DialogTitle style={{ backgroundColor: "#1e293b", color: "white", display: "flex", justifyContent: "space-between", alignItems: "center", padding: "20px" }}>
                        <span style={{ fontWeight: "bold", color: "white" }}>🔍 Secador: Bilhete #{cartelaSelecionada?.cartela_id}</span>
                        <AppButton label="X" onClick={() => setModalAberto(false)} style={{ background: "rgba(255,255,255,0.1)", border: "none", color: "white", padding: "5px 15px", minWidth: "auto" }} />
                    </DialogTitle>
                    <DialogContent style={{ padding: "20px" }}>
                        <div style={{ textAlign: "center", marginBottom: "20px", color: "#64748b" }}>
                            Palpites de <strong>{cartelaSelecionada?.nome || cartelaSelecionada?.usuario_nome}</strong> para este bilhete
                        </div>
                        {palpitesSecador.length === 0 ? (
                            <Typography style={{ textAlign: "center", color: "#64748b", padding: "30px 0" }}>Nenhum palpite encontrado.</Typography>
                        ) : (
                            palpitesSecador.map((p: any, i: number) => {
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
                            })
                        )}
                    </DialogContent>
                </Dialog>
            </Container>

            <Box style={{ position: 'fixed', bottom: '30px', right: '30px', display: 'flex', flexDirection: 'column', gap: '15px', zIndex: 999 }}>
                {!mostrarBannerPremio && (
                    <Tooltip title="Ver Prêmio Especial" placement="left" arrow>
                        <Fab onClick={() => { setMostrarBannerPremio(true); localStorage.setItem("bannerPremioOculto", "false"); }} style={{ backgroundColor: '#f59e0b', color: 'white', boxShadow: '0 4px 10px rgba(245, 158, 11, 0.4)' }}>
                            <Checkroom style={{ fontSize: '28px' }} />
                        </Fab>
                    </Tooltip>
                )}
                
                {!mostrarBannerWpp && (
                    <Tooltip title="Grupo VIP" placement="left" arrow>
                        <Fab color="success" onClick={() => window.open(linkGrupoWpp, '_blank')} style={{ backgroundColor: '#25D366', color: 'white', boxShadow: '0 4px 10px rgba(37, 211, 102, 0.4)' }}>
                            <WhatsApp style={{ fontSize: '30px' }} />
                        </Fab>
                    </Tooltip>
                )}
            </Box>
        </div>
    );
};

export default Ranking;