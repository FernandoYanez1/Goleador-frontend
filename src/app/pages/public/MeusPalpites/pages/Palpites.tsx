import React, { useState, useEffect } from "react";
import { useHistory } from "react-router-dom";
import AppButton from "../../../../../vendors/components/Button";
import { Tooltip } from '@mui/material';

export default function MeusPalpites() {
  const history = useHistory();
  const apiUrl = process.env.REACT_APP_API_URL || 'http://localhost:3001';
  
  const [cartelas, setCartelas] = useState<any[]>([]);
  const [nomeUsuario, setNomeUsuario] = useState("");
  const [pontuacaoGeral, setPontuacaoGeral] = useState(0);

  useEffect(() => {
    const usuarioSalvo = localStorage.getItem("usuarioLogado");
    if (!usuarioSalvo) {
      history.push("/public/login");
      return;
    }
    const user = JSON.parse(usuarioSalvo);
    setNomeUsuario(user.nome);

    fetch(`${apiUrl}/meus-palpites/${user.id}`)
      .then((res) => res.json())
      .then((dados) => {
        setCartelas(dados);
        
        // Soma os pontos de todas as cartelas aprovadas para mostrar no topo
        const total = dados
          .filter((c: any) => c.status_pagamento === 'aprovado')
          .reduce((acc: number, c: any) => acc + c.total_pontos, 0);
        setPontuacaoGeral(total);
      })
      .catch((err) => console.error("Erro ao buscar palpites:", err));
  }, [history, apiUrl]);

  // Nova lógica de cores muito mais inteligente lendo direto do Backend!
  const getRegraInfo = (p: any) => {
    if (p.gols_casa === null || p.gols_visitante === null) return { texto: "Aguardando jogo acabar", cor: "#94a3b8" }; 
    
    if (p.pontos_ganhos === 15) return { texto: "👑 Placar Exato (15 pts)", cor: "#8b5cf6" };
    if (p.pontos_ganhos === 10) return { texto: "🎯 Resultado + Gols de um time (10 pts)", cor: "#10b981" };
    if (p.pontos_ganhos === 8) return { texto: "✅ Acertou o Vencedor/Empate (8 pts)", cor: "#0ea5e9" };
    if (p.pontos_ganhos === 3) return { texto: "⚽ Acertou a Soma Exata de Gols (3 pts)", cor: "#f97316" };
    
    return { texto: "❌ Errou (0 pts)", cor: "#64748b" }; 
  };

  const formatarData = (dataStr: string) => {
      const d = new Date(dataStr);
      return isNaN(d.getTime()) ? dataStr : d.toLocaleString("pt-BR", { dateStyle: "short", timeStyle: "short" });
  };

  const renderCartela = (cartela: any) => {
    const isAprovado = cartela.status_pagamento === 'aprovado';
    const mensagemWpp = encodeURIComponent(`Fala Fernando! Segue meu comprovante do bolão. (Meu nome é: ${nomeUsuario} | Cartela #${cartela.cartela_id})`);
    const linkWhatsapp = `https://wa.me/5561983209025?text=${mensagemWpp}`;

    return (
      <div key={cartela.cartela_id} style={{ backgroundColor: "white", borderRadius: "12px", padding: "20px", marginBottom: "40px", boxShadow: "0 10px 15px -3px rgba(0,0,0,0.1)", borderTop: isAprovado ? "8px solid #10b981" : "8px solid #f59e0b" }}>
        
        {/* Cabeçalho da Cartela */}
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", borderBottom: "1px solid #e2e8f0", paddingBottom: "15px", marginBottom: "20px" }}>
          <div>
            <h3 style={{ margin: 0, color: "#1e293b", fontSize: "20px" }}>Cartela #{cartela.cartela_id}</h3>
            <span style={{ color: "#64748b", fontSize: "14px", fontWeight: "bold" }}>{cartela.rodada_nome}</span>
          </div>
          <div style={{ textAlign: "right" }}>
            <div style={{ fontSize: "12px", color: "#94a3b8", fontWeight: "bold" }}>PONTOS DESTA CARTELA</div>
            <div style={{ fontSize: "24px", fontWeight: "900", color: isAprovado ? "#10b981" : "#94a3b8" }}>{isAprovado ? cartela.total_pontos : "---"}</div>
          </div>
        </div>

        {/* Bloco de Pagamento (Só aparece se estiver pendente) */}
        {!isAprovado && (
          <div style={{ backgroundColor: "#fffbeb", border: "2px dashed #f59e0b", borderRadius: "12px", padding: "20px", marginBottom: "25px", textAlign: "center" }}>
            <h4 style={{ color: "#b45309", margin: "0 0 10px 0", fontSize: "18px" }}>⚠️ Cartela Aguardando Pagamento</h4>
            <p style={{ color: "#475569", marginBottom: "20px", fontSize: "14px" }}>Pix de <b>R$ 25,00</b> para validar esta cartela específica.</p>

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

            <a href={linkWhatsapp} target="_blank" rel="noopener noreferrer" style={{ display: "inline-flex", alignItems: "center", gap: "10px", backgroundColor: "#25D366", color: "white", padding: "10px 20px", borderRadius: "8px", textDecoration: "none", fontWeight: "bold", fontSize: "14px", marginTop: "20px", transition: "all 0.3s" }}>
              <i className="pi pi-whatsapp"></i> Enviar Comprovante
            </a>
          </div>
        )}

        {/* Lista de Jogos (Palpites) da Cartela */}
        <div style={{ display: "flex", flexDirection: "column", gap: "15px" }}>
          {cartela.palpites.map((p: any, index: number) => {
            const jogoFinalizado = p.gols_casa !== null && p.gols_visitante !== null;
            const info = getRegraInfo(p);

            return (
              <div key={index} style={{ backgroundColor: "#f8fafc", borderRadius: "8px", padding: "15px", border: "1px solid #e2e8f0" }}>
                <div style={{ textAlign: "center", color: "#64748b", fontSize: "12px", fontWeight: "bold", marginBottom: "10px" }}>📅 {formatarData(cartela.data_criacao)}</div>
                
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
                    <div style={{ color: "#ef4444", fontSize: "11px", fontWeight: "bold" }}>Sem pontos (Cartela não paga)</div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    );
  };

  return (
    <div style={{ background: "#e2e8f0", paddingBottom: "50px", minHeight: "100vh", paddingTop: "40px" }}>
      <div style={{ maxWidth: "800px", margin: "0 auto", padding: "0 20px" }}>
        
        {/* CABEÇALHO GERAL */}
        <div style={{ backgroundColor: "#1e293b", color: "white", borderRadius: "12px", padding: "25px", marginBottom: "30px", display: "flex", justifyContent: "space-between", alignItems: "center", boxShadow: "0 10px 15px -3px rgba(0,0,0,0.1)" }}>
          <div>
            <h2 style={{ margin: 0, color: "white", fontSize: "24px" }}>Minhas Cartelas</h2>
            <span style={{ color: "#94a3b8", fontSize: "16px" }}>{nomeUsuario}</span>
          </div>
          <div style={{ textAlign: "right" }}>
            <div style={{ fontSize: "12px", color: "#fbbf24", fontWeight: "bold", letterSpacing: "1px" }}>PONTOS VALIDADOS</div>
            <div style={{ fontSize: "36px", fontWeight: "bold", color: "white", lineHeight: "1" }}>{pontuacaoGeral}</div>
          </div>
        </div>

        {/* LISTAGEM DE CARTELAS */}
        {cartelas.length === 0 ? (
          <div style={{ textAlign: "center", padding: "50px 20px", backgroundColor: "white", borderRadius: "12px" }}>
            <h3 style={{ color: "#64748b", marginBottom: "20px" }}>Você ainda não comprou nenhuma cartela.</h3>
            <AppButton label="Ver Rodadas Abertas" onClick={() => history.push("/public/placar")} style={{ backgroundColor: "#10b981", border: "none", padding: "12px 25px" }} />
          </div>
        ) : (
          <>
            {cartelas.map((cartela) => renderCartela(cartela))}
            
            <div style={{ textAlign: "center", marginTop: "20px", marginBottom: "40px" }}>
               <AppButton label="+ Fazer mais palpites nesta rodada" onClick={() => history.push("/public/placar")} style={{ backgroundColor: "#3b82f6", border: "none", padding: "12px 25px" }} />
            </div>
          </>
        )}

        <div style={{ display: "flex", justifyContent: "center", gap: "20px", marginTop: "30px", flexWrap: "wrap" }}>
          <AppButton style={{ width: "200px", padding: "12px", fontSize: "16px", backgroundColor: "#f59e0b", border: "none" }} label="Ver Ranking Geral" onClick={() => history.push("/public/ranking")} />
          <AppButton style={{ width: "200px", padding: "12px", fontSize: "16px", backgroundColor: "#64748b", border: "none" }} label="Voltar à Home" onClick={() => history.push("/public")} />
        </div>
      </div>
    </div>
  );
}