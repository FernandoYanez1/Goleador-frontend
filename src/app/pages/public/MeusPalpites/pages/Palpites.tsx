import React, { useState, useEffect } from "react";
import { useHistory } from "react-router-dom";
import AppButton from "../../../../../vendors/components/Button";
import { Tooltip } from '@mui/material';

export default function MeusPalpites() {
  const history = useHistory();
  const apiUrl = process.env.REACT_APP_API_URL || 'http://localhost:3001';
  
  const [cartelas, setCartelas] = useState<any[]>([]);
  const [nomeUsuario, setNomeUsuario] = useState("");
  
  const [rodadaAtualInfo, setRodadaAtualInfo] = useState<any>(null);
  const [modoExibicao, setModoExibicao] = useState<'atual' | 'historico'>('atual');
  const [rodadaHistoricoSelecionada, setRodadaHistoricoSelecionada] = useState<string>("");
  
  const [expandidos, setExpandidos] = useState<Record<number, boolean>>({});

  useEffect(() => {
    const usuarioSalvo = localStorage.getItem("usuarioLogado");
    if (!usuarioSalvo) {
      history.push("/public/login");
      return;
    }
    const user = JSON.parse(usuarioSalvo);
    setNomeUsuario(user.nome);

    // Busca qual é a rodada atual do sistema
    fetch(`${apiUrl}/rodadas`)
        .then(res => res.json())
        .then(rodadasData => {
            const ativa = rodadasData.find((r: any) => r.status === 'aberta') || rodadasData.find((r: any) => r.status === 'finalizada');
            setRodadaAtualInfo(ativa);

            // Busca os palpites do usuário
            fetch(`${apiUrl}/meus-palpites/${user.id}`)
                .then((res) => res.json())
                .then((dados) => {
                    setCartelas(dados);
                    
                    // Configura os bilhetes (Atuais começam abertos, antigos começam fechados)
                    const estadoInicial: Record<number, boolean> = {};
                    dados.forEach((c: any) => { 
                        estadoInicial[c.cartela_id] = (ativa && c.rodada_nome === ativa.nome); 
                    });
                    setExpandidos(estadoInicial);
                })
                .catch((err) => console.error("Erro ao buscar palpites:", err));
        });

  }, [history, apiUrl]);

  const getRegraInfo = (p: any) => {
    if (p.gols_casa === null || p.gols_visitante === null) return { texto: "Aguardando jogo acabar", cor: "#94a3b8" }; 
    
    if (p.pontos_ganhos === 15) return { texto: "👑 Placar Exato (15 pts)", cor: "#8b5cf6" };
    if (p.pontos_ganhos === 10) return { texto: "🎯 Resultado + Gols de um time (10 pts)", cor: "#10b981" };
    if (p.pontos_ganhos === 8) return { texto: "✅ Acertou o Vencedor/Empate (8 pts)", cor: "#0ea5e9" };
    if (p.pontos_ganhos === 3) return { texto: "⚽ Acertou a Soma Exata de Gols (3 pts)", cor: "#f97316" };
    
    return { texto: "❌ Errou (0 pts)", cor: "#64748b" }; 
  };

  const formatarDataJogo = (dataStr: string) => {
      if (!dataStr) return "Data indefinida";
      const d = new Date(dataStr);
      return isNaN(d.getTime()) ? dataStr : d.toLocaleString("pt-BR", { 
          day: '2-digit', month: '2-digit', year: 'numeric', 
          hour: '2-digit', minute: '2-digit' 
      });
  };

  const toggleCartela = (cartelaId: number) => {
      setExpandidos(prev => ({ ...prev, [cartelaId]: !prev[cartelaId] }));
  };

  const renderCartela = (cartela: any) => {
    const isAprovado = cartela.status_pagamento === 'aprovado';
    const isOpen = expandidos[cartela.cartela_id];
    const mensagemWpp = encodeURIComponent(`Fala Fernando! Segue meu comprovante do bolão. (Meu nome é: ${nomeUsuario} | Cartela #${cartela.cartela_id})`);
    const linkWhatsapp = `https://wa.me/5561983209025?text=${mensagemWpp}`;

    return (
      <div key={cartela.cartela_id} style={{ backgroundColor: "white", borderRadius: "12px", padding: "20px", marginBottom: "30px", boxShadow: "0 10px 15px -3px rgba(0,0,0,0.1)", borderTop: isAprovado ? "8px solid #10b981" : "8px solid #f59e0b", transition: "all 0.3s ease" }}>
        
        <div onClick={() => toggleCartela(cartela.cartela_id)} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", cursor: "pointer", paddingBottom: isOpen ? "15px" : "0", borderBottom: isOpen ? "1px solid #e2e8f0" : "none", marginBottom: isOpen ? "20px" : "0" }}>
          <div style={{ display: "flex", alignItems: "center", gap: "15px" }}>
            <div style={{ backgroundColor: "#f1f5f9", padding: "8px", borderRadius: "8px" }}>
                <i className={`pi ${isOpen ? 'pi-chevron-down' : 'pi-chevron-right'}`} style={{ color: "#64748b", fontSize: "1.2rem", fontWeight: "bold" }}></i>
            </div>
            <div>
                <h3 style={{ margin: 0, color: "#1e293b", fontSize: "20px" }}>Bilhete #{cartela.cartela_id}</h3>
                <span style={{ color: "#64748b", fontSize: "14px", fontWeight: "bold" }}>{cartela.rodada_nome}</span>
            </div>
          </div>
          <div style={{ textAlign: "right" }}>
            <div style={{ fontSize: "11px", color: "#94a3b8", fontWeight: "bold" }}>PONTOS AQUI</div>
            <div style={{ fontSize: "22px", fontWeight: "900", color: isAprovado ? "#10b981" : "#94a3b8", lineHeight: "1" }}>{isAprovado ? cartela.total_pontos : "---"}</div>
          </div>
        </div>

        {isOpen && (
            <div>
                {!isAprovado && (
                <div style={{ backgroundColor: "#fffbeb", border: "2px dashed #f59e0b", borderRadius: "12px", padding: "20px", marginBottom: "25px", textAlign: "center" }}>
                    <h4 style={{ color: "#b45309", margin: "0 0 10px 0", fontSize: "18px" }}>⚠️ Bilhete Aguardando Pagamento</h4>
                    <p style={{ color: "#475569", marginBottom: "20px", fontSize: "14px" }}>Pix de <b>R$ 20,00</b> para validar este bilhete específico.</p>

                    <div style={{ display: "flex", flexWrap: "wrap", justifyContent: "center", gap: "15px", alignItems: "center" }}>
                        <div style={{ backgroundColor: "white", padding: "10px", borderRadius: "10px", boxShadow: "0 2px 4px rgba(0,0,0,0.1)" }}>
                            <img src="https://api.qrserver.com/v1/create-qr-code/?size=100x100&data=04415991173" alt="QR Code PIX" style={{ width: "100px", height: "100px" }} />
                        </div>
                        <div style={{ backgroundColor: "#fef3c7", padding: "15px", borderRadius: "8px", textAlign: "left" }}>
                            <div style={{ fontSize: "10px", fontWeight: "bold", color: "#92400e" }}>CHAVE PIX (CPF):</div>
                            <div style={{ fontSize: "18px", fontWeight: "900", color: "#d97706", marginBottom: "5px", userSelect: "all" }}>044.159.911-73</div>
                            <div style={{ fontSize: "14px", fontWeight: "bold", color: "#b45309" }}>Fernando Yañez</div>
                        </div>
                    </div>

                    <a href={linkWhatsapp} target="_blank" rel="noopener noreferrer" style={{ display: "inline-flex", alignItems: "center", gap: "10px", backgroundColor: "#25D366", color: "white", padding: "10px 20px", borderRadius: "8px", textDecoration: "none", fontWeight: "bold", fontSize: "14px", marginTop: "20px" }}>
                        <i className="pi pi-whatsapp"></i> Enviar Comprovante
                    </a>
                </div>
                )}

                <div style={{ display: "flex", flexDirection: "column", gap: "15px" }}>
                {cartela.palpites.map((p: any, index: number) => {
                    const jogoFinalizado = p.gols_casa !== null && p.gols_visitante !== null;
                    const info = getRegraInfo(p);

                    return (
                    <div key={index} style={{ backgroundColor: "#f8fafc", borderRadius: "8px", padding: "15px", border: "1px solid #e2e8f0" }}>
                        <div style={{ textAlign: "center", color: "#64748b", fontSize: "12px", fontWeight: "bold", marginBottom: "10px" }}>
                        📅 {formatarDataJogo(p.data_hora)}
                        </div>
                        
                        <div style={{ display: "flex", justifyContent: "center", alignItems: "center", gap: "15px" }}>
                        <div style={{ textAlign: 'center', width: '60px' }}>
                            <img src={p.logo_casa || "/media/escudos-times/default.png"} alt="Casa" style={{ width: '35px', height: '35px', objectFit: 'contain' }} />
                        </div>

                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                            <div style={{ width: "35px", height: "35px", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "16px", fontWeight: "bold", borderRadius: "6px", border: "2px solid #cbd5e1", backgroundColor: "white", color: "#1e293b" }}>{p.palpite_casa}</div>
                            <span style={{ fontSize: "16px", fontWeight: "bold", color: '#94a3b8' }}>X</span>
                            <div style={{ width: "35px", height: "35px", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "16px", fontWeight: "bold", borderRadius: "6px", border: "2px solid #cbd5e1", backgroundColor: "white", color: "#1e293b" }}>{p.palpite_visitante}</div>
                        </div>

                        <div style={{ textAlign: 'center', width: '60px' }}>
                            <img src={p.logo_visitante || "/media/escudos-times/default.png"} alt="Visitante" style={{ width: '35px', height: '35px', objectFit: 'contain' }} />
                        </div>
                        </div>

                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderTop: "1px solid #e2e8f0", paddingTop: "10px", marginTop: "15px" }}>
                        <div style={{ fontSize: "12px", color: "#64748b" }}>
                            Oficial: <strong style={{ color: jogoFinalizado ? "#1e293b" : "#f59e0b" }}>{jogoFinalizado ? `${p.gols_casa} x ${p.gols_visitante}` : "Aguardando..."}</strong>
                        </div>
                        
                        {jogoFinalizado && isAprovado && (
                            <Tooltip title={info.texto} arrow placement="top">
                            <div style={{ backgroundColor: info.cor, color: "white", padding: "4px 10px", borderRadius: "15px", fontWeight: "bold", fontSize: "11px", cursor: "help" }}>
                                +{p.pontos_ganhos} pts
                            </div>
                            </Tooltip>
                        )}
                        {jogoFinalizado && !isAprovado && (
                            <div style={{ color: "#ef4444", fontSize: "11px", fontWeight: "bold" }}>Sem pontos (Bilhete não pago)</div>
                        )}
                        </div>
                    </div>
                    );
                })}
                </div>
            </div>
        )}
      </div>
    );
  };

  // Separação Inteligente
  const cartelasAtuais = cartelas.filter(c => rodadaAtualInfo && c.rodada_nome === rodadaAtualInfo.nome);
  const cartelasAntigas = cartelas.filter(c => !rodadaAtualInfo || c.rodada_nome !== rodadaAtualInfo.nome);
  
  // Lista de rodadas antigas para o dropdown de histórico
  const nomesRodadasAntigas = Array.from(new Set(cartelasAntigas.map(c => c.rodada_nome))) as string[];

  // Define qual rodada antiga está selecionada no dropdown
  useEffect(() => {
      if (modoExibicao === 'historico' && nomesRodadasAntigas.length > 0 && !rodadaHistoricoSelecionada) {
          setRodadaHistoricoSelecionada(nomesRodadasAntigas[0]);
      }
  }, [modoExibicao, nomesRodadasAntigas, rodadaHistoricoSelecionada]);

  const cartelasAExibir = modoExibicao === 'atual' 
      ? cartelasAtuais 
      : cartelasAntigas.filter(c => c.rodada_nome === rodadaHistoricoSelecionada);

  // === NOVIDADE AQUI: Pega a maior pontuação em vez da soma ===
  const bilhetesAprovados = cartelasAExibir.filter(c => c.status_pagamento === 'aprovado');
  const pontuacaoNaTela = bilhetesAprovados.length > 0 
      ? Math.max(...bilhetesAprovados.map(c => c.total_pontos || 0)) 
      : 0;

  return (
    <div style={{ background: "#e2e8f0", paddingBottom: "50px", minHeight: "100vh", paddingTop: "40px" }}>
      <div style={{ maxWidth: "800px", margin: "0 auto", padding: "0 20px" }}>
        
        {/* CABEÇALHO */}
        <div style={{ backgroundColor: "#1e293b", color: "white", borderRadius: "12px", padding: "25px", marginBottom: "20px", display: "flex", justifyContent: "space-between", alignItems: "center", boxShadow: "0 10px 15px -3px rgba(0,0,0,0.1)" }}>
          <div>
            <h2 style={{ margin: 0, color: "white", fontSize: "24px" }}>Meus Bilhetes</h2>
            <span style={{ color: "#94a3b8", fontSize: "16px" }}>{nomeUsuario}</span>
          </div>
          <div style={{ textAlign: "right" }}>
            <div style={{ fontSize: "12px", color: "#fbbf24", fontWeight: "bold", letterSpacing: "1px" }}>{modoExibicao === 'atual' ? 'MELHOR PONTUAÇÃO' : 'PONTOS NO HISTÓRICO'}</div>
            <div style={{ fontSize: "36px", fontWeight: "bold", color: "white", lineHeight: "1" }}>{pontuacaoNaTela}</div>
          </div>
        </div>

        {/* CONTROLE DE ABAS GIGANTES */}
        <div style={{ display: "flex", gap: "10px", marginBottom: "30px", backgroundColor: "white", padding: "10px", borderRadius: "12px", boxShadow: "0 4px 6px rgba(0,0,0,0.05)" }}>
            <button 
                onClick={() => setModoExibicao('atual')}
                style={{ flex: 1, padding: "12px", borderRadius: "8px", border: "none", fontWeight: "bold", fontSize: "16px", cursor: "pointer", transition: "0.2s",
                    backgroundColor: modoExibicao === 'atual' ? "#3b82f6" : "transparent",
                    color: modoExibicao === 'atual' ? "white" : "#64748b"
                }}
            >
                🔥 Rodada Atual
            </button>
            <button 
                onClick={() => setModoExibicao('historico')}
                style={{ flex: 1, padding: "12px", borderRadius: "8px", border: "none", fontWeight: "bold", fontSize: "16px", cursor: "pointer", transition: "0.2s",
                    backgroundColor: modoExibicao === 'historico' ? "#64748b" : "transparent",
                    color: modoExibicao === 'historico' ? "white" : "#64748b"
                }}
            >
                🗂️ Histórico (Anteriores)
            </button>
        </div>

        {/* SE FOR HISTÓRICO, MOSTRA O SELETOR DE RODADAS ANTIGAS */}
        {modoExibicao === 'historico' && nomesRodadasAntigas.length > 0 && (
            <div style={{ marginBottom: "20px", textAlign: "right" }}>
                <select 
                    value={rodadaHistoricoSelecionada} 
                    onChange={(e) => setRodadaHistoricoSelecionada(e.target.value)}
                    style={{ padding: "10px 15px", borderRadius: "8px", border: "1px solid #cbd5e1", fontSize: "16px", fontWeight: "bold", color: "#1e293b", backgroundColor: "white", cursor: "pointer" }}
                >
                    {nomesRodadasAntigas.map(nome => <option key={nome} value={nome}>{nome}</option>)}
                </select>
            </div>
        )}

        {/* LISTAGEM DE CARTELAS */}
        {cartelas.length === 0 ? (
          <div style={{ textAlign: "center", padding: "50px 20px", backgroundColor: "white", borderRadius: "12px" }}>
            <h3 style={{ color: "#64748b", marginBottom: "20px" }}>Você ainda não comprou nenhum bilhete.</h3>
            <AppButton label="Ver Rodadas Abertas" onClick={() => history.push("/public/placar")} style={{ backgroundColor: "#10b981", border: "none", padding: "12px 25px" }} />
          </div>
        ) : (
          <>
            {cartelasAExibir.length === 0 ? (
                <div style={{ textAlign: "center", padding: "40px", color: "#94a3b8", backgroundColor: "white", borderRadius: "12px", fontWeight: "bold" }}>
                    Você não possui bilhetes nesta aba.
                </div>
            ) : (
                cartelasAExibir.map((cartela) => renderCartela(cartela))
            )}
            
            {modoExibicao === 'atual' && rodadaAtualInfo?.status === 'aberta' && (
                <div style={{ textAlign: "center", marginTop: "20px", marginBottom: "40px" }}>
                   <AppButton label="+ Fazer mais palpites nesta rodada" onClick={() => history.push("/public/placar")} style={{ backgroundColor: "#3b82f6", border: "none", padding: "12px 25px" }} />
                </div>
            )}
          </>
        )}

        <div style={{ display: "flex", justifyContent: "center", gap: "20px", marginTop: "30px", flexWrap: "wrap" }}>
          <AppButton style={{ width: "200px", padding: "12px", fontSize: "16px", backgroundColor: "#f59e0b", border: "none" }} label="Ver Ranking" onClick={() => history.push("/public/ranking")} />
          <AppButton style={{ width: "200px", padding: "12px", fontSize: "16px", backgroundColor: "#64748b", border: "none" }} label="Voltar à Home" onClick={() => history.push("/public")} />
        </div>
      </div>
    </div>
  );
}