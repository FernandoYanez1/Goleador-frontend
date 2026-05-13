import React, { useEffect, useState } from 'react';
import { Button } from 'primereact/button';
import { InputText } from 'primereact/inputtext';
import { Dialog } from 'primereact/dialog';
import { DataTable } from 'primereact/datatable';
import { Column } from 'primereact/column';
import { Dropdown } from 'primereact/dropdown';
import { useHistory } from 'react-router-dom';

export default function Admin() {
    const history = useHistory();
    const apiUrl = process.env.REACT_APP_API_URL || 'http://localhost:3001';

    const [rodadas, setRodadas] = useState<any[]>([]);
    const [rodadaSelecionada, setRodadaSelecionada] = useState<any>(null);
    const [novaRodadaNome, setNovaRodadaNome] = useState('');

    const [jogos, setJogos] = useState<any[]>([]);
    const [resultados, setResultados] = useState<any>({});
    const [editandoJogos, setEditandoJogos] = useState<number[]>([]);
    
    const [exibirDialogCartelas, setExibirDialogCartelas] = useState(false);
    const [cartelas, setCartelas] = useState<any[]>([]);
    
    // Transformei data_hora em string para aceitar o input nativo HTML
    const [novoJogo, setNovoJogo] = useState<{
        time_casa: string; time_visitante: string;
        sigla_casa: string; sigla_visitante: string;
        logo_casa: string; logo_visitante: string;
        data_hora: string; 
    }>({
        time_casa: '', time_visitante: '', sigla_casa: '', sigla_visitante: '',
        logo_casa: '', logo_visitante: '', data_hora: ''
    });

    const carregarRodadas = () => {
        fetch(`${apiUrl}/rodadas`)
            .then(res => res.json())
            .then(data => {
                setRodadas(data);
                if (data.length > 0 && !rodadaSelecionada) {
                    const aberta = data.find((r: any) => r.status === 'aberta') || data[0];
                    setRodadaSelecionada(aberta);
                }
            });
    };

    const carregarJogos = (rodadaId: number) => {
        fetch(`${apiUrl}/jogos?rodada_id=${rodadaId}`)
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
    };

    const carregarCartelas = () => {
        fetch(`${apiUrl}/admin/cartelas`)
            .then(res => res.json())
            .then(setCartelas)
            .catch(err => console.error("Erro ao carregar cartelas", err));
    };

    useEffect(() => { 
        carregarRodadas(); 
        carregarCartelas(); 
    }, []);

    useEffect(() => {
        if (rodadaSelecionada) {
            carregarJogos(rodadaSelecionada.id);
        }
    }, [rodadaSelecionada]);

    const handleCriarRodada = () => {
        if (!novaRodadaNome) return alert("Digite um nome para a rodada!");
        fetch(`${apiUrl}/rodadas`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ nome: novaRodadaNome })
        }).then(() => {
            setNovaRodadaNome('');
            carregarRodadas();
            alert("Rodada criada!");
        });
    };

    const handleFinalizarRodada = () => {
        if (!rodadaSelecionada) return;
        if (window.confirm(`Encerrar apostas e bloquear a ${rodadaSelecionada.nome}? Ninguém mais poderá enviar palpites.`)) {
            fetch(`${apiUrl}/rodadas/${rodadaSelecionada.id}/finalizar`, { method: 'PUT' })
                .then(() => {
                    alert("Rodada Bloqueada! Apostas encerradas.");
                    fetch(`${apiUrl}/rodadas`).then(res => res.json()).then(data => {
                        setRodadas(data);
                        setRodadaSelecionada(data.find((r:any) => r.id === rodadaSelecionada.id));
                    });
                });
        }
    };

    const handleReabrirRodada = () => {
        if (!rodadaSelecionada) return;
        if (window.confirm(`Atenção: Deseja REABRIR as apostas para a ${rodadaSelecionada.nome}? Os usuários poderão voltar a comprar cartelas.`)) {
            fetch(`${apiUrl}/rodadas/${rodadaSelecionada.id}/reabrir`, { method: 'PUT' })
                .then(() => {
                    alert("Rodada Reaberta com sucesso!");
                    fetch(`${apiUrl}/rodadas`).then(res => res.json()).then(data => {
                        setRodadas(data);
                        setRodadaSelecionada(data.find((r:any) => r.id === rodadaSelecionada.id));
                    });
                });
        }
    };

    const handleCadastrarJogo = () => {
        if (!rodadaSelecionada) return alert("Selecione uma rodada primeiro!");
        if (!novoJogo.time_casa || !novoJogo.time_visitante) return alert("Preencha os times!");
        
        const dados = { 
            ...novoJogo, 
            rodada_id: rodadaSelecionada.id,
            // Formata o input html para o formato ISO aceito pelo banco
            data_hora: novoJogo.data_hora ? new Date(novoJogo.data_hora).toISOString() : null 
        };

        fetch(`${apiUrl}/cadastrar-jogo`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(dados)
        }).then(() => {
            alert("Jogo cadastrado!");
            carregarJogos(rodadaSelecionada.id);
            setNovoJogo({ time_casa: '', time_visitante: '', sigla_casa: '', sigla_visitante: '', logo_casa: '', logo_visitante: '', data_hora: '' });
        });
    };

    const handleDeletarJogo = (id: number) => {
        if(window.confirm("Excluir a partida inteira? Palpites vinculados a ela também sumirão.")) {
            fetch(`${apiUrl}/deletar-jogo/${id}`, { method: 'DELETE' }).then(() => carregarJogos(rodadaSelecionada.id));
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
            alert("Resultado salvo! Pontos distribuídos paras as cartelas aprovadas.");
            setEditandoJogos(editandoJogos.filter(id => id !== matchId));
            carregarJogos(rodadaSelecionada.id);
        });
    };

    const habilitarEdicao = (jogoId: number) => setEditandoJogos([...editandoJogos, jogoId]);

    const handleTogglePagamento = (cartelaId: number, statusAtual: string) => {
        const novoStatus = statusAtual === 'aprovado' ? 'pendente' : 'aprovado';
        fetch(`${apiUrl}/aprovar-pagamento/${cartelaId}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ status: novoStatus }) 
        }).then(() => carregarCartelas());
    };

    const handleDeletarCartela = (cartelaId: number) => {
        if (window.confirm(`Tem certeza que deseja EXCLUIR a Cartela #${cartelaId}? Isso apagará os palpites do usuário permanentemente.`)) {
            fetch(`${apiUrl}/deletar-cartela/${cartelaId}`, { method: 'DELETE' })
                .then(() => {
                    alert("Cartela excluída com sucesso!");
                    carregarCartelas();
                });
        }
    };

    // Formata exibição da data para ficar bonita na lista de jogos
    const formatarData = (d: string) => {
        if (!d) return '';
        const data = new Date(d);
        return isNaN(data.getTime()) ? d : data.toLocaleString('pt-BR', { day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit' });
    };

    const VALOR_INSCRICAO = 25;
    const cartelasAprovadas = cartelas.filter(c => c.status_pagamento === 'aprovado');
    const cartelasPendentes = cartelas.filter(c => c.status_pagamento === 'pendente');
    
    const valorArrecadado = cartelasAprovadas.length * VALOR_INSCRICAO;
    const valorPendente = cartelasPendentes.length * VALOR_INSCRICAO;

    return (
        <div style={{ padding: '30px', minHeight: '100vh', backgroundColor: '#f4f6f9', color: '#333' }}>
            <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
                
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '30px', backgroundColor: 'white', padding: '15px 20px', borderRadius: '12px', boxShadow: '0 4px 10px rgba(0,0,0,0.05)' }}>
                    <Button label="Voltar" icon="pi pi-arrow-left" onClick={() => history.push('/public')} className="p-button-text p-button-secondary" />
                    <h1 style={{ margin: 0, fontSize: '24px' }}>🛡️ Painel de Administração</h1>
                    <Button label="Aprovar Bilhete" icon="pi pi-check-square" onClick={() => { carregarCartelas(); setExibirDialogCartelas(true); }} className="p-button-outlined p-button-secondary" />
                </div>

                <div style={{ display: 'flex', gap: '20px', marginBottom: '30px', flexWrap: 'wrap' }}>
                    <div style={{ flex: 1, minWidth: '200px', backgroundColor: '#ecfdf5', border: '1px solid #10b981', padding: '20px', borderRadius: '12px', textAlign: 'center', boxShadow: '0 4px 6px rgba(0,0,0,0.05)' }}>
                        <div style={{ color: '#047857', fontWeight: 'bold', fontSize: '14px', marginBottom: '5px' }}>💰 VALOR ARRECADADO</div>
                        <div style={{ color: '#065f46', fontWeight: '900', fontSize: '28px' }}>
                            {valorArrecadado.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
                        </div>
                        <div style={{ color: '#059669', fontSize: '13px', marginTop: '5px' }}>{cartelasAprovadas.length} cartelas aprovadas</div>
                    </div>

                    <div style={{ flex: 1, minWidth: '200px', backgroundColor: '#fffbeb', border: '1px solid #f59e0b', padding: '20px', borderRadius: '12px', textAlign: 'center', boxShadow: '0 4px 6px rgba(0,0,0,0.05)' }}>
                        <div style={{ color: '#b45309', fontWeight: 'bold', fontSize: '14px', marginBottom: '5px' }}>⏳ VALOR PENDENTE (PIX)</div>
                        <div style={{ color: '#d97706', fontWeight: '900', fontSize: '28px' }}>
                            {valorPendente.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
                        </div>
                        <div style={{ color: '#b45309', fontSize: '13px', marginTop: '5px' }}>{cartelasPendentes.length} cartelas aguardando</div>
                    </div>
                </div>

                <div style={{ backgroundColor: 'white', padding: '20px', borderRadius: '12px', marginBottom: '30px', boxShadow: '0 4px 10px rgba(0,0,0,0.05)' }}>
                    <h3 style={{ margin: '0 0 15px 0', color: '#1e293b' }}>Gestão de Rodadas</h3>
                    
                    <div style={{ display: 'flex', gap: '20px', flexWrap: 'wrap', alignItems: 'center' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                            <Dropdown 
                                value={rodadaSelecionada} 
                                options={rodadas} 
                                onChange={(e) => setRodadaSelecionada(e.value)} 
                                optionLabel="nome" 
                                placeholder="Selecione uma Rodada" 
                                style={{ width: '250px' }} 
                            />
                            {rodadaSelecionada && (
                                <span style={{ padding: '5px 10px', borderRadius: '5px', fontSize: '12px', fontWeight: 'bold', backgroundColor: rodadaSelecionada.status === 'aberta' ? '#dcfce7' : '#f1f5f9', color: rodadaSelecionada.status === 'aberta' ? '#16a34a' : '#64748b' }}>
                                    {rodadaSelecionada.status === 'aberta' ? '🟢 ABERTA' : '🔒 FINALIZADA'}
                                </span>
                            )}
                        </div>

                        <span style={{ color: '#cbd5e1' }}>|</span>

                        <div style={{ display: 'flex', gap: '10px' }}>
                            <InputText placeholder="Nome (Ex: Oitavas)" value={novaRodadaNome} onChange={(e) => setNovaRodadaNome(e.target.value)} />
                            <Button label="Nova Rodada" icon="pi pi-plus" onClick={handleCriarRodada} severity="success" outlined />
                        </div>

                        {rodadaSelecionada?.status === 'aberta' ? (
                            <Button label="Encerrar Rodada e Bloquear Apostas" icon="pi pi-lock" severity="danger" onClick={handleFinalizarRodada} style={{ marginLeft: 'auto' }} />
                        ) : (
                            rodadaSelecionada && <Button label="Reabrir Apostas" icon="pi pi-unlock" severity="success" outlined onClick={handleReabrirRodada} style={{ marginLeft: 'auto' }} />
                        )}
                    </div>
                </div>

                {rodadaSelecionada && (
                    <div style={{ display: 'flex', gap: '30px', flexWrap: 'wrap', alignItems: 'flex-start' }}>
                        
                        <div style={{ flex: '1 1 400px', backgroundColor: 'white', padding: '20px', borderRadius: '12px', boxShadow: '0 4px 10px rgba(0,0,0,0.05)', opacity: rodadaSelecionada.status === 'finalizada' ? 0.5 : 1, pointerEvents: rodadaSelecionada.status === 'finalizada' ? 'none' : 'auto' }}>
                            <h2>➕ Adicionar à {rodadaSelecionada.nome}</h2>
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
                                <div style={{ display: 'flex', gap: '10px' }}>
                                    <InputText placeholder="Time Casa" value={novoJogo.time_casa} onChange={(e) => setNovoJogo({...novoJogo, time_casa: e.target.value})} style={{ flex: 1 }} />
                                    <InputText placeholder="Sigla" maxLength={3} value={novoJogo.sigla_casa} onChange={(e) => setNovoJogo({...novoJogo, sigla_casa: e.target.value})} style={{ width: '100px' }} />
                                </div>
                                <InputText placeholder="URL Logo Casa" value={novoJogo.logo_casa} onChange={(e) => setNovoJogo({...novoJogo, logo_casa: e.target.value})} />
                                
                                <div style={{ textAlign: 'center', fontWeight: 'bold' }}>X</div>

                                <div style={{ display: 'flex', gap: '10px' }}>
                                    <InputText placeholder="Time Visitante" value={novoJogo.time_visitante} onChange={(e) => setNovoJogo({...novoJogo, time_visitante: e.target.value})} style={{ flex: 1 }} />
                                    <InputText placeholder="Sigla" maxLength={3} value={novoJogo.sigla_visitante} onChange={(e) => setNovoJogo({...novoJogo, sigla_visitante: e.target.value})} style={{ width: '100px' }} />
                                </div>
                                <InputText placeholder="URL Logo Visitante" value={novoJogo.logo_visitante} onChange={(e) => setNovoJogo({...novoJogo, logo_visitante: e.target.value})} />
                                
                                {/* AQUI FOI TROCADO PARA O INPUT NATIVO */}
                                <input 
                                    type="datetime-local" 
                                    value={novoJogo.data_hora} 
                                    onChange={(e) => setNovoJogo({...novoJogo, data_hora: e.target.value})} 
                                    style={{ padding: '0.75rem', borderRadius: '6px', border: '1px solid #ced4da', width: '100%', fontFamily: 'inherit', fontSize: '1rem', color: '#495057' }}
                                />

                                <Button label="Cadastrar Jogo" onClick={handleCadastrarJogo} />
                            </div>
                        </div>

                        <div style={{ flex: '1 1 500px' }}>
                            <h2 style={{ marginTop: 0 }}>📋 Jogos da {rodadaSelecionada.nome}</h2>
                            {jogos.length === 0 ? <p>Nenhum jogo cadastrado nesta rodada.</p> : null}
                            
                            {jogos.map(jogo => {
                                const temResultadoFinalizado = jogo.gols_casa !== null && jogo.gols_visitante !== null;
                                const estaEditando = editandoJogos.includes(jogo.id);
                                const mostrarFixo = temResultadoFinalizado && !estaEditando;

                                return (
                                    <div key={jogo.id} style={{ backgroundColor: 'white', marginBottom: '20px', borderRadius: '12px', padding: '20px', boxShadow: '0 4px 10px rgba(0,0,0,0.05)' }}>
                                        <div style={{ textAlign: 'center', color: '#64748b', fontWeight: 'bold', marginBottom: '15px' }}>📅 {formatarData(jogo.data_hora)}</div>
                                        
                                        <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '20px', marginBottom: '25px' }}>
                                            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', width: '80px' }}>
                                                <img src={jogo.logo_casa || "/media/escudos-times/default.png"} alt="logo" style={{ width: '50px', height: '50px', objectFit: 'contain' }} />
                                                <strong>{jogo.sigla_casa}</strong>
                                            </div>

                                            {mostrarFixo ? (
                                                <div style={{ fontSize: '32px', fontWeight: '900', color: '#1e293b', display: 'flex', gap: '15px' }}>
                                                    <span>{jogo.gols_casa}</span>
                                                    <span style={{ color: '#94a3b8' }}>X</span>
                                                    <span>{jogo.gols_visitante}</span>
                                                </div>
                                            ) : (
                                                <>
                                                    <input 
                                                        type="number" min="0" value={resultados[jogo.id]?.casa ?? ""} 
                                                        onChange={(e) => setResultados({...resultados, [jogo.id]: {...resultados[jogo.id], casa: e.target.value}})} 
                                                        style={{ width: '60px', height: '50px', textAlign: 'center', fontSize: '24px', fontWeight: 'bold', borderRadius: '8px', border: '2px solid #cbd5e1' }}
                                                    />
                                                    <span style={{ fontWeight: 'bold', fontSize: '20px', color: '#94a3b8' }}>X</span>
                                                    <input 
                                                        type="number" min="0" value={resultados[jogo.id]?.visitante ?? ""} 
                                                        onChange={(e) => setResultados({...resultados, [jogo.id]: {...resultados[jogo.id], visitante: e.target.value}})} 
                                                        style={{ width: '60px', height: '50px', textAlign: 'center', fontSize: '24px', fontWeight: 'bold', borderRadius: '8px', border: '2px solid #cbd5e1' }}
                                                    />
                                                </>
                                            )}

                                            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', width: '80px' }}>
                                                <img src={jogo.logo_visitante || "/media/escudos-times/default.png"} alt="logo" style={{ width: '50px', height: '50px', objectFit: 'contain' }} />
                                                <strong>{jogo.sigla_visitante}</strong>
                                            </div>
                                        </div>

                                        <div style={{ display: 'flex', justifyContent: 'center', gap: '15px' }}>
                                            {mostrarFixo ? (
                                                <>
                                                    <Button label="Editar Placar" icon="pi pi-pencil" severity="info" onClick={() => habilitarEdicao(jogo.id)} />
                                                </>
                                            ) : (
                                                <>
                                                    <Button label="Salvar Resultado" icon="pi pi-check" severity="success" onClick={() => handleSalvarResultado(jogo.id)} />
                                                    {!estaEditando && <Button label="Excluir Jogo" icon="pi pi-trash" severity="danger" outlined onClick={() => handleDeletarJogo(jogo.id)} />}
                                                </>
                                            )}
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    </div>
                )}
            </div>

            <Dialog header="Gerenciar Pagamentos (Cartelas)" visible={exibirDialogCartelas} style={{ width: '70vw' }} onHide={() => setExibirDialogCartelas(false)}>
                <DataTable value={cartelas} paginator rows={10} emptyMessage="Nenhuma cartela gerada." sortField="id" sortOrder={-1}>
                    <Column field="id" header="Nº" sortable body={(r) => <b>#{r.id}</b>} style={{ width: '80px' }} />
                    <Column field="usuario_nome" header="Usuário" sortable />
                    <Column field="rodada_nome" header="Rodada" sortable />
                    <Column field="data_criacao" header="Data" body={(r) => formatarData(r.data_criacao)} />
                    <Column header="Status" body={(r) => (
                        <Button 
                            label={r.status_pagamento === 'aprovado' ? "Aprovado" : "Pendente"} 
                            icon={r.status_pagamento === 'aprovado' ? "pi pi-check" : "pi pi-clock"} 
                            severity={r.status_pagamento === 'aprovado' ? "success" : "warning"}
                            onClick={() => handleTogglePagamento(r.id, r.status_pagamento)}
                            style={{ padding: '5px 10px', fontSize: '12px' }}
                        />
                    )} />
                    <Column header="Ações" body={(r) => (
                        <Button 
                            icon="pi pi-trash" 
                            severity="danger" 
                            outlined 
                            onClick={() => handleDeletarCartela(r.id)} 
                            tooltip="Excluir Cartela"
                            style={{ padding: '5px', width: '35px', height: '35px' }}
                        />
                    )} />
                </DataTable>
            </Dialog>
        </div>
    );
}