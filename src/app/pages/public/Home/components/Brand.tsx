import React, { useState, useEffect } from "react";
import { useHistory } from "react-router-dom";
import AppButton from "../../../../../vendors/components/Button";

export default function Brand() {
    const history = useHistory();
    const [usuarioLogado, setUsuarioLogado] = useState<any>(null);

    // Assim que a tela carrega, verifica se tem alguém logado
    useEffect(() => {
        const salvo = localStorage.getItem("usuarioLogado");
        if (salvo) {
            setUsuarioLogado(JSON.parse(salvo));
        }
    }, []);

    const handleCriarContaClick = () => {
        history.push("/public/contato");
    };

    const handleFazerPalpiteClick = () => {
        history.push("/public/placar");
    };

    return (
        <>
            <div className="public-brand-wrapper no-cursor">
                <img className="public-topbar-logo no-cursor" src="/media/landing-page/lambreta-white.png" alt="Lambreta" />
                <div>
                    <h1>BOLÃO GOLEADOR VIP</h1>
                    <label>FEITO PARA AMIGOS, REUNINDO A GALERA</label>
                </div>
            </div>

            <div className="public-brand-text-wrapper" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                
                {usuarioLogado ? (
                    // VISÃO DE QUEM ESTÁ LOGADO
                    <>
                        <h3 style={{ 
                            color: '#ffffff', 
                            marginBottom: '15px', 
                            fontWeight: 'bold',
                            fontSize: '22px',
                            textShadow: '2px 2px 4px rgba(0,0,0,0.8)',
                            background: 'rgba(15, 23, 42, 0.7)',
                            padding: '10px 25px',
                            borderRadius: '30px',
                            backdropFilter: 'blur(5px)',
                            border: '1px solid rgba(255,255,255,0.1)'
                        }}>
                            Pronto para a rodada, {usuarioLogado.nome.split(' ')[0]}?
                        </h3>
                        <AppButton
                            className="p-button-orange"
                            style={{ 
                                marginTop: '5px', 
                                width: '281px', 
                                padding: '12px 15px', 
                                fontSize: '20px', 
                                backgroundColor: '#f59e0b',
                                border: 'none', 
                                fontWeight: 'bold',
                                color: '#ffffff',
                                boxShadow: '0 8px 16px rgba(245, 158, 11, 0.4)'
                            }}
                            label="FAZER PALPITES"
                            onClick={handleFazerPalpiteClick}
                        />
                    </>
                ) : (
                    // VISÃO DE QUEM NÃO ESTÁ LOGADO (Visitante)
                    <>
                        <AppButton
                            className="p-button-orange"
                            style={{ 
                                marginTop: '40px', 
                                width: '281px', 
                                padding: '12px 15px', 
                                fontSize: '20px',
                                backgroundColor: '#f59e0b',
                                border: 'none',
                                color: '#ffffff',
                                fontWeight: 'bold',
                                boxShadow: '0 8px 16px rgba(245, 158, 11, 0.4)'
                            }}
                            label="CRIAR CONTA"
                            onClick={handleCriarContaClick}
                        />
                    </>
                )}
                
            </div>

            {/* CONTAINER DOS BOTÕES FLUTUANTES DO WHATSAPP */}
            <div style={{
                position: 'fixed',
                bottom: '30px',
                right: '30px',
                display: 'flex',
                flexDirection: 'column',
                gap: '15px', // Espaço entre os botões
                alignItems: 'flex-end', // Alinha tudo à direita
                zIndex: 1000
            }}>
                
                {/* BOTÃO 1: GRUPO OFICIAL */}
                <a 
                    href="https://chat.whatsapp.com/KzLHler3sA95Bh5EuKmEs2"
                    target="_blank"
                    rel="noopener noreferrer"
                    style={{
                        backgroundColor: '#25D366',
                        color: '#FFF',
                        padding: '12px 20px',
                        borderRadius: '30px',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '8px',
                        boxShadow: '0 4px 10px rgba(0,0,0,0.3)',
                        textDecoration: 'none',
                        fontWeight: 'bold',
                        cursor: 'pointer',
                        fontSize: '15px'
                    }}
                >
                    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" fill="currentColor" viewBox="0 0 16 16">
                        <path d="M13.601 2.326A7.85 7.85 0 0 0 7.994 0C3.627 0 .068 3.558.064 7.926c0 1.399.366 2.76 1.057 3.965L0 16l4.204-1.102a7.9 7.9 0 0 0 3.79.965h.004c4.368 0 7.926-3.558 7.93-7.93A7.9 7.9 0 0 0 13.6 2.326zM7.994 14.521a6.6 6.6 0 0 1-3.356-.92l-.24-.144-2.494.654.666-2.433-.156-.251a6.56 6.56 0 0 1-1.007-3.505c0-3.626 2.957-6.584 6.591-6.584a6.56 6.56 0 0 1 4.66 1.931 6.56 6.56 0 0 1 1.928 4.66c-.004 3.639-2.961 6.592-6.592 6.592m3.615-4.934c-.197-.099-1.17-.578-1.353-.646-.182-.065-.315-.099-.445.099-.133.197-.513.646-.627.775-.114.133-.232.148-.43.05-.197-.1-.836-.308-1.592-.985-.59-.525-.985-1.175-1.103-1.372-.114-.198-.011-.304.088-.403.087-.088.197-.232.296-.346.1-.114.133-.198.198-.33.065-.134.034-.248-.015-.347-.05-.099-.445-1.076-.612-1.47-.16-.389-.323-.335-.445-.34-.114-.007-.247-.007-.38-.007a.73.73 0 0 0-.529.247c-.182.198-.691.677-.691 1.654s.71 1.916.81 2.049c.098.133 1.394 2.132 3.383 2.992.47.205.84.326 1.129.418.475.152.904.129 1.246.08.38-.058 1.171-.48 1.338-.943.164-.464.164-.86.114-.943-.049-.084-.182-.133-.38-.232"/>
                    </svg>
                    Grupo Oficial
                </a>

                {/* BOTÃO 2: TIRAR DÚVIDAS */}
                <a 
                    href="https://wa.me/5561983209025?text=Olá!%20Gostaria%20de%20tirar%20uma%20dúvida%20sobre%20o%20bolão."
                    target="_blank"
                    rel="noopener noreferrer"
                    style={{
                        backgroundColor: '#25D366',
                        color: '#FFF',
                        padding: '12px 20px',
                        borderRadius: '30px',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '8px',
                        boxShadow: '0 4px 10px rgba(0,0,0,0.3)',
                        textDecoration: 'none',
                        fontWeight: 'bold',
                        cursor: 'pointer',
                        fontSize: '15px'
                    }}
                >
                    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" fill="currentColor" viewBox="0 0 16 16">
                        <path d="M13.601 2.326A7.85 7.85 0 0 0 7.994 0C3.627 0 .068 3.558.064 7.926c0 1.399.366 2.76 1.057 3.965L0 16l4.204-1.102a7.9 7.9 0 0 0 3.79.965h.004c4.368 0 7.926-3.558 7.93-7.93A7.9 7.9 0 0 0 13.6 2.326zM7.994 14.521a6.6 6.6 0 0 1-3.356-.92l-.24-.144-2.494.654.666-2.433-.156-.251a6.56 6.56 0 0 1-1.007-3.505c0-3.626 2.957-6.584 6.591-6.584a6.56 6.56 0 0 1 4.66 1.931 6.56 6.56 0 0 1 1.928 4.66c-.004 3.639-2.961 6.592-6.592 6.592m3.615-4.934c-.197-.099-1.17-.578-1.353-.646-.182-.065-.315-.099-.445.099-.133.197-.513.646-.627.775-.114.133-.232.148-.43.05-.197-.1-.836-.308-1.592-.985-.59-.525-.985-1.175-1.103-1.372-.114-.198-.011-.304.088-.403.087-.088.197-.232.296-.346.1-.114.133-.198.198-.33.065-.134.034-.248-.015-.347-.05-.099-.445-1.076-.612-1.47-.16-.389-.323-.335-.445-.34-.114-.007-.247-.007-.38-.007a.73.73 0 0 0-.529.247c-.182.198-.691.677-.691 1.654s.71 1.916.81 2.049c.098.133 1.394 2.132 3.383 2.992.47.205.84.326 1.129.418.475.152.904.129 1.246.08.38-.058 1.171-.48 1.338-.943.164-.464.164-.86.114-.943-.049-.084-.182-.133-.38-.232"/>
                    </svg>
                    Tirar Dúvidas
                </a>

            </div>
            
        </>
    );
}