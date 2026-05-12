import React, { useEffect, useState } from 'react';
import { Button } from 'primereact/button';
import { InputText } from 'primereact/inputtext';
import { Calendar } from 'primereact/calendar';
import { Dialog } from 'primereact/dialog';
import { DataTable } from 'primereact/datatable';
import { Column } from 'primereact/column';
import { useHistory } from 'react-router-dom';

export default function Admin() {
    const history = useHistory();
    const [jogos, setJogos] = useState<any[]>([]);
    const [resultados, setResultados] = useState<any>({});
    const [prazoRodada, setPrazoRodada] = useState<any>(null);
    const [editandoJogos, setEditandoJogos] = useState<number[]>([]);
    
    const [exibirDialogPalpites, setExibirDialogPalpites] = useState(false);
    const [usuariosComPalpites, setUsuariosComPalpites] = useState<any[]>([]);
    
    const [novoJogo, setNovoJogo] = useState<{
        time_casa: string; time_visitante: string;
        sigla_casa: string; sigla_visitante: string;
        logo_casa: string; logo_visitante: string;
        data_hora: any;
    }>({
        time_casa: '', time_visitante: '', sigla_casa: '', sigla_visitante: '',
        logo_casa: '', logo_visitante: '', data_hora: null
    });

    const carregarDados = () => {
        fetch('http://localhost:3001/jogos')
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
            
        fetch('http://localhost:3001/config/prazo')
            .then(res => res.json())
            .then(data => setPrazoRodada(data.prazo ? new Date(data.prazo) : null));
    };

    const carregarUsuariosPalpites = () => {
        fetch('http://localhost:3001/todos-palpites')
            .then(res => res.json())
            .then(setUsuariosComPalpites)
            .catch(err => console.error("Erro ao carregar lista", err));
    };

    useEffect(() => { 
        carregarDados(); 
        carregarUsuariosPalpites(); // Carrega no início para o Dashboard funcionar logo de cara
    }, []);

    // --- FUNÇÕES DE BLOQUEIO ---
    const handleSalvarPrazo = () => {
        fetch('http://localhost:3001/config/prazo', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ prazo: prazoRodada })
        }).then(() => alert("Prazo agendado com sucesso!"));
    };

    const handleBloquearAgora = () => {
        const agora = new Date();
        setPrazoRodada(agora);
        fetch('http://localhost:3001/config/prazo', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ prazo: agora })
        }).then(() => alert("Apostas bloqueadas imediatamente!"));
    };

    const handleLiberarPalpites = () => {
        if(window.confirm("Deseja reabrir as apostas para os usuários?")) {
            setPrazoRodada(null);
            fetch('http://localhost:3001/config/prazo', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ prazo: null })
            }).then(() => alert("Bloqueio removido! Apostas liberadas."));
        }
    };
    // ---------------------------

    const handleCadastrarJogo = () => {
        if (!novoJogo.time_casa || !novoJogo.time_visitante) return alert("Preencha os times!");
        const dados = { ...novoJogo, data_hora: novoJogo.data_hora ? novoJogo.data_hora.toISOString() : null };

        fetch('http://localhost:3001/cadastrar-jogo', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(dados)
        }).then(() => {
            alert("Jogo cadastrado!");
            carregarDados();
            setNovoJogo({ time_casa: '', time_visitante: '', sigla_casa: '', sigla_visitante: '', logo_casa: '', logo_visitante: '', data_hora: null });
        });
    };

    const handleDeletarJogo = (id: number) => {
        if(window.confirm("Excluir a partida inteira? Palpites também serão apagados.")) {
            fetch(`http://localhost:3001/deletar-jogo/${id}`, { method: 'DELETE' }).then(() => carregarDados());
        }
    };

    const handleSalvarResultado = (matchId: number) => {
        const resultado = resultados[matchId];
        
        if (!resultado || resultado.casa === undefined || resultado.casa === "" || resultado.visitante === undefined || resultado.visitante === "") {
            return alert("Preencha o placar corretamente!");
        }

        fetch('http://localhost:3001/finalizar-jogo', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ 
                match_id: matchId, 
                gols_casa: parseInt(resultado.casa, 10), 
                gols_visitante: parseInt(resultado.visitante, 10) 
            })
        }).then(() => {
            alert("Resultado salvo!");
            setEditandoJogos(editandoJogos.filter(id => id !== matchId));
            carregarDados();
        });
    };

    const handleDesfazerResultado = (matchId: number) => {
        if (window.confirm("Tem certeza que deseja apagar este placar? Os pontos dos usuários serão revertidos.")) {
            fetch('http://localhost:3001/desfazer-resultado', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ match_id: matchId })
            }).then(() => {
                alert("Placar apagado e pontos revertidos!");
                const novosResultados = {...resultados};
                delete novosResultados[matchId];
                setResultados(novosResultados);
                carregarDados();
            });
        }
    };

    const habilitarEdicao = (jogoId: number) => {
        setEditandoJogos([...editandoJogos, jogoId]);
    };

    const handleDeletarTodosPalpitesUsuario = (usuarioId: number, nome: string) => {
        if (window.confirm(`Excluir TODOS os palpites de ${nome}?`)) {
            fetch(`http://localhost:3001/deletar-palpites-usuario/${usuarioId}`, { method: 'DELETE' })
                .then(res => { if (res.ok) { alert(`Removidos!`); carregarUsuariosPalpites(); }});
        }
    };

    const handleTogglePagamento = (usuarioId: number, statusAtual: number) => {
        fetch(`http://localhost:3001/aprovar-pagamento/${usuarioId}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ pago: !statusAtual }) 
        }).then(() => {
            carregarUsuariosPalpites(); 
        });
    };

    const formatarData = (d: string) => isNaN(new Date(d).getTime()) ? d : new Date(d).toLocaleString('pt-BR');

    const isBloqueado = prazoRodada && new Date() > new Date(prazoRodada);

    // --- CÁLCULOS DO DASHBOARD ADMIN ---
    const VALOR_INSCRICAO = 25;
    const qtdAprovados = usuariosComPalpites.filter((u: any) => u.pago === 1).length;
    const valorArrecadado = qtdAprovados * VALOR_INSCRICAO;
    const qtdPendentes = usuariosComPalpites.filter((u: any) => u.pago === 0 && u.total_palpites > 0).length;
    const valorPendente = qtdPendentes * VALOR_INSCRICAO;

    return (
        <div style={{ padding: '30px', minHeight: '100vh', backgroundColor: '#f4f6f9', color: '#333' }}>
            <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
                
                {/* CABEÇALHO DO ADMIN */}
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '30px', backgroundColor: 'white', padding: '15px 20px', borderRadius: '12px', boxShadow: '0 4px 10px rgba(0,0,0,0.05)' }}>
                    <Button label="Voltar" icon="pi pi-arrow-left" onClick={() => history.push('/public')} className="p-button-text p-button-secondary" />
                    <h1 style={{ margin: 0, fontSize: '24px' }}>🛡️ Painel de Administração</h1>
                    <Button label="Participantes" icon="pi pi-users" onClick={() => { carregarUsuariosPalpites(); setExibirDialogPalpites(true); }} className="p-button-outlined p-button-secondary" />
                </div>

                {/* DASHBOARD FINANCEIRO */}
                <div style={{ display: 'flex', gap: '20px', marginBottom: '30px', flexWrap: 'wrap' }}>
                    <div style={{ flex: 1, minWidth: '200px', backgroundColor: '#ecfdf5', border: '1px solid #10b981', padding: '20px', borderRadius: '12px', textAlign: 'center', boxShadow: '0 4px 6px rgba(0,0,0,0.05)' }}>
                        <div style={{ color: '#047857', fontWeight: 'bold', fontSize: '14px', marginBottom: '5px' }}>💰 VALOR ARRECADADO (APROVADO)</div>
                        <div style={{ color: '#065f46', fontWeight: '900', fontSize: '28px' }}>
                            {valorArrecadado.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
                        </div>
                        <div style={{ color: '#059669', fontSize: '13px', marginTop: '5px' }}>{qtdAprovados} pagamentos confirmados</div>
                    </div>

                    <div style={{ flex: 1, minWidth: '200px', backgroundColor: '#fffbeb', border: '1px solid #f59e0b', padding: '20px', borderRadius: '12px', textAlign: 'center', boxShadow: '0 4px 6px rgba(0,0,0,0.05)' }}>
                        <div style={{ color: '#b45309', fontWeight: 'bold', fontSize: '14px', marginBottom: '5px' }}>⏳ VALOR PENDENTE (AGUARDANDO PIX)</div>
                        <div style={{ color: '#d97706', fontWeight: '900', fontSize: '28px' }}>
                            {valorPendente.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
                        </div>
                        <div style={{ color: '#b45309', fontSize: '13px', marginTop: '5px' }}>{qtdPendentes} usuários com palpites não pagos</div>
                    </div>
                </div>

                {/* CONTROLE DE BLOQUEIO */}
                <div style={{ backgroundColor: 'white', padding: '20px', borderRadius: '12px', borderLeft: isBloqueado ? '6px solid #ef4444' : '6px solid #10b981', marginBottom: '30px', boxShadow: '0 4px 10px rgba(0,0,0,0.05)' }}>
                    <h3 style={{ margin: '0 0 15px 0', color: isBloqueado ? '#ef4444' : '#1e293b' }}>Controle de Rodada (Bloqueio de Palpites)</h3>
                    <div style={{ display: 'flex', gap: '15px', flexWrap: 'wrap', alignItems: 'center' }}>
                        <Calendar placeholder="Agendar data limite" value={prazoRodada} onChange={(e) => setPrazoRodada(e.value)} showTime hourFormat="24" style={{ width: '220px' }} />
                        <Button label="Agendar" icon="pi pi-calendar-plus" onClick={handleSalvarPrazo} severity="warning" />
                        <span style={{ color: '#cbd5e1' }}>|</span>
                        <Button label="Bloquear Agora" icon="pi pi-lock" onClick={handleBloquearAgora} severity="danger" />
                        <Button label="Liberar Palpites" icon="pi pi-unlock" onClick={handleLiberarPalpites} severity="success" outlined />
                    </div>
                    
                    <div style={{ marginTop: '15px', padding: '10px', backgroundColor: '#f8fafc', borderRadius: '8px', display: 'inline-block' }}>
                        <strong style={{ color: '#64748b' }}>Status atual: </strong>
                        {prazoRodada ? (
                            isBloqueado 
                                ? <span style={{ color: '#ef4444', fontWeight: 'bold' }}>🔴 BLOQUEADO (Prazo encerrou em {prazoRodada.toLocaleString('pt-BR')})</span>
                                : <span style={{ color: '#f59e0b', fontWeight: 'bold' }}>🟡 AGENDADO (Bloqueia em {prazoRodada.toLocaleString('pt-BR')})</span>
                        ) : (
                            <span style={{ color: '#10b981', fontWeight: 'bold' }}>🟢 LIBERADO (Apostas abertas)</span>
                        )}
                    </div>
                </div>

                <div style={{ display: 'flex', gap: '30px', flexWrap: 'wrap', alignItems: 'flex-start' }}>
                    {/* CADASTRO DE JOGOS */}
                    <div style={{ flex: '1 1 400px', backgroundColor: 'white', padding: '20px', borderRadius: '12px', boxShadow: '0 4px 10px rgba(0,0,0,0.05)' }}>
                        <h2>➕ Cadastrar Novo Jogo</h2>
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
                            
                            <Calendar placeholder="Data e Horário" value={novoJogo.data_hora} onChange={(e) => setNovoJogo({...novoJogo, data_hora: e.value})} showTime hourFormat="24" />
                            <Button label="Adicionar à Rodada" onClick={handleCadastrarJogo} />
                        </div>
                    </div>

                    {/* LISTA DE JOGOS E RESULTADOS */}
                    <div style={{ flex: '1 1 500px' }}>
                        <h2 style={{ marginTop: 0 }}>📋 Lançar Resultados</h2>
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
                                                    type="number" min="0"
                                                    value={resultados[jogo.id]?.casa ?? ""} 
                                                    onChange={(e) => setResultados({...resultados, [jogo.id]: {...resultados[jogo.id], casa: e.target.value}})} 
                                                    style={{ width: '60px', height: '50px', textAlign: 'center', fontSize: '24px', fontWeight: 'bold', borderRadius: '8px', border: '2px solid #cbd5e1' }}
                                                />
                                                <span style={{ fontWeight: 'bold', fontSize: '20px', color: '#94a3b8' }}>X</span>
                                                <input 
                                                    type="number" min="0"
                                                    value={resultados[jogo.id]?.visitante ?? ""} 
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
                                                <Button label="Excluir Placar" icon="pi pi-undo" severity="warning" outlined onClick={() => handleDesfazerResultado(jogo.id)} tooltip="Volta o jogo para 'Em Aberto'" />
                                            </>
                                        ) : (
                                            <>
                                                <Button label="Encerrar Jogo" icon="pi pi-check" severity="success" onClick={() => handleSalvarResultado(jogo.id)} />
                                                {estaEditando && <Button label="Cancelar Edição" icon="pi pi-times" severity="secondary" outlined onClick={() => setEditandoJogos(editandoJogos.filter(id => id !== jogo.id))} />}
                                                {!estaEditando && <Button label="Excluir Partida" icon="pi pi-trash" severity="danger" outlined onClick={() => handleDeletarJogo(jogo.id)} tooltip="Exclui o jogo e os palpites do sistema" />}
                                            </>
                                        )}
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </div>
            </div>

            <Dialog header="Gerenciar Participantes" visible={exibirDialogPalpites} style={{ width: '70vw' }} onHide={() => setExibirDialogPalpites(false)}>
                <DataTable value={usuariosComPalpites} paginator rows={10} emptyMessage="Nenhum usuário cadastrado.">
                    <Column field="nome_usuario" header="Usuário" sortable />
                    <Column field="email" header="E-mail" />
                    <Column header="Palpites" body={(r) => <b>{r.total_palpites}</b>} />
                    <Column header="Pagamento" body={(r) => (
                        <Button 
                            label={r.pago ? "Aprovado" : "Pendente"} 
                            icon={r.pago ? "pi pi-check" : "pi pi-clock"} 
                            severity={r.pago ? "success" : "warning"}
                            onClick={() => handleTogglePagamento(r.usuario_id, r.pago)}
                            style={{ padding: '5px 10px', fontSize: '12px' }}
                        />
                    )} />
                    <Column header="Ações" body={(r) => <Button label="Zerar Palpites" icon="pi pi-trash" severity="danger" text onClick={() => handleDeletarTodosPalpitesUsuario(r.usuario_id, r.nome_usuario)} />} />
                </DataTable>
            </Dialog>
        </div>
    );
}