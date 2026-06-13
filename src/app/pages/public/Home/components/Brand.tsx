import React, { useState, useEffect } from "react";
import { useHistory } from "react-router-dom";
import AppButton from "../../../../../vendors/components/Button";
// Importando o MUI e os Ícones para o menu inferior
import { Box, Typography } from "@mui/material";
import { SportsSoccer, Receipt, EmojiEvents, Gavel } from "@mui/icons-material";

export default function Brand() {
    const history = useHistory();
    const [usuarioLogado, setUsuarioLogado] = useState<any>(null);
    const [isMenuOpen, setIsMenuOpen] = useState(false);

    useEffect(() => {
        const salvo = localStorage.getItem("usuarioLogado");
        if (salvo) {
            setUsuarioLogado(JSON.parse(salvo));
        }
    }, []);

    const handleCriarContaClick = () => history.push("/public/contato");
    const handleFazerPalpiteClick = () => history.push("/public/placar");
    const toggleMenu = () => setIsMenuOpen(!isMenuOpen);

    return (
        <>
            <div className="public-brand-wrapper no-cursor">
                <img className="public-topbar-logo no-cursor" src="/media/landing-page/lambreta-white.png" alt="Lambreta" />
                <div>
                    <h1>BOLÃO GOLEADOR VIP</h1>
                    <label>FEITO PARA AMIGOS, REUNINDO A GALERA</label>
                </div>
            </div>

            <div className="public-brand-text-wrapper" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', paddingBottom: '100px' }}>
                
                {usuarioLogado ? (
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

            {/* CONTAINER DO BOTÃO FLUTUANTE EXPANSÍVEL */}
            <Box sx={{
                position: 'fixed',
                bottom: { xs: '90px', md: '30px' }, // Sobe no celular para não cobrir o menu
                right: '30px',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'flex-end',
                zIndex: 1000
            }}>
                
                {isMenuOpen && (
                    <div style={{
                        display: 'flex',
                        flexDirection: 'column',
                        gap: '10px',
                        marginBottom: '15px',
                        alignItems: 'flex-end',
                        animation: 'fadeIn 0.3s ease-in-out'
                    }}>
                        <a 
                            href="https://chat.whatsapp.com/KzLHler3sA95Bh5EuKmEs2"
                            target="_blank"
                            rel="noopener noreferrer"
                            style={{
                                backgroundColor: '#fff',
                                color: '#25D366',
                                padding: '10px 20px',
                                borderRadius: '30px',
                                display: 'flex',
                                alignItems: 'center',
                                gap: '8px',
                                boxShadow: '0 4px 10px rgba(0,0,0,0.2)',
                                textDecoration: 'none',
                                fontWeight: 'bold',
                                fontSize: '14px',
                                border: '1px solid #25D366'
                            }}
                        >
                            Entrar no Grupo Oficial
                        </a>

                        <a 
                            href="https://wa.me/5561983209025?text=Olá!%20Gostaria%20de%20tirar%20uma%20dúvida%20sobre%20o%20bolão."
                            target="_blank"
                            rel="noopener noreferrer"
                            style={{
                                backgroundColor: '#fff',
                                color: '#25D366',
                                padding: '10px 20px',
                                borderRadius: '30px',
                                display: 'flex',
                                alignItems: 'center',
                                gap: '8px',
                                boxShadow: '0 4px 10px rgba(0,0,0,0.2)',
                                textDecoration: 'none',
                                fontWeight: 'bold',
                                fontSize: '14px',
                                border: '1px solid #25D366'
                            }}
                        >
                            Tirar Dúvidas com Admin
                        </a>
                    </div>
                )}

                <button 
                    onClick={toggleMenu}
                    style={{
                        backgroundColor: isMenuOpen ? '#ff4444' : '#25D366',
                        color: '#FFF',
                        borderRadius: '50%',
                        width: '60px',
                        height: '60px',
                        display: 'flex',
                        justifyContent: 'center',
                        alignItems: 'center',
                        boxShadow: '0 4px 15px rgba(0,0,0,0.4)',
                        border: 'none',
                        cursor: 'pointer',
                        transition: 'background-color 0.3s'
                    }}
                    aria-label="Abrir opções de contato"
                >
                    {isMenuOpen ? (
                        <svg xmlns="http://www.w3.org/2000/svg" width="30" height="30" fill="currentColor" viewBox="0 0 16 16">
                            <path d="M4.646 4.646a.5.5 0 0 1 .708 0L8 7.293l2.646-2.647a.5.5 0 0 1 .708.708L8.707 8l2.647 2.646a.5.5 0 0 1-.708.708L8 8.707l-2.646 2.647a.5.5 0 0 1-.708-.708L7.293 8 4.646 5.354a.5.5 0 0 1 0-.708z"/>
                        </svg>
                    ) : (
                        <svg xmlns="http://www.w3.org/2000/svg" width="35" height="35" fill="currentColor" viewBox="0 0 16 16">
                            <path d="M13.601 2.326A7.85 7.85 0 0 0 7.994 0C3.627 0 .068 3.558.064 7.926c0 1.399.366 2.76 1.057 3.965L0 16l4.204-1.102a7.9 7.9 0 0 0 3.79.965h.004c4.368 0 7.926-3.558 7.93-7.93A7.9 7.9 0 0 0 13.6 2.326zM7.994 14.521a6.6 6.6 0 0 1-3.356-.92l-.24-.144-2.494.654.666-2.433-.156-.251a6.56 6.56 0 0 1-1.007-3.505c0-3.626 2.957-6.584 6.591-6.584a6.56 6.56 0 0 1 4.66 1.931 6.56 6.56 0 0 1 1.928 4.66c-.004 3.639-2.961 6.592-6.592 6.592m3.615-4.934c-.197-.099-1.17-.578-1.353-.646-.182-.065-.315-.099-.445.099-.133.197-.513.646-.627.775-.114.133-.232.148-.43.05-.197-.1-.836-.308-1.592-.985-.59-.525-.985-1.175-1.103-1.372-.114-.198-.011-.304.088-.403.087-.088.197-.232.296-.346.1-.114.133-.198.198-.33.065-.134.034-.248-.015-.347-.05-.099-.445-1.076-.612-1.47-.16-.389-.323-.335-.445-.34-.114-.007-.247-.007-.38-.007a.73.73 0 0 0-.529.247c-.182.198-.691.677-.691 1.654s.71 1.916.81 2.049c.098.133 1.394 2.132 3.383 2.992.47.205.84.326 1.129.418.475.152.904.129 1.246.08.38-.058 1.171-.48 1.338-.943.164-.464.164-.86.114-.943-.049-.084-.182-.133-.38-.232"/>
                        </svg>
                    )}
                </button>
            </Box>

            {/* BOTTOM NAVIGATION (MENU INFERIOR MOBILE) - CORES CORRIGIDAS */}
            <Box sx={{
                display: { xs: 'flex', md: 'none' }, // Mostra apenas no Mobile
                position: 'fixed',
                bottom: 0,
                left: 0,
                right: 0,
                backgroundColor: '#1e293b',
                borderTop: '1px solid #334155',
                padding: '10px 0',
                paddingBottom: 'max(10px, env(safe-area-inset-bottom))', 
                justifyContent: 'space-around',
                alignItems: 'center',
                zIndex: 999,
                boxShadow: '0 -4px 10px rgba(0,0,0,0.3)'
            }}>
                <Box onClick={() => history.push('/public/placar')} sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', cursor: 'pointer' }}>
                    <SportsSoccer sx={{ fontSize: 26, marginBottom: '2px', color: '#10b981' }} />
                    <Typography sx={{ fontSize: '11px', fontWeight: 'bold', color: '#f8fafc' }}>Palpitar</Typography>
                </Box>

                <Box onClick={() => history.push('/public/palpites')} sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', cursor: 'pointer' }}>
                    <Receipt sx={{ fontSize: 26, marginBottom: '2px', color: '#cbd5e1' }} />
                    <Typography sx={{ fontSize: '11px', fontWeight: 'bold', color: '#cbd5e1' }}>Bilhetes</Typography>
                </Box>

                <Box onClick={() => history.push('/public/ranking')} sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', cursor: 'pointer' }}>
                    <EmojiEvents sx={{ fontSize: 26, marginBottom: '2px', color: '#fcd34d' }} />
                    <Typography sx={{ fontSize: '11px', fontWeight: 'bold', color: '#f8fafc' }}>Ranking</Typography>
                </Box>

                <Box onClick={() => history.push('/public/regras')} sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', cursor: 'pointer' }}>
                    <Gavel sx={{ fontSize: 26, marginBottom: '2px', color: '#cbd5e1' }} />
                    <Typography sx={{ fontSize: '11px', fontWeight: 'bold', color: '#cbd5e1' }}>Regras</Typography>
                </Box>
            </Box>

        </>
    );
}