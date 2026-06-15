import React, { useState, useEffect } from "react";
import { Container, Typography, Paper, List, ListItem, Divider, CircularProgress, Box, Dialog, DialogTitle, DialogContent, Tooltip, Select, MenuItem, FormControl } from "@mui/material";
import AppButton from "../../../../../vendors/components/Button";
import { useHistory } from "react-router-dom";
import { EmojiEvents, PictureAsPdf, MilitaryTech, Visibility, Lock } from "@mui/icons-material";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";

const Ranking = () => {
    const apiUrl = process.env.REACT_APP_API_URL || 'http://localhost:3001';
    
    const [aprovados, setAprovados] = useState<any[]>([]); 
    const [teams, setTeams] = useState<any[]>([]);
    const [auditoriaCompleta, setAuditoriaCompleta] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [gerandoPdf, setGerandoPdf] = useState(false);
    const [usuarioLogado, setUsuarioLogado] = useState<any>(null);
    const history = useHistory();

    const [rodadaAtual, setRodadaAtual] = useState<any>(null);
    const [rodadasRanking, setRodadasRanking] = useState<any[]>([]);
    const [apostasBloqueadas, setApostasBloqueadas] = useState(false);
    const [statusJogos, setStatusJogos] = useState({ finalizados: 0, total: 0 });
    
    const [modalAberto, setModalAberto] = useState(false);
    const [cartelaSelecionada, setCartelaSelecionada] = useState<any>(null);
    const [palpitesSecador, setPalpitesSecador] = useState<any[]>([]);
    
    const [jogosRodada, setJogosRodada] = useState<any[]>([]);
    const [jogoSelecionadoId, setJogoSelecionadoId] = useState<string | number>('');
    const [palpitesCache, setPalpitesCache] = useState<Record<string, any[]>>({});

    const VALOR_INSCRICAO = 20;

    const mascararTelefone = (tel: string) => {
        if (!tel) return "Não Informado";
        const limpo = tel.replace(/\D/g, "");
        if (limpo.length === 11) return `(${limpo.substring(0, 2)}) ${limpo.substring(2, 3)}****-${limpo.substring(7)}`;
        if (limpo.length === 10) return `(${limpo.substring(0, 2)}) ****-${limpo.substring(6)}`;
        return tel;
    };

    useEffect(() => {
        const salvo = localStorage.getItem("usuarioLogado");
        if (salvo) setUsuarioLogado(JSON.parse(salvo));

        Promise.all([
            fetch(`${apiUrl}/rodadas`),
            fetch(`${apiUrl}/teams`),
            fetch(`${apiUrl}/auditoria`)
        ])
        .then(async ([rodadasRes, teamsRes, audRes]) => {
            const rodadasData = await rodadasRes.json();
            const teamsData = await teamsRes.json();
            const audData = await audRes.json();

            setTeams(teamsData);
            setAuditoriaCompleta(audData);

            if (!Array.isArray(rodadasData) || rodadasData.length === 0) {
                setLoading(false);
                return;
            }

            const rankingsFixados = rodadasData
                .filter((r: any) => r.exibir_no_ranking === true)
                .sort((a: any, b: any) => {
                    const ordemA = a.ordem_ranking != null ? Number(a.ordem_ranking) : 999;
                    const ordemB = b.ordem_ranking != null ? Number(b.ordem_ranking) : 999;
                    if (ordemA !== ordemB) return ordemA - ordemB;
                    return b.id - a.id;
                });

            setRodadasRanking(rankingsFixados);

            let ativa = null;
            if (rankingsFixados.length > 0) ativa = rankingsFixados[0];
            else {
                ativa = rodadasData.find((r: any) => r.status === 'aberta' || r.status === 'pausada');
                if (!ativa) {
                    const encerradas = rodadasData.filter((r: any) => r.status === 'encerrada');
                    if (encerradas.length > 0) ativa = encerradas.sort((a: any, b: any) => b.id - a.id)[0];
                }
                if (!ativa) ativa = rodadasData[0];
            }

            if (ativa) carregarRankingRodada(ativa);
            else setLoading(false);
        })
        .catch((err) => {
            console.error("Erro geral:", err);
            setLoading(false);
        });
    }, [apiUrl]);

    const carregarRankingRodada = async (rodada: any) => {
        setRodadaAtual(rodada);
        setApostasBloqueadas(rodada.status === 'pausada' || rodada.status === 'encerrada' || rodada.status === 'finalizada');
        setLoading(true);
        setJogoSelecionadoId('');

        try {
            const [rankRes, jogosRes] = await Promise.all([
                fetch(`${apiUrl}/ranking`),
                fetch(`${apiUrl}/jogos?rodada_id=${rodada.id}`)
            ]);

            const rankData = await rankRes.json();
            const jogosData = await jogosRes.json();

            if (Array.isArray(rankData)) {
                const rankDaRodada = rankData
                    .filter((r: any) => r.rodada_id === rodada.id)
                    .sort((a: any, b: any) => b.pontuacao_total - a.pontuacao_total);
                setAprovados(rankDaRodada);
            }

            if (Array.isArray(jogosData)) {
                const jogosFinalizados = jogosData.filter((j: any) => j.gols_casa !== null && j.gols_visitante !== null).length;
                setStatusJogos({ finalizados: jogosFinalizados, total: jogosData.length });
                
                // LÓGICA DE ORDENAÇÃO DO SECADOR: Finalizados para o final
                const jogosOrdenadosParaSecador = [...jogosData].sort((a: any, b: any) => {
                    const aFinalizado = a.gols_casa !== null && a.gols_visitante !== null;
                    const bFinalizado = b.gols_casa !== null && b.gols_visitante !== null;
                    
                    if (aFinalizado && !bFinalizado) return 1;
                    if (!aFinalizado && bFinalizado) return -1;
                    return new Date(a.data_hora).getTime() - new Date(b.data_hora).getTime();
                });

                setJogosRodada(jogosOrdenadosParaSecador);

                if (jogosOrdenadosParaSecador.length > 0 && rodada.tipo !== 'campeao') {
                    const agora = new Date().getTime();
                    let jogoRolandoId = '';
                    
                    for (let j of jogosOrdenadosParaSecador) {
                        if (!j.data_hora || (j.gols_casa !== null && j.gols_visitante !== null)) continue;
                        
                        const start = new Date(j.data_hora).getTime();
                        const end = start + 120 * 60000; 
                        
                        if (agora >= start && agora <= end) {
                            jogoRolandoId = j.id;
                            break;
                        }
                    }
                    setJogoSelecionadoId(jogoRolandoId); 
                }
            }
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    const renderPalpiteCampeao = (cartela_id: number) => {
        if (rodadaAtual?.tipo !== 'campeao') return null;

        const palpite = auditoriaCompleta.find((a: any) => a.cartela_id === cartela_id || a.id_cartela === cartela_id);
        if (!palpite || !palpite.palpite_texto) return null;

        if (!apostasBloqueadas) {
            return (
                <Box display="flex" alignItems="center" gap={1} mt={0.5}>
                    <Lock style={{ fontSize: '14px', color: '#94a3b8' }} />
                    <Typography variant="caption" color="#94a3b8" fontWeight="bold">Palpite Oculto</Typography>
                </Box>
            );
        }

        const team = teams.find((t: any) => t.nome === palpite.palpite_texto);
        return (
            <Box display="flex" alignItems="center" gap={1} mt={0.5} style={{ backgroundColor: '#f1f5f9', padding: '4px 8px', borderRadius: '6px', width: 'fit-content' }}>
                <img src={team?.bandeira || team?.logo_url || '/media/escudos-times/default.png'} style={{ width: '20px', height: '14px', borderRadius: '2px', objectFit: 'cover' }} alt="Bandeira" />
                <Typography variant="caption" fontWeight="900" color="#334155">{palpite.palpite_texto}</Typography>
            </Box>
        );
    };

    const renderPalpiteDropdown = (cartela_id: number) => {
        if (!apostasBloqueadas || isCampeao || !jogoSelecionadoId) return null;
        const jogo = jogosRodada.find(j => String(j.id) === String(jogoSelecionadoId));
        if (!jogo) return null;

        const palpite = auditoriaCompleta.find((a: any) =>
            (a.cartela_id === cartela_id || a.id_cartela === cartela_id) &&
            a.time_casa === jogo.time_casa &&
            a.time_visitante === jogo.time_visitante
        );

        if (!palpite) return (
            <Box display="flex" alignItems="center" gap={1} mt={0.5}>
                <Typography variant="caption" color="#cbd5e1" fontWeight="bold">Sem palpite ❌</Typography>
            </Box>
        );

        return (
            <Box display="flex" alignItems="center" gap={1} mt={0.5} style={{ backgroundColor: '#f8fafc', padding: '4px 10px', borderRadius: '8px', border: '1px solid #e2e8f0', width: 'fit-content' }}>
                <Typography variant="caption" fontWeight="900" color="#334155" fontSize="13px">{palpite.palpite_casa}</Typography>
                <Typography variant="caption" color="#94a3b8" fontWeight="bold" fontSize="11px">X</Typography>
                <Typography variant="caption" fontWeight="900" color="#334155" fontSize="13px">{palpite.palpite_visitante}</Typography>
            </Box>
        );
    };

    const verificarSeEVoce = (participant: any) => {
        if (!usuarioLogado) return false;
        return String(participant.usuario_id) === String(usuarioLogado.id) || String(participant.cartela_id) === String(usuarioLogado.cartela_id);
    };

    const totalCartelasCompradas = aprovados.length;
    const valorArrecadadoTotal = totalCartelasCompradas * (rodadaAtual?.preco || VALOR_INSCRICAO);
    const valorPremioTotal = valorArrecadadoTotal * 0.90;

    const isCampeao = rodadaAtual?.tipo === 'campeao';
    
    const mostrarPodio = isCampeao 
        ? aprovados.some(p => p.pontuacao_total > 0) 
        : statusJogos.finalizados > 0;

    const pontuacoesUnicas = aprovados.map(p => Number(p.pontuacao_total)).filter((valor, indice, array) => array.indexOf(valor) === indice).sort((a, b) => b - a); 
    const score1 = pontuacoesUnicas[0]; 
    const score2 = pontuacoesUnicas[1]; 
    const score3 = pontuacoesUnicas[2]; 

    let ganhadores1: any[] = [];
    let ganhadores2: any[] = [];
    let ganhadores3: any[] = [];
    let restoRanking: any[] = [];

    if (mostrarPodio) {
        ganhadores1 = aprovados.filter(p => Number(p.pontuacao_total) === score1);
        ganhadores2 = aprovados.filter(p => Number(p.pontuacao_total) === score2);
        ganhadores3 = aprovados.filter(p => Number(p.pontuacao_total) === score3);
        const todosDoPodioIds = [...ganhadores1, ...ganhadores2, ...ganhadores3].map(u => u.cartela_id);
        restoRanking = aprovados.filter(u => !todosDoPodioIds.includes(u.cartela_id));
    } else {
        restoRanking = [...aprovados]; 
    }

    const premio1PorPessoa = isCampeao 
        ? valorPremioTotal / (ganhadores1.length || 1) 
        : (valorPremioTotal * 0.60) / (ganhadores1.length || 1);
    
    const premio2PorPessoa = (valorPremioTotal * 0.30) / (ganhadores2.length || 1);
    const premio3PorPessoa = (valorPremioTotal * 0.10) / (ganhadores3.length || 1);

    let minhaPosicaoTexto = "";
    let meusPontos = 0;
    let diferencaPraCima = 0;
    let exibirBarra = false;

    if (usuarioLogado) {
        const indexRanking = aprovados.findIndex(p => verificarSeEVoce(p));
        if (indexRanking !== -1) {
            exibirBarra = true;
            meusPontos = Number(aprovados[indexRanking].pontuacao_total);
            
            if (meusPontos === score1) {
                minhaPosicaoTexto = "1º Lugar" + (ganhadores1.length > 1 ? " (Empatado)" : "");
            } else if (meusPontos === score2) {
                minhaPosicaoTexto = "2º Lugar" + (ganhadores2.length > 1 ? " (Empatado)" : "");
            } else if (meusPontos === score3) {
                minhaPosicaoTexto = "3º Lugar" + (ganhadores3.length > 1 ? " (Empatado)" : "");
            } else {
                const pos = pontuacoesUnicas.indexOf(meusPontos) + 1;
                minhaPosicaoTexto = `${pos}º Lugar`;
            }

            const indexAcima = pontuacoesUnicas.indexOf(meusPontos) - 1;
            if (indexAcima >= 0) {
                diferencaPraCima = pontuacoesUnicas[indexAcima] - meusPontos;
            }
        }
    }

    let textoStatusRodada = "Aguardando Resultados ⏳";
    let corStatusRodada = "#64748b"; 
    
    if (isCampeao) {
        if (mostrarPodio) { textoStatusRodada = "✅ CAMPEÃO DEFINIDO!"; corStatusRodada = "#10b981"; }
        else { textoStatusRodada = apostasBloqueadas ? "🔒 Apostas Encerradas" : "🟢 Mercado Aberto"; corStatusRodada = apostasBloqueadas ? "#ef4444" : "#10b981"; }
    } else if (statusJogos.total > 0) {
        if (statusJogos.finalizados === statusJogos.total) { textoStatusRodada = "✅ RANKING FINAL (Concluído)"; corStatusRodada = "#10b981"; } 
        else if (statusJogos.finalizados > 0) { textoStatusRodada = `🔄 PARCIAL (${statusJogos.finalizados}/${statusJogos.total} jogos)`; corStatusRodada = "#3b82f6"; }
    }

    const abrirSecador = async (itemRanking: any) => {
        if (!apostasBloqueadas) { alert("🔒 O Modo Secador só é liberado quando o Admin pausar as apostas da rodada!"); return; }
        setCartelaSelecionada(itemRanking);

        const idCache = String(itemRanking.cartela_id);
        if (palpitesCache[idCache]) {
            setPalpitesSecador(palpitesCache[idCache]);
            setModalAberto(true);
            return;
        }

        try {
            const res = await fetch(`${apiUrl}/meus-palpites/${itemRanking.usuario_id}`);
            const dados = await res.json();
            const bilheteEspecifico = dados.find((c: any) => c.cartela_id === itemRanking.cartela_id);
            const palpites = bilheteEspecifico ? bilheteEspecifico.palpites : [];
            
            setPalpitesCache(prev => ({ ...prev, [idCache]: palpites }));
            setPalpitesSecador(palpites);
            setModalAberto(true);
        } catch (error) { alert("Erro ao buscar os palpites deste bilhete."); }
    };

    const handleBaixarAuditoria = async () => {
        setGerandoPdf(true);
        try {
            const idsAprovadosNaTela = aprovados.map(a => a.cartela_id);
            let palpitesValidosDaRodada = auditoriaCompleta.filter((item: any) => idsAprovadosNaTela.includes(item.cartela_id || item.id_cartela));

            if (palpitesValidosDaRodada.length === 0) {
                alert("Nenhum palpite encontrado para gerar o PDF.");
                setGerandoPdf(false);
                return;
            }

            const doc = new jsPDF();
            doc.setFontSize(18);
            doc.text("Auditoria do Bolao - Palpites Registrados", 14, 20);
            doc.setFontSize(10);
            doc.text(`Gerado em: ${new Date().toLocaleString('pt-BR')}`, 14, 28);
            doc.text(`Rodada: ${rodadaAtual?.nome} | Total de Palpites: ${palpitesValidosDaRodada.length}`, 14, 34);

            const palpitesPorUsuario: any = {};
            palpitesValidosDaRodada.forEach((item: any) => {
                const nomeSeguro = item.usuario_nome || item.nome_usuario || item.nome || "Participante";
                const celular = item.telefone || item.celular || "";
                const chave = `${nomeSeguro}${celular ? ` - ${mascararTelefone(celular)}` : ""}`;

                if (!palpitesPorUsuario[chave]) palpitesPorUsuario[chave] = [];
                palpitesPorUsuario[chave].push([
                    `Cartela #${item.numero_bilhete || item.cartela_id}`,
                    item.palpite_texto ? `Aposta Direta` : `${item.time_casa} x ${item.time_visitante}`,
                    item.palpite_texto ? item.palpite_texto : `${item.palpite_casa} x ${item.palpite_visitante}`
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
                    head: [['No Cartela', 'Partida / Categoria', 'Palpite Registrado']],
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
            alert("Erro ao ler os registros de auditoria.");
        } finally { setGerandoPdf(false); }
    };

    if (loading) return <Container maxWidth="md" style={{ textAlign: "center", marginTop: "100px" }}><CircularProgress style={{ color: "#fbbf24" }} /><Typography style={{ color: "#1e293b", marginTop: "20px", fontWeight: "bold" }}>Calculando Ranking Oficial...</Typography></Container>;

    return (
        <div style={{ backgroundColor: "#e2e8f0", minHeight: "100vh", padding: "40px 0", paddingBottom: "100px", position: "relative" }}>
            <Container maxWidth="md">
                
                {rodadasRanking.length > 1 && (
                    <Box mb={3} display="flex" justifyContent="center">
                        <select
                            value={rodadaAtual?.id || ''}
                            onChange={(e) => {
                                const rodada = rodadasRanking.find((r: any) => String(r.id) === String(e.target.value));
                                if (rodada) carregarRankingRodada(rodada);
                            }}
                            style={{ width: '100%', maxWidth: '400px', padding: '14px', borderRadius: '12px', border: '2px solid #cbd5e1', fontWeight: 'bold', fontSize: '15px', backgroundColor: 'white' }}
                        >
                            {rodadasRanking.map((r: any) => <option key={r.id} value={r.id}>🏆 {r.nome}</option>)}
                        </select>
                    </Box>
                )}

                <Paper elevation={0} style={{ backgroundColor: "#1e293b", color: "white", padding: "30px", borderRadius: "16px", textAlign: "center", marginBottom: "20px", boxShadow: "0 10px 25px -5px rgba(0,0,0,0.2)" }}>
                    <Typography style={{ color: "#fcd34d", fontWeight: "bold", fontSize: "14px", marginBottom: "15px" }}>RANKING DA RODADA: {rodadaAtual?.nome}</Typography>
                    <Box display="inline-block" px={2} py={0.5} borderRadius={2} mb={2} style={{ backgroundColor: corStatusRodada, fontWeight: "bold", fontSize: "12px", color: "white" }}>{textoStatusRodada}</Box>
                    <Typography variant="h6" style={{ color: "#94a3b8", fontWeight: "bold", letterSpacing: "2px", marginTop: "10px" }}>PREMIAÇÃO ACUMULADA (90%)</Typography>
                    <Typography variant="h2" style={{ color: "#10b981", fontWeight: "900", marginTop: "10px" }}>{valorPremioTotal.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}</Typography>
                    <Typography variant="subtitle1" style={{ color: "#cbd5e1", marginTop: "10px", lineHeight: "1.4" }}>Disputado por {totalCartelasCompradas} bilhetes validados.</Typography>
                    
                    <Box mt={3} display="flex" justifyContent="center" gap={2} flexWrap="wrap" alignItems="center">
                        <Tooltip title={apostasBloqueadas ? "Baixar todos os palpites registrados desta rodada" : "A auditoria só será liberada quando encerrar a rodada de apostas."} arrow>
                            <span>
                                <AppButton 
                                    label={gerandoPdf ? "Gerando..." : "Baixar Auditoria"} 
                                    icon={apostasBloqueadas ? <PictureAsPdf style={{ marginRight: '8px' }} /> : <Lock style={{ marginRight: '8px' }} />}
                                    onClick={handleBaixarAuditoria} disabled={!apostasBloqueadas || gerandoPdf} 
                                    style={{ backgroundColor: apostasBloqueadas ? "#3b82f6" : "#475569", border: "none", color: "white", padding: "10px 20px", opacity: apostasBloqueadas ? 1 : 0.6, cursor: apostasBloqueadas ? "pointer" : "not-allowed" }}
                                />
                            </span>
                        </Tooltip>
                        <div style={{ backgroundColor: apostasBloqueadas ? "#10b981" : "#ef4444", color: "white", padding: "10px 20px", borderRadius: "8px", display: "flex", alignItems: "center", gap: "8px", fontWeight: "bold" }}>
                            {apostasBloqueadas ? <Visibility /> : <Lock />}
                            {apostasBloqueadas ? "Modo Secador Liberado" : "Secador Bloqueado"}
                        </div>
                    </Box>
                </Paper>

                {apostasBloqueadas && !isCampeao && jogosRodada.length > 0 && (
                    <Box mb={3} p={2.5} borderRadius="16px" bgcolor="white" boxShadow="0 4px 15px rgba(0,0,0,0.05)" border="1px solid #e2e8f0">
                        <Typography variant="subtitle2" color="#64748b" fontWeight="900" mb={1.5} display="flex" alignItems="center" gap="8px">
                            <Visibility fontSize="small" color="primary" /> 
                            MODO SECADOR: O que a galera apostou nesse jogo?
                        </Typography>
                        
                        <FormControl fullWidth size="medium">
                            <Select
                                value={jogoSelecionadoId}
                                onChange={(e) => setJogoSelecionadoId(e.target.value)}
                                displayEmpty
                                sx={{
                                    bgcolor: '#f8fafc',
                                    borderRadius: '8px',
                                    '& .MuiOutlinedInput-notchedOutline': { borderColor: '#cbd5e1', borderWidth: '2px' },
                                    color: '#1e293b',
                                    '& .MuiSelect-select': { display: 'flex', justifyContent: 'center', alignItems: 'center', paddingY: '12px' }
                                }}
                                MenuProps={{ PaperProps: { sx: { borderRadius: '12px', boxShadow: '0 10px 30px rgba(0,0,0,0.15)', mt: 1 } } }}
                            >
                                <MenuItem value="" sx={{ justifyContent: 'center', py: 2 }}>
                                    <em style={{ color: '#94a3b8', fontWeight: 'bold' }}>Nenhum jogo selecionado...</em>
                                </MenuItem>
                                
                                {jogosRodada.map(j => {
                                    const timeCasa = teams.find(t => t.nome === j.time_casa);
                                    const timeVisitante = teams.find(t => t.nome === j.time_visitante);
                                    const logoCasa = timeCasa?.bandeira || timeCasa?.logo_url || '/media/escudos-times/default.png';
                                    const logoVisitante = timeVisitante?.bandeira || timeVisitante?.logo_url || '/media/escudos-times/default.png';
                                    const siglaCasa = timeCasa?.sigla || j.time_casa.substring(0, 3).toUpperCase();
                                    const siglaVisitante = timeVisitante?.sigla || j.time_visitante.substring(0, 3).toUpperCase();
                                    const finalizado = j.gols_casa !== null && j.gols_visitante !== null;

                                    return (
                                        <MenuItem key={j.id} value={j.id} sx={{ justifyContent: 'center', py: 1.5, opacity: finalizado ? 0.6 : 1 }}>
                                            <Box display="flex" alignItems="center" justifyContent="center" gap={2} width="100%">
                                                <img src={logoCasa} style={{ width: 28, height: 20, objectFit: 'cover', borderRadius: '4px', border: '1px solid #cbd5e1' }} alt="Casa" />
                                                <Typography fontWeight="900" fontSize="16px" color="#334155" sx={{ minWidth: '45px', textAlign: 'right' }}>{siglaCasa}</Typography>
                                                
                                                {/* Se estiver finalizado, mostra o placar real no meio */}
                                                {finalizado ? (
                                                    <Typography color="#059669" fontSize="14px" fontWeight="900" bgcolor="#d1fae5" px={1} borderRadius="4px">
                                                        {j.gols_casa} x {j.gols_visitante}
                                                    </Typography>
                                                ) : (
                                                    <Typography color="#94a3b8" fontSize="14px" fontWeight="900">X</Typography>
                                                )}
                                                
                                                <Typography fontWeight="900" fontSize="16px" color="#334155" sx={{ minWidth: '45px', textAlign: 'left' }}>{siglaVisitante}</Typography>
                                                <img src={logoVisitante} style={{ width: 28, height: 20, objectFit: 'cover', borderRadius: '4px', border: '1px solid #cbd5e1' }} alt="Visitante" />
                                                
                                                {finalizado && <span style={{fontSize: '10px', fontWeight: 'bold', color: '#64748b', marginLeft: '5px'}}> (Finalizado)</span>}
                                            </Box>
                                        </MenuItem>
                                    )
                                })}
                            </Select>
                        </FormControl>
                    </Box>
                )}

                <Box mb={5}>
                    {mostrarPodio && ganhadores1.length > 0 && (
                        <Paper style={{ padding: "20px", borderRadius: "12px", backgroundColor: "#fffbeb", borderLeft: "6px solid #fbbf24", marginBottom: "15px" }}>
                            <Typography variant="subtitle2" style={{ color: "#b45309", fontWeight: "bold", marginBottom: "10px", display: "flex", alignItems: "center", gap: "5px" }}><EmojiEvents style={{ color: "#fbbf24" }} /> {isCampeao ? "Ganhadores do Pote Total" : "1º Lugar (60%)"} </Typography>
                            {ganhadores1.map(g => (
                                <div key={g.cartela_id} onClick={() => abrirSecador(g)} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "10px", borderBottom: "1px dashed #fcd34d", paddingBottom: "10px", cursor: "pointer" }}>
                                    <div style={{ flex: 1, paddingRight: '10px' }}>
                                        <Box display="flex" gap={1} mb={0.5} flexWrap="wrap">
                                            <span style={{ fontSize: '11px', backgroundColor: '#fde68a', color: '#92400e', padding: '2px 8px', borderRadius: '8px', fontWeight: 'bold' }}>#{g.numero_bilhete || g.cartela_id}</span>
                                            {verificarSeEVoce(g) && <span style={{ fontSize: '10px', backgroundColor: '#3b82f6', color: 'white', padding: '2px 8px', borderRadius: '12px', letterSpacing: '1px', fontWeight: 'bold' }}>VOCÊ</span>}
                                        </Box>
                                        <Typography variant="h6" style={{ fontWeight: "900", color: "#1e293b", lineHeight: 1.2, wordBreak: 'break-word' }}>
                                            {g.nome || g.usuario_nome}
                                        </Typography>
                                        {renderPalpiteCampeao(g.cartela_id)}
                                        {renderPalpiteDropdown(g.cartela_id)}
                                    </div>
                                    <div style={{ textAlign: "right", minWidth: "70px" }}>
                                        <Typography style={{ fontWeight: "900", color: "#d97706" }}>{g.pontuacao_total} pts</Typography>
                                        <Typography variant="caption" style={{ color: "#047857", fontWeight: "bold", backgroundColor: "#d1fae5", padding: "4px 8px", borderRadius: "4px" }}>{premio1PorPessoa.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}</Typography>
                                    </div>
                                </div>
                            ))}
                        </Paper>
                    )}

                    {mostrarPodio && !isCampeao && ganhadores2.length > 0 && (
                        <Paper style={{ padding: "20px", borderRadius: "12px", backgroundColor: "#f1f5f9", borderLeft: "6px solid #94a3b8", marginBottom: "15px" }}>
                            <Typography variant="subtitle2" style={{ color: "#475569", fontWeight: "bold", marginBottom: "10px", display: "flex", alignItems: "center", gap: "5px" }}><MilitaryTech style={{ color: "#94a3b8" }} /> 2º Lugar (30%)</Typography>
                            {ganhadores2.map(g => (
                                <div key={g.cartela_id} onClick={() => abrirSecador(g)} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "10px", borderBottom: "1px dashed #cbd5e1", paddingBottom: "10px", cursor: "pointer" }}>
                                    <div style={{ flex: 1, paddingRight: '10px' }}>
                                        <Box display="flex" gap={1} mb={0.5} flexWrap="wrap">
                                            <span style={{ fontSize: '11px', backgroundColor: '#e2e8f0', color: '#475569', padding: '2px 8px', borderRadius: '8px', fontWeight: 'bold' }}>#{g.numero_bilhete || g.cartela_id}</span>
                                            {verificarSeEVoce(g) && <span style={{ fontSize: '10px', backgroundColor: '#3b82f6', color: 'white', padding: '2px 8px', borderRadius: '12px', letterSpacing: '1px', fontWeight: 'bold' }}>VOCÊ</span>}
                                        </Box>
                                        <Typography variant="h6" style={{ fontWeight: "bold", color: "#1e293b", lineHeight: 1.2, wordBreak: 'break-word' }}>
                                            {g.nome || g.usuario_nome}
                                        </Typography>
                                        {renderPalpiteCampeao(g.cartela_id)}
                                        {renderPalpiteDropdown(g.cartela_id)}
                                    </div>
                                    <div style={{ textAlign: "right", minWidth: "70px" }}>
                                        <Typography style={{ fontWeight: "900", color: "#64748b" }}>{g.pontuacao_total} pts</Typography>
                                        <Typography variant="caption" style={{ color: "#047857", fontWeight: "bold", backgroundColor: "#d1fae5", padding: "4px 8px", borderRadius: "4px" }}>{premio2PorPessoa.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}</Typography>
                                    </div>
                                </div>
                            ))}
                        </Paper>
                    )}

                    {mostrarPodio && !isCampeao && ganhadores3.length > 0 && (
                        <Paper style={{ padding: "20px", borderRadius: "12px", backgroundColor: "#fef2f2", borderLeft: "6px solid #b45309", marginBottom: "15px" }}>
                            <Typography variant="subtitle2" style={{ color: "#9a3412", fontWeight: "bold", marginBottom: "10px", display: "flex", alignItems: "center", gap: "5px" }}><MilitaryTech style={{ color: "#b45309" }} /> 3º Lugar (10%)</Typography>
                            {ganhadores3.map(g => (
                                <div key={g.cartela_id} onClick={() => abrirSecador(g)} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "10px", borderBottom: "1px dashed #fed7aa", paddingBottom: "10px", cursor: "pointer" }}>
                                    <div style={{ flex: 1, paddingRight: '10px' }}>
                                        <Box display="flex" gap={1} mb={0.5} flexWrap="wrap">
                                            <span style={{ fontSize: '11px', backgroundColor: '#ffedd5', color: '#9a3412', padding: '2px 8px', borderRadius: '8px', fontWeight: 'bold' }}>#{g.numero_bilhete || g.cartela_id}</span>
                                            {verificarSeEVoce(g) && <span style={{ fontSize: '10px', backgroundColor: '#3b82f6', color: 'white', padding: '2px 8px', borderRadius: '12px', letterSpacing: '1px', fontWeight: 'bold' }}>VOCÊ</span>}
                                        </Box>
                                        <Typography variant="h6" style={{ fontWeight: "bold", color: "#1e293b", lineHeight: 1.2, wordBreak: 'break-word' }}>
                                            {g.nome || g.usuario_nome}
                                        </Typography>
                                        {renderPalpiteCampeao(g.cartela_id)}
                                        {renderPalpiteDropdown(g.cartela_id)}
                                    </div>
                                    <div style={{ textAlign: "right", minWidth: "70px" }}>
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
                            {restoRanking.map((participant, index) => {
                                const pos = pontuacoesUnicas.indexOf(Number(participant.pontuacao_total)) + 1;
                                
                                return (
                                    <React.Fragment key={index}>
                                        <ListItem onClick={() => abrirSecador(participant)} style={{ padding: "15px", cursor: "pointer", backgroundColor: verificarSeEVoce(participant) ? '#eff6ff' : 'transparent' }}>
                                            <div style={{ display: "flex", alignItems: "center", width: "100%" }}>
                                                <Typography style={{ fontWeight: "900", color: "#94a3b8", width: "40px" }}>{mostrarPodio && !isCampeao ? `#${pos}` : "-"}</Typography>
                                                
                                                <div style={{ flex: 1, paddingRight: '10px' }}>
                                                    <Box display="flex" gap={1} mb={0.5} flexWrap="wrap">
                                                        <span style={{ fontSize: '10px', backgroundColor: '#f1f5f9', color: '#64748b', padding: '2px 8px', borderRadius: '8px', fontWeight: 'bold' }}>#{participant.numero_bilhete || participant.cartela_id}</span>
                                                        {verificarSeEVoce(participant) && <span style={{ fontSize: '9px', backgroundColor: '#3b82f6', color: 'white', padding: '2px 8px', borderRadius: '12px', letterSpacing: '1px', fontWeight: 'bold' }}>VOCÊ</span>}
                                                    </Box>
                                                    <Typography style={{ fontWeight: "bold", color: "#334155", lineHeight: 1.2, wordBreak: 'break-word' }}>
                                                        {participant.nome || participant.usuario_nome}
                                                    </Typography>
                                                    {renderPalpiteCampeao(participant.cartela_id)}
                                                    {renderPalpiteDropdown(participant.cartela_id)}
                                                </div>
                                                
                                                <div style={{ textAlign: "right", minWidth: "50px" }}>
                                                    <Typography style={{ fontWeight: "900", color: "#1e293b" }}>{participant.pontuacao_total} pts</Typography>
                                                </div>
                                            </div>
                                        </ListItem>
                                        {index < restoRanking.length - 1 && <Divider />}
                                    </React.Fragment>
                                );
                            })}
                        </List>
                    </Paper>
                )}

                <Box mt={4} display="flex" gap={2} justifyContent="center" flexWrap="wrap">
                    <AppButton style={{ width: "200px", padding: "12px", backgroundColor: "#f97316", border: "none" }} label="Meus Palpites" onClick={() => history.push("/public/palpites")} />
                    <AppButton style={{ width: "200px", padding: "12px", backgroundColor: "#64748b", border: "none" }} label="Voltar à Home" onClick={() => history.push("/public")} />
                </Box>

                {/* MODAL DO SECADOR */}
                <Dialog open={modalAberto} onClose={() => setModalAberto(false)} fullWidth maxWidth="sm" PaperProps={{ style: { borderRadius: "16px", backgroundColor: "#f8fafc" } }}>
                    <DialogTitle style={{ backgroundColor: "#1e293b", color: "white", display: "flex", justifyContent: "space-between", alignItems: "center", padding: "20px" }}>
                        <span style={{ fontWeight: "bold", color: "white" }}>🔍 Secador: Bilhete #{cartelaSelecionada?.numero_bilhete || cartelaSelecionada?.cartela_id}</span>
                        <AppButton label="X" onClick={() => setModalAberto(false)} style={{ background: "rgba(255,255,255,0.1)", border: "none", color: "white", padding: "5px 15px", minWidth: "auto" }} />
                    </DialogTitle>
                    <DialogContent style={{ padding: "20px" }}>
                        <div style={{ textAlign: "center", marginBottom: "20px", color: "#64748b" }}>
                            Palpites de <strong>{cartelaSelecionada?.nome || cartelaSelecionada?.usuario_nome}</strong>
                        </div>
                        {palpitesSecador.length === 0 ? (
                            <Typography style={{ textAlign: "center", color: "#64748b", padding: "30px 0" }}>Nenhum palpite encontrado.</Typography>
                        ) : (
                            palpitesSecador.map((p: any, i: number) => {
                                const jogoFinalizado = p.gols_casa !== null && p.gols_visitante !== null;
                                
                                if (p.palpite_texto) {
                                    const team = teams.find(t => t.nome === p.palpite_texto);
                                    return (
                                        <div key={i} style={{ backgroundColor: 'white', padding: '20px', borderRadius: '12px', marginBottom: '10px', boxShadow: '0 4px 6px rgba(0,0,0,0.05)', textAlign: 'center' }}>
                                            <Typography variant="caption" color="#64748b" fontWeight="bold">APOSTA DIRETA (CAMPEÃO)</Typography>
                                            <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '10px', marginTop: '10px' }}>
                                                <img src={team?.bandeira || team?.logo_url || "/media/escudos-times/default.png"} style={{ width: '40px', height: '28px', objectFit: 'cover', borderRadius: '4px', border: '1px solid #e2e8f0' }} alt="Bandeira" />
                                                <Typography variant="h5" fontWeight="900" color="#1e293b">{p.palpite_texto}</Typography>
                                            </div>
                                        </div>
                                    );
                                }

                                return (
                                    <div key={i} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', backgroundColor: 'white', padding: '15px', borderRadius: '12px', marginBottom: '10px', boxShadow: '0 4px 6px rgba(0,0,0,0.05)' }}>
                                        <div style={{ textAlign: 'center', width: '60px' }}>
                                            <img src={p.logo_casa || "/media/escudos-times/default.png"} alt="casa" style={{ width: '40px', height: '40px', objectFit: 'contain' }} />
                                            <div style={{ fontSize: '13px', fontWeight: 'bold', color: "#1e293b", marginTop: "5px" }}>{p.sigla_casa}</div>
                                        </div>
                                        <div style={{ textAlign: "center" }}>
                                            <div style={{ fontSize: '22px', fontWeight: '900', backgroundColor: '#f1f5f9', padding: '8px 24px', borderRadius: '8px', border: "1px solid #e2e8f0", color: "#1e293b", display: "flex", alignItems: "center", gap: "10px" }}>
                                                {p.palpite_casa} <span style={{ color: "#94a3b8", fontSize: "16px" }}>X</span> {p.palpite_visitante}
                                            </div>
                                            {jogoFinalizado && <div style={{ fontSize: "13px", color: "#059669", fontWeight: "bold", marginTop: "8px", backgroundColor: "#a7f3d0", padding: "4px 12px", borderRadius: "10px" }}>+{p.pontos_ganhos} pts</div>}
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

            {/* STICKY BAR CORRIGIDA */}
            {exibirBarra && (
                <Box sx={{
                    display: { xs: 'flex', md: 'none' }, 
                    position: 'fixed',
                    bottom: 0,
                    left: 0,
                    right: 0,
                    bgcolor: '#1e293b',
                    p: 2,
                    borderTopLeftRadius: 16,
                    borderTopRightRadius: 16,
                    boxShadow: '0 -4px 15px rgba(0,0,0,0.4)',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    zIndex: 1000,
                    borderTop: '3px solid #3b82f6'
                }}>
                    <Box>
                        <Typography variant="caption" sx={{ color: "#cbd5e1", fontWeight: "bold" }}>SUA POSIÇÃO</Typography>
                        <Typography variant="h6" sx={{ color: "#fcd34d", fontWeight: "900", lineHeight: 1 }}>{minhaPosicaoTexto}</Typography>
                    </Box>
                    <Box textAlign="right">
                        <Typography variant="h6" sx={{ color: "white", fontWeight: "900", lineHeight: 1 }}>{meusPontos} pts</Typography>
                        {diferencaPraCima > 0 && (
                            <Typography variant="caption" sx={{ color: "#94a3b8", fontWeight: "bold", display: 'block' }}>
                                Faltam {diferencaPraCima} pts pra subir
                            </Typography>
                        )}
                        {meusPontos === score1 && (
                            <Typography variant="caption" sx={{ color: "#10b981", fontWeight: "bold", display: 'block' }}>
                                Você está no topo! 🏆
                            </Typography>
                        )}
                    </Box>
                </Box>
            )}

        </div>
    );
};

export default Ranking;