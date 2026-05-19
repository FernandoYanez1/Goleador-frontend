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
    const apiUrl = process.env.REACT_APP_API_URL || 'http://localhost:3001';

    const [rodadas, setRodadas] = useState<any[]>([]);
    const [teams, setTeams] = useState<any[]>([]);
    const [cartelas, setCartelas] = useState<any[]>([]);
    const [rodadaSelecionada, setRodadaSelecionada] = useState<any>(null);
    const [jogos, setJogos] = useState<any[]>([]);
    const [resultados, setResultados] = useState<any>({});
    const [editandoJogos, setEditandoJogos] = useState<number[]>([]);
    
    const [exibirDialogCartelas, setExibirDialogCartelas] = useState(false);
    const [exibirDialogTeams, setExibirDialogTeams] = useState(false);

    const [novaRodada, setNovaRodada] = useState({ nome: '', preco: 20, tipo: 'placares' });
    const [novoTeam, setNovoTeam] = useState({ nome: '', sigla: '', bandeira: '' });
    const [novoJogo, setNovoJogo] = useState<any>({
        time_casa: '', time_visitante: '', sigla_casa: '', sigla_visitante: '', logo_casa: '', logo_visitante: '', data_hora: ''
    });

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
                setRodadaSelecionada(rodadasData[0]);
            } else if (rodadaSelecionada) {
                const atualizada = rodadasData.find((r: any) => r.id === rodadaSelecionada.id);
                if (atualizada) setRodadaSelecionada(atualizada);
            }
        });
    };

    useEffect(() => { carregarDadosIniciais(); }, []);

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
    }, [rodadaSelecionada]);

    const handleCriarRodada = () => {
        if (!novaRodada.nome) return alert("Defina o rótulo do evento!");
        fetch(`${apiUrl}/rodadas`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(novaRodada)
        }).then(() => {
            setNovaRodada({ nome: '', preco: 20, tipo: 'placares' });
            carregarDadosIniciais();
            alert("Criada como Rascunho com sucesso!");
        });
    };

    const alterarStatusRodada = (novoStatus: string) => {
        if (!rodadaSelecionada) return;
        fetch(`${apiUrl}/rodadas/${rodadaSelecionada.id}/status`, { 
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ status: novoStatus })
        }).then(() => {
            alert(`Estado alterado para: ${novoStatus.toUpperCase()}`);
            carregarDadosIniciais();
        });
    };

    const handleDefinirRodadaRanking = () => {
        if (!rodadaSelecionada) return;
        fetch(`${apiUrl}/admin/definir-ranking`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ rodada_id: rodadaSelecionada.id })
        }).then(() => {
            alert("Ranking fixado com sucesso!");
            carregarDadosIniciais();
        });
    };

    const handleCadastrarTeam = () => {
        if (!novoTeam.nome || !novoTeam.sigla) return alert("Campos incompletos.");
        fetch(`${apiUrl}/teams`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(novoTeam)
        }).then(() => {
            setNovoTeam({ nome: '', sigla: '', bandeira: '' });
            fetch(`${apiUrl}/teams`).then(res => res.json()).then(setTeams);
        });
    };

    const selecionarTimeNoJogo = (lado: 'casa' | 'visitante', timeObj: any) => {
        if (!timeObj) return;
        if (lado === 'casa') {
            setNovoJogo({ ...novoJogo, time_casa: timeObj.nome, sigla_casa: timeObj.sigla, logo_casa: timeObj.bandeira });
        } else {
            setNovoJogo({ ...novoJogo, time_visitante: timeObj.nome, sigla_visitante: timeObj.sigla, logo_visitante: timeObj.bandeira });
        }
    };

    const handleCadastrarJogo = () => {
        fetch(`${apiUrl}/cadastrar-jogo`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ ...novoJogo, rodada_id: rodadaSelecionada.id })
        }).then(() => {
            setNovoJogo({ time_casa: '', time_visitante: '', sigla_casa: '', sigla_visitante: '', logo_casa: '', logo_visitante: '', data_hora: '' });
            fetch(`${apiUrl}/jogos?rodada_id=${rodadaSelecionada.id}`).then(res => res.json()).then(setJogos);
        });
    };

    const handleSalvarResultado = (matchId: number) => {
        const resJogo = resultados[matchId];
        fetch(`${apiUrl}/finalizar-jogo`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ match_id: matchId, gols_casa: resJogo.casa, gols_visitante: resJogo.visitante })
        }).then(() => {
            setEditandoJogos(editandoJogos.filter(id => id !== matchId));
            fetch(`${apiUrl}/jogos?rodada_id=${rodadaSelecionada.id}`).then(res => res.json()).then(setJogos);
        });
    };

    const cartelasDaRodada = cartelas.filter(c => c.rodada_nome === rodadaSelecionada?.nome);
    const aprovadas = cartelasDaRodada.filter(c => c.status_pagamento === 'aprovado');
    const precoMv = rodadaSelecionada ? Number(rodadaSelecionada.preco) : 20;

    return (
        <div style={{ padding: '30px', minHeight: '100vh', backgroundColor: '#f4f6f9', color: '#333' }}>
            <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
                
                {/* HEADBOARD */}
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '30px', backgroundColor: 'white', padding: '15px 20px', borderRadius: '12px', boxShadow: '0 4px 10px rgba(0,0,0,0.05)' }}>
                    <Button label="Sair" icon="pi pi-sign-out" onClick={() => history.push('/public')} className="p-button-text p-button-secondary" />
                    <h2 style={{ margin: 0 }}>🛡️ Central Admin Goleador</h2>
                    <div style={{ display: 'flex', gap: '10px' }}>
                        <Button label="Seleções" icon="pi pi-flag" onClick={() => setExibirDialogTeams(true)} severity="info" />
                        <Button label="Bilhetes" icon="pi pi-ticket" onClick={() => setExibirDialogCartelas(true)} severity="help" />
                    </div>
                </div>

                {/* MÉTRICAS */}
                <div style={{ display: 'flex', gap: '20px', marginBottom: '30px' }}>
                    <div style={{ flex: 1, backgroundColor: '#eff6ff', padding: '20px', borderRadius: '12px', textAlign: 'center', border: '1px solid #3b82f6' }}>
                        <span style={{ fontWeight: 'bold', fontSize: '13px' }}>💼 NET SPREAD COMISSÃO (10%)</span>
                        <h2 style={{ margin: '5px 0 0 0' }}>{(aprovadas.length * precoMv * 0.1).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}</h2>
                    </div>
                    <div style={{ flex: 1, backgroundColor: '#ecfdf5', padding: '20px', borderRadius: '12px', textAlign: 'center', border: '1px solid #10b981' }}>
                        <span style={{ fontWeight: 'bold', fontSize: '13px' }}>🏆 POOL PREMIAÇÃO LÍQUIDA (90%)</span>
                        <h2 style={{ margin: '5px 0 0 0' }}>{(aprovadas.length * precoMv * 0.9).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}</h2>
                    </div>
                </div>

                {/* PAINEL DE CONTROLE DE FLUXO */}
                <div style={{ backgroundColor: 'white', padding: '25px', borderRadius: '12px', marginBottom: '30px', boxShadow: '0 4px 10px rgba(0,0,0,0.05)' }}>
                    <h3 style={{ marginTop: 0 }}>🎛️ Fluxo Operacional do Evento</h3>
                    
                    <div style={{ display: 'flex', gap: '15px', alignItems: 'center', flexWrap: 'wrap', borderBottom: '1px solid #e2e8f0', paddingBottom: '20px', marginBottom: '20px' }}>
                        <Dropdown value={rodadaSelecionada} options={rodadas} onChange={(e) => setRodadaSelecionada(e.value)} optionLabel="nome" style={{ width: '250px' }} />
                        
                        {rodadaSelecionada && (
                            <span style={{ padding: '6px 12px', borderRadius: '6px', fontSize: '12px', fontWeight: 'bold', 
                                backgroundColor: rodadaSelecionada.status === 'aberta' ? '#dcfce7' : rodadaSelecionada.status === 'pausada' ? '#dbeafe' : rodadaSelecionada.status === 'arquivada' ? '#fee2e2' : '#f1f5f9',
                                color: rodadaSelecionada.status === 'aberta' ? '#16a34a' : rodadaSelecionada.status === 'pausada' ? '#2563eb' : rodadaSelecionada.status === 'arquivada' ? '#dc2626' : '#475569' }}>
                                STATUS: {rodadaSelecionada.status.toUpperCase()}
                            </span>
                        )}

                        {/* ESTEIRA DE COMANDO DINÂMICA */}
                        <div style={{ marginLeft: 'auto', display: 'flex', gap: '8px' }}>
                            <Button label="Fixar no Ranking" icon="pi pi-star" severity="info" size="small" onClick={handleDefinirRodadaRanking} />
                            
                            {rodadaSelecionada?.status === 'rascunho' && <Button label="Abrir Rodada" icon="pi pi-play" severity="success" size="small" onClick={() => alterarStatusRodada('aberta')} />}
                            {rodadaSelecionada?.status === 'aberta' && <Button label="Pausar Apostas" icon="pi pi-pause" severity="warning" size="small" onClick={() => alterarStatusRodada('pausada')} />}
                            {rodadaSelecionada?.status === 'pausada' && (
                                <>
                                    <Button label="Reabrir Apostas" icon="pi pi-refresh" severity="success" size="small" onClick={() => alterarStatusRodada('aberta')} />
                                    <Button label="Arquivar Tudo" icon="pi pi-box" severity="danger" size="small" onClick={() => { if(window.confirm("Arquivar rodada? Ela sumirá do ar para os usuários ordinários.")) alterarStatusRodada('arquivada'); }} />
                                </>
                            )}
                        </div>
                    </div>

                    {/* REGISTRO RÁPIDO */}
                    <div style={{ display: 'flex', gap: '15px', alignItems: 'flex-end', backgroundColor: '#f8fafc', padding: '15px', borderRadius: '8px' }}>
                        <div style={{ flex: 1 }}><InputText value={novaRodada.nome} onChange={(e) => setNovaRodada({...novaRodada, nome: e.target.value})} placeholder="Nome do Evento" style={{ width: '100%' }} /></div>
                        <div style={{ width: '120px' }}><InputNumber value={novaRodada.preco} onValueChange={(e) => setNovaRodada({...novaRodada, preco: e.value || 20})} mode="currency" currency="BRL" locale="pt-BR" /></div>
                        <div style={{ width: '180px' }}><Dropdown value={novaRodada.tipo} options={[{label:'Placares', value:'placares'},{label:'Campeão', value:'campeao'}]} onChange={(e) => setNovaRodada({...novaRodada, tipo: e.value})} style={{ width: '100%' }} /></div>
                        <Button label="Criar Desafio" onClick={handleCriarRodada} severity="success" outlined />
                    </div>
                </div>

                {/* CONFRONTOS INTERATIVOS */}
                {rodadaSelecionada?.tipo === 'placares' && (
                    <div style={{ display: 'flex', gap: '20px', flexWrap: 'wrap' }}>
                        <div style={{ flex: '1 1 400px', backgroundColor: 'white', padding: '20px', borderRadius: '12px' }}>
                            <h3>🎯 Adicionar Jogo</h3>
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                                <Dropdown options={teams} optionLabel="nome" placeholder="Mandante" filter onChange={(e) => selecionarTimeNoJogo('casa', e.value)} />
                                <Dropdown options={teams} optionLabel="nome" placeholder="Visitante" filter onChange={(e) => selecionarTimeNoJogo('visitante', e.value)} />
                                <input type="datetime-local" value={novoJogo.data_hora} onChange={(e) => setNovoJogo({...novoJogo, data_hora: e.target.value})} style={{ padding: '10px', borderRadius: '6px', border: '1px solid #ddd' }} />
                                <Button label="Cadastrar Jogo" onClick={handleCadastrarJogo} />
                            </div>
                        </div>

                        <div style={{ flex: '1 1 500px' }}>
                            {jogos.map(jogo => (
                                <div key={jogo.id} style={{ backgroundColor: 'white', padding: '15px', borderRadius: '12px', marginBottom: '10px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                    <span>{jogo.time_casa} <b>X</b> {jogo.time_visitante}</span>
                                    {editandoJogos.includes(jogo.id) || (jogo.gols_casa === null) ? (
                                        <div style={{ display: 'flex', gap: '5px' }}>
                                            <input type="number" style={{ width: '40px', textAlign: 'center' }} onChange={(e) => setResultados({...resultados, [jogo.id]: {...resultados[jogo.id], casa: e.target.value}})} />
                                            <input type="number" style={{ width: '40px', textAlign: 'center' }} onChange={(e) => setResultados({...resultados, [jogo.id]: {...resultados[jogo.id], visitante: e.target.value}})} />
                                            <Button icon="pi pi-check" severity="success" onClick={() => handleSalvarResultado(jogo.id)} />
                                        </div>
                                    ) : (
                                        <div>
                                            <b>{jogo.gols_casa} x {jogo.gols_visitante}</b>
                                            <Button icon="pi pi-pencil" className="p-button-text" onClick={() => setEditandoJogos([...editandoJogos, jogo.id])} />
                                        </div>
                                    )}
                                </div>
                            ))}
                        </div>
                    </div>
                )}
            </div>

            {/* MODAIS ADICIONAIS */}
            <Dialog header="🚩 Seleções" visible={exibirDialogTeams} style={{ width: '400px' }} onHide={() => setExibirDialogTeams(false)}>
                {/* Linha que estava dando erro foi corrigida aqui (paddingTop: '10px') */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', paddingTop: '10px' }}>
                    <InputText placeholder="Nome" value={novoTeam.nome} onChange={(e) => setNovoTeam({...novoTeam, nome: e.target.value})} />
                    <InputText placeholder="Sigla" maxLength={3} value={novoTeam.sigla} onChange={(e) => setNovoTeam({...novoTeam, sigla: e.target.value})} />
                    <InputText placeholder="Bandeira URL" value={novoTeam.bandeira} onChange={(e) => setNovoTeam({...novoTeam, bandeira: e.target.value})} />
                    <Button label="Salvar" onClick={handleCadastrarTeam} severity="success" />
                </div>
            </Dialog>

            <Dialog header="🎟️ Bilhetes Emitidos" visible={exibirDialogCartelas} style={{ width: '70vw' }} onHide={() => setExibirDialogCartelas(false)}>
                <DataTable value={cartelasDaRodada} paginator rows={10}>
                    <Column field="numero_bilhete" header="Nº" body={(r) => <b>#{r.numero_bilhete || r.id}</b>} />
                    <Column field="usuario_nome" header="Usuário" />
                    <Column field="status_pagamento" header="Status" body={(r) => <span style={{color: r.status_pagamento==='aprovado'?'green':'orange'}}>{r.status_pagamento.toUpperCase()}</span>} />
                </DataTable>
            </Dialog>
        </div>
    );
}