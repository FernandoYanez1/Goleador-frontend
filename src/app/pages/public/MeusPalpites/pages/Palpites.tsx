import React, { useState, useEffect } from "react";
import { useHistory } from "react-router-dom";
import AppButton from "../../../../../vendors/components/Button";
import { Tooltip } from '@mui/material';

export default function MeusPalpites() {
  const history = useHistory();
  const [palpitesFeitos, setPalpitesFeitos] = useState<any[]>([]);
  const [pontuacaoTotal, setPontuacaoTotal] = useState(0);
  const [nomeUsuario, setNomeUsuario] = useState("");
  const [pagamentoAprovado, setPagamentoAprovado] = useState(false);

  useEffect(() => {
    const usuarioSalvo = localStorage.getItem("usuarioLogado");
    if (!usuarioSalvo) {
      history.push("/public/login");
      return;
    }
    const user = JSON.parse(usuarioSalvo);
    setNomeUsuario(user.nome);

    // 1. Busca os palpites feitos
    fetch(`http://localhost:3001/meus-palpites/${user.id}`)
      .then((res) => res.json())
      .then((dados) => {
        setPalpitesFeitos(dados);
        const total = dados.reduce((acc: number, curr: any) => acc + (curr.pontos_ganhos || 0), 0);
        setPontuacaoTotal(total);
      })
      .catch((err) => console.error("Erro ao buscar palpites:", err));

    // 2. Busca o status do pagamento (Via ranking)
    fetch(`http://localhost:3001/ranking`)
      .then((res) => res.json())
      .then((dados) => {
        if (Array.isArray(dados)) {
            const meuUsuario = dados.find((u: any) => Number(u.id) === Number(user.id));
            if (meuUsuario && meuUsuario.pago === 1) setPagamentoAprovado(true);
            else setPagamentoAprovado(false);
        }
      })
      .catch((err) => console.error("Erro ao verificar pagamento:", err));
      
  }, [history]);

  const getRegraInfo = (p: any) => {
    if (p.resultado_real_casa === null) return { texto: "Aguardando jogo acabar", cor: "#94a3b8" }; 
    const palC = Number(p.palpite_casa), palV = Number(p.palpite_visitante);
    const realC = Number(p.resultado_real_casa), realV = Number(p.resultado_real_visitante);
    const vR = realC > realV ? 'casa' : (realV > realC ? 'visitante' : 'empate');
    const vP = palC > palV ? 'casa' : (palV > palC ? 'visitante' : 'empate');

    if (palC === realC && palV === realV) return { texto: "👑 Placar Exato (15 pts)", cor: "#8b5cf6" }; 
    if (vR === vP) {
        if (vR !== 'empate' && (palC === realC || palV === realV)) return { texto: "🎯 Resultado + Gols (10 pts)", cor: "#10b981" }; 
        return { texto: "✅ Acertou apenas o Resultado (8 pts)", cor: "#0ea5e9" }; 
    }
    if (palC + palV === realC + realV) return { texto: "⚽ Soma Exata da Partida (3 pts)", cor: "#f97316" }; 
    return { texto: "❌ Errou (0 pts)", cor: "#64748b" }; 
  };

  const formatarData = (dataStr: string) => {
      const d = new Date(dataStr);
      return isNaN(d.getTime()) ? dataStr : d.toLocaleString("pt-BR", { dateStyle: "short", timeStyle: "short" });
  };

  const renderOpcoesJogo = (p: any) => {
    const jogoFinalizado = p.resultado_real_casa !== null;
    const info = getRegraInfo(p); 

    return (
      <div key={p.id} style={{ backgroundColor: 'white', marginBottom: '20px', borderRadius: '12px', padding: '20px', boxShadow: '0 4px 10px rgba(0,0,0,0.05)', position: 'relative' }}>
        <div style={{ textAlign: 'center', color: '#64748b', fontWeight: 'bold', marginBottom: '15px' }}>📅 {formatarData(p.data_hora)}</div>

        <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '20px', marginBottom: '15px', flexWrap: "wrap" }}>
          
          <div style={{ textAlign: 'center', width: '70px' }}>
            <img src={p.logo_casa || "/media/escudos-times/default.png"} alt="Casa" style={{ width: '40px', height: '40px', objectFit: 'contain', marginBottom: "5px" }} onError={(e: any) => e.target.src = "/media/escudos-times/default.png"} />
            <div style={{ fontSize: '13px', fontWeight: "bold", color: '#1e293b' }}>{p.sigla_casa}</div>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <div style={{ width: "45px", height: "45px", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "20px", fontWeight: "bold", borderRadius: "8px", border: "2px solid #cbd5e1", backgroundColor: "#f8fafc", color: "#1e293b" }}>{p.palpite_casa}</div>
            <span style={{ fontSize: "20px", fontWeight: "bold", color: '#94a3b8' }}>X</span>
            <div style={{ width: "45px", height: "45px", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "20px", fontWeight: "bold", borderRadius: "8px", border: "2px solid #cbd5e1", backgroundColor: "#f8fafc", color: "#1e293b" }}>{p.palpite_visitante}</div>
          </div>

          <div style={{ textAlign: 'center', width: '70px' }}>
            <img src={p.logo_visitante || "/media/escudos-times/default.png"} alt="Visitante" style={{ width: '40px', height: '40px', objectFit: 'contain', marginBottom: "5px" }} onError={(e: any) => e.target.src = "/media/escudos-times/default.png"} />
            <div style={{ fontSize: '13px', fontWeight: "bold", color: '#1e293b' }}>{p.sigla_visitante}</div>
          </div>
        </div>

        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderTop: "1px solid #f1f5f9", paddingTop: "15px", marginTop: "10px" }}>
          <div style={{ fontSize: "14px", color: "#64748b" }}>
            Oficial: <strong style={{ color: jogoFinalizado ? "#1e293b" : "#f59e0b" }}>{jogoFinalizado ? `${p.resultado_real_casa} x ${p.resultado_real_visitante}` : "Aguardando..."}</strong>
          </div>
          
          {jogoFinalizado && (
            <Tooltip title={info.texto} arrow placement="top">
              <div style={{ backgroundColor: info.cor, color: "white", padding: "4px 12px", borderRadius: "20px", fontWeight: "bold", fontSize: "13px", cursor: "help" }}>
                +{p.pontos_ganhos} pts
              </div>
            </Tooltip>
          )}
        </div>
      </div>
    );
  };

  const palpitesPendentes = palpitesFeitos.filter((p) => p.resultado_real_casa === null);
  const palpitesFinalizados = palpitesFeitos.filter((p) => p.resultado_real_casa !== null);

  // Link do WhatsApp com texto dinâmico (com o nome da pessoa)
  const mensagemWpp = encodeURIComponent(`Fala Fernando! Segue meu comprovante do bolão. (Meu nome é: ${nomeUsuario})`);
  const linkWhatsapp = `https://wa.me/5561983209025?text=${mensagemWpp}`;

  return (
    <div style={{ background: "#e2e8f0", paddingBottom: "50px", minHeight: "100vh", paddingTop: "40px" }}>
      <div style={{ maxWidth: "800px", margin: "0 auto", padding: "0 20px" }}>
        
        {/* CABEÇALHO */}
        <div style={{ backgroundColor: "#1e293b", color: "white", borderRadius: "12px", padding: "25px", marginBottom: "30px", display: "flex", justifyContent: "space-between", alignItems: "center", boxShadow: "0 10px 15px -3px rgba(0,0,0,0.1)" }}>
          <div>
            <h2 style={{ margin: 0, color: "white", fontSize: "24px" }}>Meus Palpites</h2>
            <span style={{ color: "#94a3b8", fontSize: "16px" }}>{nomeUsuario}</span>
          </div>
          <div style={{ textAlign: "right" }}>
            <div style={{ fontSize: "12px", color: "#fbbf24", fontWeight: "bold", letterSpacing: "1px" }}>PONTOS TOTAIS</div>
            <div style={{ fontSize: "36px", fontWeight: "bold", color: "white", lineHeight: "1" }}>{pontuacaoTotal}</div>
          </div>
        </div>

        {/* --- LÓGICA DO PIX & WHATSAPP --- */}
        {palpitesFeitos.length > 0 && (
            pagamentoAprovado ? (
                <div style={{ backgroundColor: "#ecfdf5", border: "2px solid #10b981", borderRadius: "12px", padding: "20px", marginBottom: "30px", textAlign: "center" }}>
                    <h3 style={{ color: "#047857", margin: "0 0 5px 0", fontSize: "22px" }}>✅ Pagamento Confirmado!</h3>
                    <p style={{ color: "#065f46", margin: 0 }}>Você está participando oficialmente da rodada. Boa sorte!</p>
                </div>
            ) : (
                <div style={{ backgroundColor: "#fffbeb", border: "2px dashed #f59e0b", borderRadius: "12px", padding: "30px 20px", marginBottom: "30px", textAlign: "center" }}>
                    <h3 style={{ color: "#b45309", margin: "0 0 10px 0", fontSize: "22px" }}>⚠️ Valide sua Participação!</h3>
                    <p style={{ color: "#475569", marginBottom: "25px", fontSize: "16px" }}>
                        Realize o PIX de <b>R$ 25,00</b> para confirmar sua entrada na rodada.
                    </p>

                    <div style={{ display: "flex", flexWrap: "wrap", justifyContent: "center", gap: "20px", alignItems: "center" }}>
                        <div style={{ backgroundColor: "white", padding: "10px", borderRadius: "10px", boxShadow: "0 2px 4px rgba(0,0,0,0.1)" }}>
                            <img src="https://api.qrserver.com/v1/create-qr-code/?size=130x130&data=04415991173" alt="QR Code PIX" style={{ width: "130px", height: "130px" }} />
                            <div style={{ fontSize: "12px", color: "#64748b", marginTop: "5px", fontWeight: "bold" }}>Escaneie</div>
                        </div>

                        <div style={{ backgroundColor: "#fef3c7", padding: "20px", borderRadius: "8px", textAlign: "left", minWidth: "220px" }}>
                            <div style={{ fontSize: "12px", fontWeight: "bold", color: "#92400e" }}>CHAVE PIX (CPF):</div>
                            <div style={{ fontSize: "22px", fontWeight: "900", color: "#d97706", marginBottom: "10px", userSelect: "all" }}>044.159.911-73</div>
                            <div style={{ fontSize: "12px", fontWeight: "bold", color: "#92400e" }}>RECEBEDOR:</div>
                            <div style={{ fontSize: "16px", fontWeight: "bold", color: "#b45309" }}>Fernando Yañez</div>
                        </div>
                    </div>
                    
                    {/* BOTÃO DO WHATSAPP */}
                    <div style={{ marginTop: "30px" }}>
                        <a 
                            href={linkWhatsapp}
                            target="_blank" 
                            rel="noopener noreferrer"
                            style={{ 
                                display: "inline-flex", alignItems: "center", justifyContent: "center", gap: "10px",
                                backgroundColor: "#25D366", color: "white", padding: "14px 28px", borderRadius: "8px", 
                                textDecoration: "none", fontWeight: "bold", fontSize: "16px", boxShadow: "0 4px 6px rgba(37, 211, 102, 0.3)",
                                transition: "all 0.3s"
                            }}
                        >
                            <i className="pi pi-whatsapp" style={{ fontSize: "1.2rem" }}></i>
                            Enviar Comprovante no WhatsApp
                        </a>
                        <p style={{ color: "#64748b", marginTop: "15px", fontStyle: "italic", fontSize: "13px" }}>
                            O aviso sumirá assim que o pagamento for validado pelo administrador.
                        </p>
                    </div>
                </div>
            )
        )}

        {/* --- LISTAGEM DE PALPITES --- */}
        {palpitesFeitos.length === 0 ? (
          <div style={{ textAlign: "center", padding: "50px 20px", backgroundColor: "white", borderRadius: "12px" }}>
            <h3 style={{ color: "#64748b", marginBottom: "20px" }}>Você ainda não fez seus palpites para esta rodada.</h3>
            <AppButton label="Fazer Palpites Agora" onClick={() => history.push("/public/placar")} style={{ backgroundColor: "#10b981", border: "none", padding: "12px 25px" }} />
          </div>
        ) : (
          <>
            {palpitesPendentes.length > 0 && (
              <>
                <h3 style={{ color: "#475569", borderBottom: "2px solid #cbd5e1", paddingBottom: "10px", marginTop: "10px", fontSize: "18px" }}>⏳ Aguardando Resultado</h3>
                {palpitesPendentes.map((p) => renderOpcoesJogo(p))}
              </>
            )}

            {palpitesFinalizados.length > 0 && (
              <>
                <h3 style={{ color: "#475569", borderBottom: "2px solid #cbd5e1", paddingBottom: "10px", marginTop: "20px", fontSize: "18px" }}>✅ Jogos Encerrados</h3>
                {palpitesFinalizados.map((p) => renderOpcoesJogo(p))}
              </>
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