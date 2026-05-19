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
                    <label>FEITO PARA AMIGOS</label>
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
                            textShadow: '2px 2px 4px rgba(0,0,0,0.8)', // Sombra forte no texto
                            background: 'rgba(15, 23, 42, 0.7)', // Fundo escuro semi-transparente
                            padding: '10px 25px', // Espaçamento interno criando uma "pílula"
                            borderRadius: '30px', // Bordas bem arredondadas
                            backdropFilter: 'blur(5px)', // Desfoca o fundo da imagem atrás do texto
                            border: '1px solid rgba(255,255,255,0.1)' // Borda bem sutil para dar acabamento
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
                                backgroundColor: '#f59e0b', // O Laranja que você pediu
                                border: 'none', 
                                fontWeight: 'bold',
                                color: '#ffffff',
                                boxShadow: '0 8px 16px rgba(245, 158, 11, 0.4)' // Brilho laranja
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
            
        </>
    );
}