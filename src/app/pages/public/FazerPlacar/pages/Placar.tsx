import React, { useState, useEffect } from "react";
import { useHistory } from "react-router-dom";
import AppButton from "../../../../../vendors/components/Button";

export default function Placar() {
    const history = useHistory();
    const [confrontos, setConfrontos] = useState<any[]>([]);
    const [placares, setPlacares] = useState<any>({});
    const [bloqueado, setBloqueado] = useState(false);
    const [prazoLimite, setPrazoLimite] = useState<Date | null>(null);
    const [jaApostou, setJaApostou] = useState(false); 

    useEffect(() => {
        const usuarioSalvo = localStorage.getItem('usuarioLogado');
        if (!usuarioSalvo) {
            history.push('/public/login');
            return;
        }
        const user = JSON.parse(usuarioSalvo);

        // 1. Verifica se já apostou
        fetch(`http://localhost:3001/meus-palpites/${user.id}`)
            .then(res => res.json())
            .then(dados => {
                if (dados.length > 0) setJaApostou(true);
            });

        // 2. Verifica prazo
        fetch('http://localhost:3001/config/prazo')
            .then(res => res.json())
            .then(data => {
                if (data.prazo) {
                    const dataLimite = new Date(data.prazo);
                    setPrazoLimite(dataLimite);
                    if (new Date() > dataLimite) setBloqueado(true);
                }
            });

        // 3. Busca os jogos E ORDENA POR DATA/HORA
        fetch('http://localhost:3001/jogos')
            .then(res => res.json())
            .then(dados => {
                // Ordenação mágica acontecendo aqui:
                const jogosOrdenados = dados.sort((a: any, b: any) => new Date(a.data_hora).getTime() - new Date(b.data_hora).getTime());
                
                setConfrontos(jogosOrdenados);
                const initial: any = {};
                jogosOrdenados.forEach((jogo: any) => { initial[jogo.id] = { casa: "", visitante: "" }; });
                setPlacares(initial);
            });
    }, [history]);

    const handlePlacarChange = (jogoId: number, campo: "casa" | "visitante", value: string) => {
        if (bloqueado || jaApostou) return;
        const apenasNumeros = value.replace(/\D/g, "");
        setPlacares({ ...placares, [jogoId]: { ...placares[jogoId], [campo]: apenasNumeros } });
    };

    const handleEnviarApostas = async () => {
        if (bloqueado) return alert("O prazo para apostas já encerrou!");
        if (jaApostou) return alert("Você já registrou seus palpites!");

        const user = JSON.parse(localStorage.getItem('usuarioLogado') || '{}');
        const apostasParaEnviar = confrontos.map(jogo => ({
            usuario_id: user.id, match_id: jogo.id,
            palpite_casa: placares[jogo.id]?.casa,
            palpite_visitante: placares[jogo.id]?.visitante
        })).filter(a => a.palpite_casa !== "" && a.palpite_visitante !== "");

        if (apostasParaEnviar.length === 0) return alert("Preencha pelo menos um palpite!");

        try {
            const resposta = await fetch('http://localhost:3001/apostar', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ apostas: apostasParaEnviar })
            });

            if (resposta.ok) {
                alert("Palpites salvos! Realize o pagamento para validar.");
                history.push("/public/meus-palpites"); 
            }
        } catch (error) {
            alert("Erro de conexão.");
        }
    };

    return (
        <div style={{ background: "#e2e8f0", paddingBottom: "50px", minHeight: "100vh", paddingTop: "40px" }}>
            <div style={{ background: "white", borderRadius: "12px", padding: "30px 20px", maxWidth: "800px", margin: "0 auto", boxShadow: "0 10px 15px -3px rgba(0,0,0,0.1)" }}>
                
                {jaApostou ? (
                    <div style={{ textAlign: "center", padding: "40px 10px" }}>
                        <h2 style={{ color: "#10b981", fontSize: "32px", marginBottom: "15px" }}>✅ Palpites Registrados!</h2>
                        <p style={{ color: "#475569", fontSize: "18px", marginBottom: "30px" }}>
                            Você já preencheu seus palpites para esta rodada. Vá para a página de acompanhamento para ver os resultados e o status do seu pagamento.
                        </p>
                        <AppButton 
                            style={{ padding: "15px 40px", fontSize: "18px", backgroundColor: "#f59e0b", border: "none" }} 
                            label="Ir para Meus Palpites" 
                            onClick={() => history.push("/public/meus-palpites")} 
                        />
                    </div>
                ) : (
                    <>
                        <h2 style={{ color: "#1e293b", textAlign: "center", marginBottom: "20px", fontSize: "28px" }}>Faça seus Palpites</h2>
                        
                        {prazoLimite && (
                            <div style={{ textAlign: "center", marginBottom: "30px", padding: "10px", borderRadius: "8px", backgroundColor: bloqueado ? "#fee2e2" : "#f0fdf4", color: bloqueado ? "#ef4444" : "#10b981", fontWeight: "bold" }}>
                                {bloqueado ? "⚠️ APOSTAS ENCERRADAS PARA A RODADA" : `⏳ Prazo final para apostas: ${prazoLimite.toLocaleString('pt-BR')}`}
                            </div>
                        )}

                        {confrontos.map(jogo => (
                            <div key={jogo.id} style={{ marginBottom: "20px", padding: "20px", backgroundColor: "#f8fafc", borderRadius: "12px", border: "1px solid #e2e8f0" }}>
                                <div style={{ textAlign: "center", marginBottom: "15px", color: "#64748b", fontWeight: "bold" }}>
                                    {new Date(jogo.data_hora).toLocaleString('pt-BR', { dateStyle: 'short', timeStyle: 'short' })}
                                </div>
                                
                                <div style={{ display: "flex", justifyContent: "center", alignItems: "center", gap: "20px", flexWrap: "wrap" }}>
                                    <div style={{ textAlign: 'center', width: '80px' }}>
                                        <img src={jogo.logo_casa || "/media/escudos-times/default.png"} alt="Casa" style={{ width: '45px', height: '45px', objectFit: 'contain', marginBottom: "5px" }} onError={(e: any) => { e.target.src = "/media/escudos-times/default.png"; }} />
                                        <div style={{ fontSize: "14px", fontWeight: "bold", color: "#1e293b" }}>{jogo.sigla_casa || jogo.time_casa.substring(0,3).toUpperCase()}</div>
                                    </div>

                                    <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                                        <input
                                            type="number" min="0" disabled={bloqueado}
                                            value={placares[jogo.id]?.casa || ""}
                                            onChange={(e) => handlePlacarChange(jogo.id, "casa", e.target.value)}
                                            style={{ width: "55px", height: "45px", textAlign: "center", fontSize: "20px", fontWeight: "bold", border: "2px solid #cbd5e1", borderRadius: "8px", backgroundColor: bloqueado ? "#f1f5f9" : "white" }}
                                        />
                                        <span style={{ fontSize: "20px", fontWeight: "bold", color: "#94a3b8" }}>X</span>
                                        <input
                                            type="number" min="0" disabled={bloqueado}
                                            value={placares[jogo.id]?.visitante || ""}
                                            onChange={(e) => handlePlacarChange(jogo.id, "visitante", e.target.value)}
                                            style={{ width: "55px", height: "45px", textAlign: "center", fontSize: "20px", fontWeight: "bold", border: "2px solid #cbd5e1", borderRadius: "8px", backgroundColor: bloqueado ? "#f1f5f9" : "white" }}
                                        />
                                    </div>

                                    <div style={{ textAlign: 'center', width: '80px' }}>
                                        <img src={jogo.logo_visitante || "/media/escudos-times/default.png"} alt="Visitante" style={{ width: '45px', height: '45px', objectFit: 'contain', marginBottom: "5px" }} onError={(e: any) => { e.target.src = "/media/escudos-times/default.png"; }} />
                                        <div style={{ fontSize: "14px", fontWeight: "bold", color: "#1e293b" }}>{jogo.sigla_visitante || jogo.time_visitante.substring(0,3).toUpperCase()}</div>
                                    </div>
                                </div>
                            </div>
                        ))}

                        <div style={{ display: "flex", justifyContent: "center", gap: "20px", marginTop: "30px" }}>
                            {!bloqueado && (
                                <AppButton style={{ width: "220px", padding: "12px", fontSize: "18px", backgroundColor: "#10b981", border: "none" }} label="Salvar Palpites" onClick={handleEnviarApostas} />
                            )}
                            <AppButton style={{ width: "220px", padding: "12px", fontSize: "18px", backgroundColor: "#64748b", border: "none" }} label="Voltar" onClick={() => history.push("/public")} />
                        </div>
                    </>
                )}
            </div>
        </div>
    );
}