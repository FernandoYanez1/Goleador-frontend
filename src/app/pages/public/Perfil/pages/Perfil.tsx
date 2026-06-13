import React, { useState, useEffect } from 'react';
import { useHistory } from 'react-router-dom';
import AppButton from '../../../../../vendors/components/Button';
import { Box, Typography, Paper, Grid, Button, Divider, Dialog, DialogTitle, DialogContent, DialogActions, TextField } from '@mui/material';
import { EmojiEvents, ConfirmationNumber, TrackChanges, Logout, LockReset } from '@mui/icons-material';

export default function Perfil() {
    const history = useHistory();
    const apiUrl = process.env.REACT_APP_API_URL || 'http://localhost:3001';
    
    const [usuario, setUsuario] = useState<any>(null);
    const [estatisticas, setEstatisticas] = useState({ bilhetes: 0, cravadas: 0, podios: 0 });

    // Estados para o Modal de Trocar Senha
    const [modalSenha, setModalSenha] = useState(false);
    const [senhaAtual, setSenhaAtual] = useState('');
    const [novaSenha, setNovaSenha] = useState('');
    const [confirmarNovaSenha, setConfirmarNovaSenha] = useState('');
    const [loadingSenha, setLoadingSenha] = useState(false);

    useEffect(() => {
        const salvo = localStorage.getItem('usuarioLogado');
        if (!salvo) {
            history.push('/public/login');
            return;
        }
        const user = JSON.parse(salvo);
        setUsuario(user);

        const carregarEstatisticas = async () => {
            try {
                let bilhetes = 0, cravadas = 0, podiosConta = 0;
                const resPalpites = await fetch(`${apiUrl}/meus-palpites/${user.id}`);
                if (resPalpites.ok) {
                    const palpitesData = await resPalpites.json();
                    bilhetes = palpitesData.length; 
                    palpitesData.forEach((bilhete: any) => {
                        if (bilhete.palpites && Array.isArray(bilhete.palpites)) {
                            bilhete.palpites.forEach((p: any) => {
                                if (Number(p.pontos_ganhos) === 15) cravadas++;
                            });
                        }
                    });
                }
                const [resRodadas, resRanking] = await Promise.all([fetch(`${apiUrl}/rodadas`), fetch(`${apiUrl}/ranking`)]);
                if (resRodadas.ok && resRanking.ok) {
                    const rodadasData = await resRodadas.json();
                    const rankingData = await resRanking.json();
                    const finalizadas = rodadasData.filter((r: any) => r.status === 'finalizada');
                    finalizadas.forEach((rodada: any) => {
                        const rankingDaRodada = rankingData.filter((rank: any) => rank.rodada_id === rodada.id);
                        const pontuacoesUnicas = rankingDaRodada.map((p: any) => Number(p.pontuacao_total)).filter((valor: number, indice: number, array: number[]) => array.indexOf(valor) === indice).sort((a: number, b: number) => b - a);
                        const top3 = pontuacoesUnicas.slice(0, 3);
                        const meusBilhetesAqui = rankingDaRodada.filter((r: any) => Number(r.usuario_id) === Number(user.id));
                        meusBilhetesAqui.forEach((meu: any) => {
                            if (top3.includes(Number(meu.pontuacao_total)) && Number(meu.pontuacao_total) > 0) podiosConta++;
                        });
                    });
                }
                setEstatisticas({ bilhetes, cravadas, podios: podiosConta });
            } catch (error) { console.error("Erro ao carregar estatísticas:", error); }
        };
        carregarEstatisticas();
    }, [history, apiUrl]);

    const handleLogout = () => {
        if(window.confirm("Deseja mesmo sair da sua conta?")) {
            localStorage.removeItem('usuarioLogado');
            history.push('/public/login');
        }
    };

    const handleTrocarSenha = async () => {
        if (!senhaAtual || !novaSenha || !confirmarNovaSenha) return alert("Preencha todos os campos.");
        if (novaSenha !== confirmarNovaSenha) return alert("As novas senhas não coincidem.");
        
        setLoadingSenha(true);
        try {
            const resposta = await fetch(`${apiUrl}/alterar-senha`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ usuario_id: usuario.id, senhaAtual, novaSenha })
            });
            const dados = await resposta.json();
            if (resposta.ok) {
                alert("Senha alterada com sucesso!");
                setModalSenha(false);
                setSenhaAtual(''); setNovaSenha(''); setConfirmarNovaSenha('');
            } else {
                alert(dados.erro);
            }
        } catch (erro) {
            alert("Falha na conexão com o servidor.");
        } finally {
            setLoadingSenha(false);
        }
    };

    if (!usuario) return null;

    return (
        <div style={{ backgroundColor: "#e2e8f0", minHeight: "100vh", padding: "40px 20px" }}>
            <Box maxWidth="600px" margin="0 auto">
                
                <Paper style={{ padding: "30px", borderRadius: "16px", textAlign: "center", backgroundColor: "#1e293b", marginBottom: "30px", boxShadow: "0 10px 25px -5px rgba(0,0,0,0.2)" }}>
                    <div style={{ width: "80px", height: "80px", backgroundColor: "#3b82f6", borderRadius: "50%", margin: "0 auto 15px auto", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "32px", fontWeight: "bold", color: "white" }}>
                        {usuario.nome.charAt(0).toUpperCase()}
                    </div>
                    <Typography variant="h5" fontWeight="bold" style={{ color: "#ffffff" }}>{usuario.nome}</Typography>
                    <Typography variant="body2" mt={1} style={{ color: "#94a3b8" }}>{usuario.email}</Typography>
                </Paper>

                <Typography variant="h6" fontWeight="900" color="#1e293b" mb={2} style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    📊 Suas Estatísticas
                </Typography>
                
                <Grid container spacing={2} mb={4}>
                    <Grid item xs={12} sm={4}>
                        <Paper style={{ padding: "20px", textAlign: "center", borderRadius: "12px", borderTop: "4px solid #3b82f6", boxShadow: "0 4px 6px rgba(0,0,0,0.05)" }}>
                            <ConfirmationNumber style={{ color: "#3b82f6", fontSize: "36px", marginBottom: "10px" }} />
                            <Typography variant="h3" fontWeight="900" color="#1e293b">{estatisticas.bilhetes}</Typography>
                            <Typography variant="caption" color="#64748b" fontWeight="bold">BILHETES APROVADOS</Typography>
                        </Paper>
                    </Grid>
                    <Grid item xs={12} sm={4}>
                        <Paper style={{ padding: "20px", textAlign: "center", borderRadius: "12px", borderTop: "4px solid #10b981", boxShadow: "0 4px 6px rgba(0,0,0,0.05)" }}>
                            <TrackChanges style={{ color: "#10b981", fontSize: "36px", marginBottom: "10px" }} />
                            <Typography variant="h3" fontWeight="900" color="#1e293b">{estatisticas.cravadas}</Typography>
                            <Typography variant="caption" color="#64748b" fontWeight="bold">PLACARES EXATOS</Typography>
                        </Paper>
                    </Grid>
                    <Grid item xs={12} sm={4}>
                        <Paper style={{ padding: "20px", textAlign: "center", borderRadius: "12px", borderTop: "4px solid #f59e0b", boxShadow: "0 4px 6px rgba(0,0,0,0.05)" }}>
                            <EmojiEvents style={{ color: "#f59e0b", fontSize: "36px", marginBottom: "10px" }} />
                            <Typography variant="h3" fontWeight="900" color="#1e293b">{estatisticas.podios}</Typography>
                            <Typography variant="caption" color="#64748b" fontWeight="bold">PÓDIOS (TOP 3)</Typography>
                        </Paper>
                    </Grid>
                </Grid>

                <Box display="flex" flexDirection="column" gap={2}>
                    <AppButton label="Ver Meus Bilhetes" onClick={() => history.push('/public/palpites')} style={{ backgroundColor: "#f97316", border: "none", padding: "14px", fontSize: "16px", fontWeight: "bold" }} />
                    <AppButton label="Voltar à Home" onClick={() => history.push('/public')} style={{ backgroundColor: "#64748b", border: "none", padding: "14px", fontSize: "16px", fontWeight: "bold" }} />
                    
                    <Divider style={{ margin: "10px 0" }} />
                    
                    <Button variant="outlined" onClick={() => setModalSenha(true)} style={{ border: "2px solid #3b82f6", color: "#3b82f6", padding: "10px", borderRadius: "8px", fontWeight: "bold", textTransform: "none", fontSize: "16px", display: "flex", gap: "10px" }}>
                        <LockReset /> Trocar Minha Senha
                    </Button>

                    <Button variant="outlined" color="error" onClick={handleLogout} style={{ border: "2px solid #ef4444", color: "#ef4444", padding: "10px", borderRadius: "8px", fontWeight: "bold", textTransform: "none", fontSize: "16px", display: "flex", gap: "10px" }}>
                        <Logout /> Sair da Conta
                    </Button>
                </Box>
            </Box>

            {/* MODAL DE TROCAR SENHA */}
            <Dialog open={modalSenha} onClose={() => setModalSenha(false)} fullWidth maxWidth="xs" PaperProps={{ style: { borderRadius: "16px" } }}>
                <DialogTitle style={{ backgroundColor: "#1e293b", color: "white", fontWeight: "bold" }}>Alterar Senha</DialogTitle>
                <DialogContent style={{ padding: "20px", display: 'flex', flexDirection: 'column', gap: '15px', marginTop: '10px' }}>
                    <TextField label="Senha Atual" type="password" fullWidth variant="outlined" value={senhaAtual} onChange={(e) => setSenhaAtual(e.target.value)} />
                    <TextField label="Nova Senha" type="password" fullWidth variant="outlined" value={novaSenha} onChange={(e) => setNovaSenha(e.target.value)} />
                    <TextField label="Confirmar Nova Senha" type="password" fullWidth variant="outlined" value={confirmarNovaSenha} onChange={(e) => setConfirmarNovaSenha(e.target.value)} />
                </DialogContent>
                <DialogActions style={{ padding: "15px 20px" }}>
                    <Button onClick={() => setModalSenha(false)} color="inherit" style={{ fontWeight: 'bold' }}>Cancelar</Button>
                    <Button onClick={handleTrocarSenha} variant="contained" disabled={loadingSenha} style={{ backgroundColor: "#10b981", fontWeight: 'bold' }}>
                        {loadingSenha ? "Salvando..." : "Salvar Senha"}
                    </Button>
                </DialogActions>
            </Dialog>

        </div>
    );
}