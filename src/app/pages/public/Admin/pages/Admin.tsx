import React, { useEffect, useState } from 'react';
import { Button } from 'primereact/button';
import { InputText } from 'primereact/inputtext';
import { Dialog } from 'primereact/dialog';
import { DataTable } from 'primereact/datatable';
import { Column } from 'primereact/column';
import { Dropdown } from 'primereact/dropdown';
import { InputNumber } from 'primereact/inputnumber';
import { useHistory } from 'react-router-dom';

export default function Admin() {
    const history = useHistory();
    const isMobile = window.innerWidth < 768;
    const apiUrl = process.env.REACT_APP_API_URL || 'http://localhost:3001';

    const [rodadas, setRodadas] = useState<any[]>([]);
    const [teams, setTeams] = useState<any[]>([]);
    const selecoesCopa = teams.filter((t) => t.id >= 19 && t.id <= 66);
    const [cartelas, setCartelas] = useState<any[]>([]);
    const [rodadaSelecionada, setRodadaSelecionada] = useState<any>(null);
    const [verArquivadas, setVerArquivadas] = useState(false);
    
    const [jogos, setJogos] = useState<any[]>([]);
    const [resultados, setResultados] = useState<any>({});
    const [editandoJogos, setEditandoJogos] = useState<number[]>([]);
    
    const [exibirDialogCartelas, setExibirDialogCartelas] = useState(false);
    const [exibirDialogTeams, setExibirDialogTeams] = useState(false);

    // NOVO: Estados para o Modal de Visualizar Palpites
    const [exibirDialogPalpites, setExibirDialogPalpites] = useState(false);
    const [palpitesDaCartela, setPalpitesDaCartela] = useState<any[]>([]);
    const [cartelaVisualizando, setCartelaVisualizando] = useState<any>(null);
    const [carregandoPalpites, setCarregandoPalpites] = useState(false);

    const [novaRodada, setNovaRodada] = useState({ nome: '', preco: 20, tipo: 'placares' });
    const [novoTeam, setNovoTeam] = useState({ nome: '', sigla: '', bandeira: '' });
    
    const [novoJogo, setNovoJogo] = useState<any>({
        time_casa_id: null,
        time_visitante_id: null,
        data_hora: ''
    });

    const [campeaoEscolhido, setCampeaoEscolhido] = useState<any>(null);

    const carregarDadosIniciais = () => {
        Promise.all([
            fetch(`${apiUrl}/admin/rodadas-todas`).then(res => res.json()),
            fetch(`${apiUrl}/teams`).then(res => res.json()),
            fetch(`${apiUrl}/admin/cartelas`).then(res => res.json())
        ]).then(([rodadasData, teamsData, cartelasData]) => {
            setRodadas(rodadasData);
            setTeams(teamsData);
            setCartelas(cartelasData);
            
            if (rodadasData.length > 0 && !rodadaSelecionada) {
                const ativa = rodadasData.find((r: any) => r.exibir_no_ranking === true) || rodadasData.find((r: any) => r.status === 'aberta') || rodadasData[0];
                setRodadaSelecionada(ativa);
            } else if (rodadaSelecionada) {
                const atualizada = rodadasData.find((r: any) => r.id === rodadaSelecionada.id);
                setRodadaSelecionada(atualizada);
            }
        });
    };

    useEffect(() => { 
        carregarDadosIniciais(); 
    }, []);

    useEffect(() => {
        if (rodadaSelecionada && rodadaSelecionada.tipo === 'placares') {
            fetch(`${apiUrl}/jogos?rodada_id=${rodadaSelecionada.id}`)
                .then(res => res.json())
                .then(data => {
                    setJogos(data);
                    const resLocais: any = {};
                    data.forEach((j: any) => {
                        if (j.gols_casa !== null && j.gols_visitante !== null) {
                            resLocais[j.id] = { casa: j.gols_casa, visitante: j.gols_visitante };
                        }
                    });
                    setResultados(resLocais);
                });
        }
    }, [rodadaSelecionada, apiUrl]);

    const handleCriarRodada = () => {
        if (!novaRodada.nome) return alert("Dê um nome à rodada!");
        fetch(`${apiUrl}/rodadas`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(novaRodada)
        }).then(() => {
            setNovaRodada({ nome: '', preco: 20, tipo: 'placares' });
            carregarDadosIniciais();
            alert("Rodada criada como RASCUNHO!");
        });
    };

    const alterarStatusRodada = (novoStatus: string) => {
        if (!rodadaSelecionada) return;
        fetch(`${apiUrl}/rodadas/${rodadaSelecionada.id}/status`, { 
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ status: novoStatus })
        }).then(() => {
            alert(`Status da rodada atualizado para: ${novoStatus.toUpperCase()}`);
            if (novoStatus === 'arquivada') setRodadaSelecionada(null);
            carregarDadosIniciais();
        });
    };

    const handleDefinirRodadaRanking = () => {
        if (!rodadaSelecionada) return;
        fetch(`${apiUrl}/admin/definir-ranking`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                rodada_id: rodadaSelecionada.id,
                fixado: !rodadaSelecionada.exibir_no_ranking
            })
        }).then(() => {
            carregarDadosIniciais();
        });
    };

    const handleCadastrarTeam = () => {
        if (!novoTeam.nome || !novoTeam.sigla || !novoTeam.bandeira) return alert("Preencha todos os campos da seleção!");
        fetch(`${apiUrl}/teams`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(novoTeam)
        }).then(() => {
            setNovoTeam({ nome: '', sigla: '', bandeira: '' });
            fetch(`${apiUrl}/teams`).then(res => res.json()).then(setTeams);
            alert("Seleção salva no banco!");
        });
    };

    const handleCadastrarJogo = () => {
        if (!rodadaSelecionada) return;
        if (!novoJogo.time_casa_id || !novoJogo.time_visitante_id) return alert("Selecione os dois times.");

        fetch(`${apiUrl}/cadastrar-jogo`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                rodada_id: rodadaSelecionada.id,
                time_casa_id: novoJogo.time_casa_id,
                time_visitante_id: novoJogo.time_visitante_id,
                data_hora: novoJogo.data_hora ? new Date(novoJogo.data_hora).toISOString() : null
            })
        }).then(() => {
            alert("Confronto cadastrado!");
            setNovoJogo({ time_casa_id: null, time_visitante_id: null, data_hora: '' });
            fetch(`${apiUrl}/jogos?rodada_id=${rodadaSelecionada.id}`).then(res => res.json()).then(setJogos);
        });
    };

    const handleDefinirCampeao = () => {
        if (!campeaoEscolhido) return alert("Selecione a seleção que venceu o campeonato!");
        if (!window.confirm(`Você tem certeza que a seleção '${campeaoEscolhido.nome}' foi a campeã? Isso irá pontuar todos os bilhetes de quem acertou.`)) return;

        fetch(`${apiUrl}/admin/definir-campeao`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                rodada_id: rodadaSelecionada.id,
                campeao: campeaoEscolhido.nome
            })
        }).then(res => res.json()).then(data => {
            alert(data.mensagem || "Campeão definido com sucesso!");
            setCampeaoEscolhido(null);
            carregarDadosIniciais();
        });
    };

    const extrairTimesParaBanco = async () => {
        if (!window.confirm("Isso vai ler todos os times cadastrados nesta rodada e salvá-los no Banco de Dados de Seleções/Times. Deseja continuar?")) return;
        let cadastrados = 0;
        const timesAtuaisNoBanco = [...teams]; 
        for (let jogo of jogos) {
            const tCasa = { nome: jogo.time_casa, sigla: jogo.sigla_casa, bandeira: jogo.logo_casa };
            const tVisitante = { nome: jogo.time_visitante, sigla: jogo.sigla_visitante, bandeira: jogo.logo_visitante };
            for (let t of [tCasa, tVisitante]) {
                if (!timesAtuaisNoBanco.find(cadastrado => cadastrado.nome.toLowerCase() === t.nome.toLowerCase())) {
                    try {
                        await fetch(`${apiUrl}/teams`, {
                            method: 'POST',
                            headers: { 'Content-Type': 'application/json' },
                            body: JSON.stringify(t)
                        });
                        cadastrados++;
                        timesAtuaisNoBanco.push(t); 
                    } catch (e) { console.error("Erro ao salvar time:", e); }
                }
            }
        }
        alert(`${cadastrados} novos times foram salvos no banco!`);
        fetch(`${apiUrl}/teams`).then(res => res.json()).then(setTeams);
    };

    const handleDeletarJogo = (id: number) => {
        if(window.confirm("Excluir a partida? Palpites vinculados a ela também sumirão.")) {
            fetch(`${apiUrl}/deletar-jogo/${id}`, { method: 'DELETE' })
                .then(() => fetch(`${apiUrl}/jogos?rodada_id=${rodadaSelecionada?.id}`).then(res => res.json()).then(setJogos));
        }
    };

    const handleSalvarResultado = (matchId: number) => {
        const resultado = resultados[matchId];
        if (!resultado || resultado.casa === undefined || resultado.casa === "" || resultado.visitante === undefined || resultado.visitante === "") {
            return alert("Preencha o placar corretamente!");
        }

        fetch(`${apiUrl}/finalizar-jogo`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ 
                match_id: matchId, 
                gols_casa: parseInt(resultado.casa, 10), 
                gols_visitante: parseInt(resultado.visitante, 10) 
            })
        }).then(() => {
            alert("Resultado salvo! Pontos calculados.");
            setEditandoJogos(editandoJogos.filter(id => id !== matchId));
            fetch(`${apiUrl}/jogos?rodada_id=${rodadaSelecionada?.id}`).then(res => res.json()).then(setJogos);
        });
    };

    const habilitarEdicao = (jogoId: number) => setEditandoJogos([...editandoJogos, jogoId]);

    const handleTogglePagamento = (cartelaId: number, statusAtual: string) => {
        const novoStatus = statusAtual === 'aprovado' ? 'pendente' : 'aprovado';
        fetch(`${apiUrl}/aprovar-pagamento/${cartelaId}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ status: novoStatus }) 
        }).then(() => fetch(`${apiUrl}/admin/cartelas`).then(res => res.json()).then(setCartelas));
    };

    const handleDeletarCartela = (cartelaId: number) => {
        if (window.confirm(`Excluir permanentemente a Cartela #${cartelaId}?`)) {
            fetch(`${apiUrl}/deletar-cartela/${cartelaId}`, { method: 'DELETE' })
                .then(() => fetch(`${apiUrl}/admin/cartelas`).then(res => res.json()).then(setCartelas));
        }
    };

    // NOVO: Função para buscar e exibir os palpites de um bilhete
    const handleVerPalpites = async (cartela: any) => {
        setCartelaVisualizando(cartela);
        setCarregandoPalpites(true);
        setExibirDialogPalpites(true);

        try {
            const res = await fetch(`${apiUrl}/auditoria`);
            const data = await res.json();
            
            const palpitesDesteBilhete = data.filter((p: any) => 
                p.cartela_id === cartela.id || p.id_cartela === cartela.id
            );
            
            setPalpitesDaCartela(palpitesDesteBilhete);
        } catch (err) {
            alert("Erro ao buscar detalhes do bilhete.");
        } finally {
            setCarregandoPalpites(false);
        }
    };

    const formatarData = (d: string) => {
        if (!d) return '';
        const data = new Date(d);
        return isNaN(data.getTime()) ? d : data.toLocaleString('pt-BR', { day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit' });
    };

    const rodadasVisiveis = verArquivadas ? rodadas.filter(r => r.status === 'arquivada') : rodadas.filter(r => r.status !== 'arquivada');
    const tiposRodada = [{ label: 'Confrontos (Placares)', value: 'placares' }, { label: 'Tiro Curto (Campeão)', value: 'campeao' }];
    const cartelasDaRodada = cartelas.filter(c => c.rodada_nome === rodadaSelecionada?.nome);
    const cartelasAprovadas = cartelasDaRodada.filter(c => c.status_pagamento === 'aprovado');
    const cartelasPendentes = cartelasDaRodada.filter(c => c.status_pagamento === 'pendente');
    
    const precoRodadaAtual = rodadaSelecionada ? Number(rodadaSelecionada.preco) : 20;
    const valorBruto = cartelasAprovadas.length * precoRodadaAtual;

    const statusBadgeTemplate = (r: any) => {
        const isAprovado = r.status_pagamento === 'aprovado';
        return (
            <span style={{ backgroundColor: isAprovado ? '#dcfce7' : '#fef3c7', color: isAprovado ? '#166534' : '#92400e', padding: '4px 8px', borderRadius: '6px', fontWeight: 'bold', fontSize: '11px', letterSpacing: '0.5px' }}>
                {r.status_pagamento.toUpperCase()}
            </span>
        );
    };

    return (
        <div style={{ padding: isMobile ? '15px' : '30px', minHeight: '100vh', backgroundColor: '#f4f6f9', color: '#333' }}>
            <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
                
                {/* CABEÇALHO RESPONSIVO */}
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: isMobile ? 'stretch' : 'center', flexDirection: isMobile ? 'column' : 'row', gap: '15px', marginBottom: '30px', backgroundColor: 'white', padding: isMobile ? '15px' : '20px', borderRadius: '12px', boxShadow: '0 4px 10px rgba(0,0,0,0.05)' }}>
                    <Button label="🚪 Sair do Admin" onClick={() => history.push('/public')} className="p-button-text p-button-secondary" style={{ width: isMobile ? '100%' : 'auto' }} />
                    <h1 style={{ margin: 0, fontSize: isMobile ? '20px' : '22px', textAlign: 'center' }}>🛡️ Painel Admin</h1>
                    <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap', width: isMobile ? '100%' : 'auto' }}>
                        <Button label={verArquivadas ? "⬅️ Ativas" : "🗄️ Arquivadas"} severity={verArquivadas ? "success" : "secondary"} outlined onClick={() => { setVerArquivadas(!verArquivadas); setRodadaSelecionada(null); }} style={{ flex: 1 }} />
                        <Button label="🚩 Times" onClick={() => setExibirDialogTeams(true)} severity="info" style={{ flex: 1 }} />
                        <Button label="🎟️ Bilhetes" onClick={() => { fetch(`${apiUrl}/admin/cartelas`).then(res => res.json()).then(setCartelas); setExibirDialogCartelas(true); }} severity="help" style={{ flex: 1 }} />
                    </div>
                </div>

                {/* DASHBOARD FINANCEIRO RESPONSIVO */}
                <div style={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr' : 'repeat(auto-fit, minmax(250px, 1fr))', gap: '20px', marginBottom: '30px' }}>
                    <div style={{ backgroundColor: '#eff6ff', border: '1px solid #3b82f6', padding: '20px', borderRadius: '12px', textAlign: 'center' }}>
                        <div style={{ color: '#1e40af', fontWeight: 'bold', fontSize: '14px', marginBottom: '5px' }}>🛡️ SEU LUCRO (10%)</div>
                        <div style={{ color: '#1e3a8a', fontWeight: '900', fontSize: '28px' }}>{(valorBruto * 0.10).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}</div>
                        <div style={{ color: '#3b82f6', fontSize: '13px', marginTop: '5px' }}>Na rodada: {rodadaSelecionada?.nome || "---"}</div>
                    </div>
                    <div style={{ backgroundColor: '#ecfdf5', border: '1px solid #10b981', padding: '20px', borderRadius: '12px', textAlign: 'center' }}>
                        <div style={{ color: '#047857', fontWeight: 'bold', fontSize: '14px', marginBottom: '5px' }}>🏆 PRÊMIO (90%)</div>
                        <div style={{ color: '#065f46', fontWeight: '900', fontSize: '28px' }}>{(valorBruto * 0.90).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}</div>
                        <div style={{ color: '#059669', fontSize: '13px', marginTop: '5px' }}>Valor do pódio</div>
                    </div>
                    <div style={{ backgroundColor: '#fffbeb', border: '1px solid #f59e0b', padding: '20px', borderRadius: '12px', textAlign: 'center' }}>
                        <div style={{ color: '#b45309', fontWeight: 'bold', fontSize: '14px', marginBottom: '5px' }}>⏳ AGUARDANDO PIX</div>
                        <div style={{ color: '#d97706', fontWeight: '900', fontSize: '28px' }}>{(cartelasPendentes.length * precoRodadaAtual).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}</div>
                        <div style={{ color: '#b45309', fontSize: '13px', marginTop: '5px' }}>{cartelasPendentes.length} bilhetes pendentes</div>
                    </div>
                </div>

                {/* BLOCO 1: GESTÃO DE RODADAS */}
                <div style={{ backgroundColor: 'white', padding: '20px', borderRadius: '12px', marginBottom: '30px', boxShadow: '0 4px 10px rgba(0,0,0,0.05)', borderTop: verArquivadas ? '4px solid #475569' : 'none' }}>
                    <h3 style={{ margin: '0 0 15px 0' }}>{verArquivadas ? "🗄️ Arquivo de Rodadas Antigas" : "Gestão de Rodadas e Eventos"}</h3>
                    
                    <div style={{ display: 'flex', flexDirection: isMobile ? 'column' : 'row', gap: '20px', flexWrap: 'wrap', alignItems: isMobile ? 'stretch' : 'center', borderBottom: '1px solid #e2e8f0', paddingBottom: '20px', marginBottom: '20px' }}>
                        <div style={{ display: 'flex', alignItems: 'center', flexWrap: 'wrap', gap: '10px' }}>
                            <Dropdown value={rodadaSelecionada} options={rodadasVisiveis} onChange={(e) => setRodadaSelecionada(e.value)} optionLabel="nome" placeholder="Selecione" style={{ width: isMobile ? '100%' : '250px' }} />
                            {rodadaSelecionada && (
                                <span style={{ padding: '5px 10px', borderRadius: '5px', fontSize: '12px', fontWeight: 'bold', backgroundColor: rodadaSelecionada.status === 'aberta' ? '#dcfce7' : rodadaSelecionada.status === 'pausada' ? '#fef9c3' : rodadaSelecionada.status === 'finalizada' ? '#f1f5f9' : rodadaSelecionada.status === 'arquivada' ? '#fee2e2' : '#e2e8f0', color: rodadaSelecionada.status === 'aberta' ? '#16a34a' : rodadaSelecionada.status === 'pausada' ? '#b45309' : rodadaSelecionada.status === 'finalizada' ? '#64748b' : rodadaSelecionada.status === 'arquivada' ? '#dc2626' : '#475569' }}>
                                    {rodadaSelecionada.status.toUpperCase()}
                                </span>
                            )}
                            {rodadaSelecionada?.exibir_no_ranking && (
                                <span style={{ backgroundColor: '#e0f2fe', color: '#0369a1', padding: '5px 10px', borderRadius: '5px', fontSize: '12px', fontWeight: 'bold' }}>
                                    ⭐ RANKING FIXADO
                                </span>
                            )}
                        </div>

                        <div style={{ marginLeft: isMobile ? 0 : 'auto', display: 'flex', gap: '10px', flexWrap: 'wrap', width: isMobile ? '100%' : 'auto' }}>
                            {rodadaSelecionada && rodadaSelecionada.status !== 'arquivada' && (
                                <Button label={rodadaSelecionada?.exibir_no_ranking ? "❌ Desfixar" : "⭐ Fixar"} severity={rodadaSelecionada?.exibir_no_ranking ? "danger" : "info"} onClick={handleDefinirRodadaRanking} style={{ flex: isMobile ? 1 : 'none' }} />
                            )}
                            {rodadaSelecionada?.status === 'rascunho' && <Button label="🟢 Abrir" severity="success" onClick={() => alterarStatusRodada('aberta')} style={{ flex: isMobile ? 1 : 'none' }} />}
                            {rodadaSelecionada?.status === 'aberta' && (
                                <>
                                    <Button label="⏸️ Pausar" severity="warning" onClick={() => alterarStatusRodada('pausada')} style={{ flex: isMobile ? 1 : 'none' }} />
                                    <Button label="🏁 Encerrar" severity="danger" onClick={() => { if (window.confirm("Encerrar rodada?")) alterarStatusRodada('finalizada'); }} style={{ flex: isMobile ? 1 : 'none' }} />
                                </>
                            )}
                            {rodadaSelecionada?.status === 'pausada' && (
                                <>
                                    <Button label="🔓 Reabrir" severity="success" onClick={() => alterarStatusRodada('aberta')} style={{ flex: isMobile ? 1 : 'none' }} />
                                    <Button label="🏁 Encerrar" severity="danger" onClick={() => { if (window.confirm("Encerrar rodada?")) alterarStatusRodada('finalizada'); }} style={{ flex: isMobile ? 1 : 'none' }} />
                                </>
                            )}
                            {rodadaSelecionada?.status === 'finalizada' && (
                                <Button label="📦 Arquivar" severity="secondary" onClick={() => { if (window.confirm("Arquivar rodada?")) alterarStatusRodada('arquivada'); }} style={{ flex: isMobile ? 1 : 'none' }} />
                            )}
                        </div>
                    </div>

                    {!verArquivadas && (
                        <div style={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr' : '1fr 130px 220px auto', gap: '15px', alignItems: 'flex-end', backgroundColor: '#f8fafc', padding: '15px', borderRadius: '8px' }}>
                            <div style={{ width: '100%' }}>
                                <label style={{ display: 'block', fontSize: '12px', fontWeight: 'bold', marginBottom: '5px' }}>NOME DA NOVA RODADA</label>
                                <InputText value={novaRodada.nome} onChange={(e) => setNovaRodada({...novaRodada, nome: e.target.value})} placeholder="Ex: Oitavas" style={{ width: '100%' }} />
                            </div>
                            <div style={{ width: '100%' }}>
                                <label style={{ display: 'block', fontSize: '12px', fontWeight: 'bold', marginBottom: '5px' }}>VALOR (R$)</label>
                                <InputNumber value={novaRodada.preco} onValueChange={(e) => setNovaRodada({...novaRodada, preco: e.value || 0})} mode="currency" currency="BRL" locale="pt-BR" style={{ width: '100%' }} />
                            </div>
                            <div style={{ width: '100%' }}>
                                <label style={{ display: 'block', fontSize: '12px', fontWeight: 'bold', marginBottom: '5px' }}>TIPO DE APOSTA</label>
                                <Dropdown value={novaRodada.tipo} options={tiposRodada} onChange={(e) => setNovaRodada({...novaRodada, tipo: e.value})} style={{ width: '100%' }} />
                            </div>
                            <Button label="➕ Criar" onClick={handleCriarRodada} severity="success" outlined style={{ width: '100%' }} />
                        </div>
                    )}
                </div>

                {/* BLOCO 2: GESTÃO DE JOGOS */}
                {rodadaSelecionada && (
                    <div style={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr' : '400px 1fr', gap: '20px', alignItems: 'flex-start' }}>
                        
                        {/* COLUNA ESQUERDA: CADASTRAR JOGO OU DEFINIR CAMPEÃO */}
                        <div style={{ backgroundColor: 'white', padding: '25px', borderRadius: '12px', boxShadow: '0 4px 10px rgba(0,0,0,0.05)' }}>
                            {rodadaSelecionada.tipo === 'placares' ? (
                                <>
                                    <h3 style={{ marginTop: 0 }}>⚽ Adicionar Jogo</h3>
                                    <div style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
                                        <Dropdown value={novoJogo.time_casa_id} options={teams} optionLabel="nome" optionValue="id" onChange={(e) => setNovoJogo({ ...novoJogo, time_casa_id: e.value })} placeholder="Time da casa" style={{ width: '100%' }} filter />
                                        <div style={{ textAlign: 'center', fontWeight: 'bold', color: '#94a3b8' }}>X</div>
                                        <Dropdown value={novoJogo.time_visitante_id} options={teams} optionLabel="nome" optionValue="id" onChange={(e) => setNovoJogo({ ...novoJogo, time_visitante_id: e.value })} placeholder="Time visitante" style={{ width: '100%' }} filter />
                                        <input type="datetime-local" value={novoJogo.data_hora} onChange={(e) => setNovoJogo({...novoJogo, data_hora: e.target.value})} style={{ padding: '0.75rem', borderRadius: '6px', border: '1px solid #ced4da', width: '100%', fontFamily: 'inherit' }} />
                                        <Button label="💾 Salvar Confronto" onClick={handleCadastrarJogo} />
                                    </div>
                                </>
                            ) : (
                                <>
                                    <h3 style={{ marginTop: 0 }}>🏆 Definir Campeão</h3>
                                    <p style={{ color: '#64748b', fontSize: '13px' }}>Selecione a seleção que venceu para pontuar os bilhetes.</p>
                                    <div style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
                                        <Dropdown value={campeaoEscolhido} options={teams} optionLabel="nome" onChange={(e) => setCampeaoEscolhido(e.value)} placeholder="Seleção Vencedora" style={{ width: '100%' }} filter />
                                        <Button label="👑 Confirmar Campeão" severity="success" onClick={handleDefinirCampeao} />
                                    </div>
                                </>
                            )}
                        </div>

                        {/* COLUNA DIREITA: LISTA DE JOGOS */}
                        {rodadaSelecionada.tipo === 'placares' && (
                            <div>
                                {jogos.length > 0 && (
                                    <div style={{ textAlign: 'right', marginBottom: '10px' }}>
                                        <Button label="💾 Extrair Times" severity="warning" size="small" onClick={extrairTimesParaBanco} />
                                    </div>
                                )}
                                {jogos.length === 0 && <p>Nenhum jogo cadastrado.</p>}
                                
                                {jogos.map(jogo => {
                                    const temResultadoFinalizado = jogo.gols_casa !== null && jogo.gols_visitante !== null;
                                    const estaEditando = editandoJogos.includes(jogo.id);
                                    const mostrarFixo = temResultadoFinalizado && !estaEditando;

                                    return (
                                        <div key={jogo.id} style={{ backgroundColor: 'white', marginBottom: '15px', borderRadius: '12px', padding: '15px', boxShadow: '0 4px 10px rgba(0,0,0,0.05)' }}>
                                            <div style={{ textAlign: 'center', color: '#64748b', fontSize: '12px', fontWeight: 'bold', marginBottom: '10px' }}>📅 {formatarData(jogo.data_hora)}</div>
                                            <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: isMobile ? '8px' : '15px', marginBottom: '15px', flexWrap: 'wrap' }}>
                                                <div style={{ textAlign: 'center', width: '70px' }}>
                                                    <img src={jogo.logo_casa || "/media/escudos-times/default.png"} alt="logo" style={{ width: '40px', height: '40px', objectFit: 'contain' }} />
                                                    <div style={{ fontWeight: 'bold', fontSize: '12px' }}>{jogo.sigla_casa}</div>
                                                </div>

                                                {mostrarFixo ? (
                                                    <div style={{ fontSize: '24px', fontWeight: '900', color: '#1e293b', display: 'flex', gap: '10px' }}>
                                                        <span>{jogo.gols_casa}</span><span style={{ color: '#94a3b8' }}>X</span><span>{jogo.gols_visitante}</span>
                                                    </div>
                                                ) : (
                                                    <div style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
                                                        <input type="number" min="0" value={resultados[jogo.id]?.casa ?? ""} onChange={(e) => setResultados({...resultados, [jogo.id]: {...resultados[jogo.id], casa: e.target.value}})} style={{ width: isMobile ? '40px' : '50px', height: '40px', textAlign: 'center', fontSize: '20px', fontWeight: 'bold', borderRadius: '6px', border: '1px solid #cbd5e1' }} />
                                                        <span style={{ fontWeight: 'bold', color: '#94a3b8' }}>X</span>
                                                        <input type="number" min="0" value={resultados[jogo.id]?.visitante ?? ""} onChange={(e) => setResultados({...resultados, [jogo.id]: {...resultados[jogo.id], visitante: e.target.value}})} style={{ width: isMobile ? '40px' : '50px', height: '40px', textAlign: 'center', fontSize: '20px', fontWeight: 'bold', borderRadius: '6px', border: '1px solid #cbd5e1' }} />
                                                    </div>
                                                )}

                                                <div style={{ textAlign: 'center', width: '70px' }}>
                                                    <img src={jogo.logo_visitante || "/media/escudos-times/default.png"} alt="logo" style={{ width: '40px', height: '40px', objectFit: 'contain' }} />
                                                    <div style={{ fontWeight: 'bold', fontSize: '12px' }}>{jogo.sigla_visitante}</div>
                                                </div>
                                            </div>

                                            <div style={{ display: 'flex', justifyContent: 'center', gap: '10px', flexWrap: 'wrap' }}>
                                                {mostrarFixo ? (
                                                    <Button label="✏️ Editar Placar" severity="info" size="small" onClick={() => habilitarEdicao(jogo.id)} />
                                                ) : (
                                                    <>
                                                        <Button label="✅ Salvar" severity="success" size="small" onClick={() => handleSalvarResultado(jogo.id)} />
                                                        {!estaEditando && <Button label="🗑️ Excluir" severity="danger" outlined size="small" onClick={() => handleDeletarJogo(jogo.id)} />}
                                                    </>
                                                )}
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        )}
                    </div>
                )}
            </div>

            {/* MODAL DE CADASTRAR TIMES */}
            <Dialog header="🚩 Cadastrar Time/Seleção" visible={exibirDialogTeams} style={{ width: isMobile ? '95vw' : '400px' }} onHide={() => setExibirDialogTeams(false)}>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', paddingTop: '10px' }}>
                    <InputText placeholder="Nome do Time/País" value={novoTeam.nome} onChange={(e) => setNovoTeam({...novoTeam, nome: e.target.value})} />
                    <InputText placeholder="Sigla (3 Letras)" maxLength={3} value={novoTeam.sigla} onChange={(e) => setNovoTeam({...novoTeam, sigla: e.target.value.toUpperCase()})} />
                    <InputText placeholder="URL da Bandeira/Escudo" value={novoTeam.bandeira} onChange={(e) => setNovoTeam({...novoTeam, bandeira: e.target.value})} />
                    <Button label="💾 Salvar no Banco" onClick={handleCadastrarTeam} severity="success" />
                </div>
            </Dialog>

            {/* MODAL DE BILHETES EMITIDOS */}
            <Dialog header="🎟️ Bilhetes Emitidos" visible={exibirDialogCartelas} style={{ width: isMobile ? '98vw' : '80vw' }} onHide={() => setExibirDialogCartelas(false)}>
                <DataTable value={cartelasDaRodada} paginator rows={10} responsiveLayout="scroll" scrollable emptyMessage="Nenhum bilhete encontrado.">
                    <Column field="numero_bilhete" header="Nº" body={(r) => <b>#{r.numero_bilhete || r.id}</b>} />
                    <Column field="usuario_nome" header="Usuário" />
                    <Column field="rodada_nome" header="Rodada" />
                    <Column field="status_pagamento" header="Status" body={statusBadgeTemplate} />
                    <Column header="Ações" body={(r) => (
                        <div style={{ display: 'flex', gap: '5px', flexWrap: 'wrap' }}>
                            <Button 
                                icon="pi pi-eye" 
                                tooltip="Ver Palpites" 
                                tooltipOptions={{ position: 'top' }}
                                severity="info" 
                                onClick={() => handleVerPalpites(r)} 
                                style={{ padding: '5px', width: '35px', height: '35px' }} 
                            />
                            <Button 
                                label={r.status_pagamento === 'aprovado' ? "" : "Aprovar"} 
                                icon={r.status_pagamento === 'aprovado' ? "pi pi-undo" : ""}
                                tooltip={r.status_pagamento === 'aprovado' ? "Tornar Pendente" : ""}
                                severity={r.status_pagamento === 'aprovado' ? "warning" : "success"}
                                onClick={() => handleTogglePagamento(r.id, r.status_pagamento)}
                                style={{ padding: '5px 10px', fontSize: '11px', height: '35px' }}
                            />
                            <Button 
                                icon="pi pi-trash" 
                                tooltip="Excluir Bilhete"
                                severity="danger" 
                                onClick={() => handleDeletarCartela(r.id)} 
                                style={{ padding: '5px', width: '35px', height: '35px' }} 
                            />
                        </div>
                    )} />
                </DataTable>
            </Dialog>

            {/* NOVO: MODAL DE VISUALIZAR PALPITES DA PESSOA */}
            <Dialog 
                header={`🔍 Palpites do Bilhete #${cartelaVisualizando?.numero_bilhete || cartelaVisualizando?.id}`} 
                visible={exibirDialogPalpites} 
                style={{ width: isMobile ? '95vw' : '450px' }} 
                onHide={() => setExibirDialogPalpites(false)}
            >
                {carregandoPalpites ? (
                    <div style={{ textAlign: 'center', padding: '20px' }}><i className="pi pi-spin pi-spinner" style={{ fontSize: '2rem' }}></i></div>
                ) : palpitesDaCartela.length === 0 ? (
                    <div style={{ textAlign: 'center', padding: '20px', color: '#64748b' }}>Nenhum palpite registrado neste bilhete.</div>
                ) : (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                        <div style={{ marginBottom: '10px', fontSize: '14px', color: '#1e293b' }}>
                            Apostador(a): <strong>{cartelaVisualizando?.usuario_nome}</strong>
                        </div>
                        {palpitesDaCartela.map((p, i) => (
                            <div key={i} style={{ backgroundColor: '#f8fafc', padding: '15px', borderRadius: '8px', border: '1px solid #e2e8f0' }}>
                                {p.palpite_texto ? (
                                    <div style={{ textAlign: 'center' }}>
                                        <div style={{ fontSize: '11px', color: '#64748b', fontWeight: 'bold', marginBottom: '5px' }}>APOSTA NO CAMPEÃO</div>
                                        <div style={{ fontSize: '20px', fontWeight: '900', color: '#1e293b' }}>{p.palpite_texto}</div>
                                    </div>
                                ) : (
                                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                        <div style={{ fontWeight: 'bold', fontSize: '13px', width: '40%', textAlign: 'right' }}>{p.time_casa}</div>
                                        <div style={{ backgroundColor: 'white', padding: '6px 12px', borderRadius: '6px', border: '2px solid #cbd5e1', fontWeight: '900', fontSize: '16px', color: '#0f172a' }}>
                                            {p.palpite_casa} <span style={{ color: '#94a3b8', margin: '0 4px' }}>x</span> {p.palpite_visitante}
                                        </div>
                                        <div style={{ fontWeight: 'bold', fontSize: '13px', width: '40%', textAlign: 'left' }}>{p.time_visitante}</div>
                                    </div>
                                )}
                            </div>
                        ))}
                    </div>
                )}
            </Dialog>

        </div>
    );
}