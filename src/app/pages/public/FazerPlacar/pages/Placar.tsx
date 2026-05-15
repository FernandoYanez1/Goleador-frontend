import React, { useState, useEffect } from "react";
import { useHistory } from "react-router-dom";
import AppButton from "../../../../../vendors/components/Button";

export default function Placar() {
    const history = useHistory();
    const apiUrl = process.env.REACT_APP_API_URL || 'http://localhost:3001';

    const [rodadaAberta, setRodadaAberta] = useState<any>(null);
    const [confrontos, setConfrontos] = useState<any[]>([]);
    const [placares, setPlacares] = useState<any>({});
    const [carregando, setCarregando] = useState(true);
    const [gerando, setGerando] = useState(false);

    useEffect(() => {
        const usuarioSalvo = localStorage.getItem('usuarioLogado');
        if (!usuarioSalvo) {
            history.push('/public/login');
            return;
        }

        fetch(`${apiUrl}/rodadas`)
            .then(res => res.json())
            .then(rodadas => {
                const aberta = rodadas.find((r: any) => r.status === 'aberta');
                if (aberta) {
                    setRodadaAberta(aberta);
                    fetch(`${apiUrl}/jogos?rodada_id=${aberta.id}`)
                        .then(res => res.json())
                        .then(dados => {
                            const jogosOrdenados = dados.sort((a: any, b: any) => new Date(a.data_hora).getTime() - new Date(b.data_hora).getTime());
                            setConfrontos(jogosOrdenados);
                            
                            const initial: any = {};
                            jogosOrdenados.forEach((jogo: any) => { initial[jogo.id] = { casa: "", visitante: "" }; });
                            setPlacares(initial);
                            setCarregando(false);
                        });
                } else {
                    setCarregando(false);
                }
            });
    }, [history, apiUrl]);

    const handlePlacarChange = (jogoId: number, campo: "casa" | "visitante", value: string) => {
        const apenasNumeros = value.replace(/\D/g, "");
        if (apenasNumeros.length > 2) return; 
        setPlacares({ ...placares, [jogoId]: { ...placares[jogoId], [campo]: apenasNumeros } });
    };

    const handleEnviarApostas = async () => {
        if (gerando) return;
        if (!rodadaAberta) return alert("Nenhuma rodada aberta para apostas.");

        const user = JSON.parse(localStorage.getItem('usuarioLogado') || '{}');
        
        const apostasParaEnviar = confrontos.map(jogo => ({
            match_id: jogo.id,
            palpite_casa: placares[jogo.id]?.casa,
            palpite_visitante: placares[jogo.id]?.visitante
        })).filter(a => a.palpite_casa !== "" && a.palpite_visitante !== "");

        if (apostasParaEnviar.length !== confrontos.length) {
            return alert("Preencha o placar de todos os jogos antes de enviar!");
        }

        setGerando(true);

        try {
            const resposta = await fetch(`${apiUrl}/apostar`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ 
                    usuario_id: user.id, 
                    rodada_id: rodadaAberta.id, 
                    apostas: apostasParaEnviar 
                })
            });

            if (resposta.ok) {
                alert("Bilhete gerado com sucesso! Realize o pagamento para validar.");
                history.push("/public/meus-palpites"); 
            } else {
                alert("Erro ao processar o bilhete. Tente novamente.");
                setGerando(false); 
            }
        } catch (error) {
            alert("Erro de conexão com o servidor. Tente novamente.");
            setGerando(false);
        }
    };

    if (carregando) return <div style={{ textAlign: "center", padding: "50px" }}>Carregando jogos...</div>;

    return (
        <div style={{ background: "#e2e8f0", paddingBottom: "50px", minHeight: "100vh", paddingTop: "40px" }}>
            <div style={{ background: "white", borderRadius: "12px", padding: "30px 15px", maxWidth: "700px", margin: "0 auto", boxShadow: "0 10px 15px -3px rgba(0,0,0,0.1)" }}>
                
                {!rodadaAberta ? (
                    <div style={{ textAlign: "center", padding: "40px 10px" }}>
                        <h2 style={{ color: "#ef4444", fontSize: "32px", marginBottom: "15px" }}>🔒 Apostas Encerradas</h2>
                        <p style={{ color: "#475569", fontSize: "18px", marginBottom: "30px" }}>
                            No momento não há nenhuma rodada aberta para palpites. Acompanhe os resultados na tela de palpites!
                        </p>
                        <AppButton style={{ padding: "15px 40px", fontSize: "18px", backgroundColor: "#f59e0b", border: "none" }} label="Meus Palpites" onClick={() => history.push("/public/meus-palpites")} />
                    </div>
                ) : (
                    <>
                        <h2 style={{ color: "#1e293b", textAlign: "center", marginBottom: "5px", fontSize: "28px" }}>Faça sua Aposta</h2>
                        <div style={{ textAlign: "center", color: "#10b981", fontWeight: "bold", marginBottom: "25px", fontSize: "18px" }}>
                            Rodada Atual: {rodadaAberta.nome}
                        </div>
                        
                        {confrontos.length === 0 ? (
                            <div style={{ textAlign: "center", padding: "40px 20px", backgroundColor: "#f8fafc", borderRadius: "12px", border: "1px dashed #cbd5e1" }}>
                                <h3 style={{ color: "#f59e0b", marginBottom: "10px" }}>Aguardando Jogos... ⏳</h3>
                                <p style={{ color: "#64748b", fontSize: "16px" }}>
                                    O administrador abriu a rodada, mas ainda está cadastrando as partidas. Volte em breve!
                                </p>
                                <AppButton style={{ marginTop: "20px", width: "200px", padding: "12px", backgroundColor: "#64748b", border: "none" }} label="Voltar" onClick={() => history.push("/public")} />
                            </div>
                        ) : (
                            <>
                                <div style={{ textAlign: "center", marginBottom: "30px", padding: "10px", borderRadius: "8px", backgroundColor: "#f0fdf4", color: "#16a34a", fontWeight: "bold", fontSize: "14px" }}>
                                    💡 Dica: Você pode comprar múltiplos bilhetes preenchendo novos palpites após enviar!
                                </div>

                                {confrontos.map(jogo => (
                                    <div key={jogo.id} style={{ marginBottom: "20px", padding: "15px", backgroundColor: "#f8fafc", borderRadius: "12px", border: "1px solid #e2e8f0" }}>
                                        <div style={{ textAlign: "center", marginBottom: "15px", color: "#64748b", fontWeight: "bold", fontSize: "13px" }}>
                                            {new Date(jogo.data_hora).toLocaleString('pt-BR', { dateStyle: 'short', timeStyle: 'short' })}
                                        </div>
                                        
                                        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", width: "100%" }}>
                                            
                                            {/* TIME CASA */}
                                            <div style={{ textAlign: 'center', width: '30%', minWidth: '70px' }}>
                                                <img src={jogo.logo_casa || "/media/escudos-times/default.png"} alt="Casa" style={{ width: '45px', height: '45px', objectFit: 'contain', marginBottom: "5px" }} />
                                                <div style={{ fontSize: "14px", fontWeight: "bold", color: "#1e293b", textOverflow: "ellipsis", overflow: "hidden", whiteSpace: "nowrap" }}>
                                                    {jogo.sigla_casa || jogo.time_casa.substring(0,3).toUpperCase()}
                                                </div>
                                                <div style={{ fontSize: "11px", color: "#64748b", textOverflow: "ellipsis", overflow: "hidden", whiteSpace: "nowrap", marginTop: "2px" }}>
                                                    {jogo.time_casa}
                                                </div>
                                            </div>

                                            {/* PLACAR (INPUTS) */}
                                            <div style={{ display: "flex", alignItems: "center", justifyContent: "center", width: "40%", gap: "8px" }}>
                                                <input
                                                    type="number" min="0" max="99"
                                                    value={placares[jogo.id]?.casa || ""}
                                                    onChange={(e) => handlePlacarChange(jogo.id, "casa", e.target.value)}
                                                    disabled={gerando}
                                                    style={{ width: "45px", height: "45px", textAlign: "center", fontSize: "18px", fontWeight: "bold", border: "2px solid #cbd5e1", borderRadius: "8px", opacity: gerando ? 0.6 : 1, padding: "0" }}
                                                />
                                                <span style={{ fontSize: "16px", fontWeight: "bold", color: "#94a3b8" }}>X</span>
                                                <input
                                                    type="number" min="0" max="99"
                                                    value={placares[jogo.id]?.visitante || ""}
                                                    onChange={(e) => handlePlacarChange(jogo.id, "visitante", e.target.value)}
                                                    disabled={gerando}
                                                    style={{ width: "45px", height: "45px", textAlign: "center", fontSize: "18px", fontWeight: "bold", border: "2px solid #cbd5e1", borderRadius: "8px", opacity: gerando ? 0.6 : 1, padding: "0" }}
                                                />
                                            </div>

                                            {/* TIME VISITANTE */}
                                            <div style={{ textAlign: 'center', width: '30%', minWidth: '70px' }}>
                                                <img src={jogo.logo_visitante || "/media/escudos-times/default.png"} alt="Visitante" style={{ width: '45px', height: '45px', objectFit: 'contain', marginBottom: "5px" }} />
                                                <div style={{ fontSize: "14px", fontWeight: "bold", color: "#1e293b", textOverflow: "ellipsis", overflow: "hidden", whiteSpace: "nowrap" }}>
                                                    {jogo.sigla_visitante || jogo.time_visitante.substring(0,3).toUpperCase()}
                                                </div>
                                                <div style={{ fontSize: "11px", color: "#64748b", textOverflow: "ellipsis", overflow: "hidden", whiteSpace: "nowrap", marginTop: "2px" }}>
                                                    {jogo.time_visitante}
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                ))}

                                <div style={{ display: "flex", justifyContent: "center", flexWrap: "wrap", gap: "15px", marginTop: "30px" }}>
                                    <AppButton 
                                        style={{ 
                                            width: "100%", maxWidth: "300px", 
                                            padding: "12px", 
                                            fontSize: "16px", 
                                            backgroundColor: gerando ? "#94a3b8" : "#10b981", 
                                            border: "none",
                                            cursor: gerando ? "not-allowed" : "pointer"
                                        }} 
                                        label={gerando ? "Gerando..." : "Gerar Bilhete (R$20)"} 
                                        onClick={handleEnviarApostas} 
                                        disabled={gerando} 
                                    />
                                    <AppButton 
                                        style={{ width: "100%", maxWidth: "300px", padding: "12px", fontSize: "16px", backgroundColor: "#64748b", border: "none" }} 
                                        label="Voltar" 
                                        onClick={() => history.push("/public")} 
                                        disabled={gerando}
                                    />
                                </div>
                            </>
                        )}
                    </>
                )}
            </div>
        </div>
    );
}