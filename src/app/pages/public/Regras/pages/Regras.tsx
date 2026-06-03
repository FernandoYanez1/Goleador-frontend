import React from "react";
import { useHistory } from "react-router-dom";
import { 
    Container, Typography, Paper, Grid, Card, CardContent, 
    Accordion, AccordionSummary, AccordionDetails, Divider, Chip, Box
} from "@mui/material";
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import GavelIcon from '@mui/icons-material/Gavel';
import EmojiEventsIcon from '@mui/icons-material/EmojiEvents';
import LightbulbIcon from '@mui/icons-material/Lightbulb';
import AppButton from "../../../../../vendors/components/Button";

export default function Regras() {
    const history = useHistory();

    const regrasGerais = [
        { icon: "🔞", titulo: "Idade Mínima", texto: "A participação é permitida apenas para maiores de 18 anos." },
        { icon: "🛡️", titulo: "Privacidade e Segurança (LGPD)", texto: "Seus dados estão seguros! O Nome fica público para o ranking. O CPF é usado exclusivamente via integração segura com o Mercado Pago para a geração do PIX. O Celular é sigiloso, visível apenas para o Admin te contatar em caso de prêmio. Sua senha é 100% criptografada." },
        { icon: "🛠️", titulo: "Taxa de Administração (10%)", texto: "De todo o valor arrecadado, 10% ficam retidos como taxa de administração. Esse percentual cobre os custos da taxa do Mercado Pago, infraestrutura do site e o financiamento de premiações físicas extras em rodadas especiais." },
        { icon: "🏆", titulo: "Premiação - Confrontos (90%)", texto: "Nas rodadas de Placares, os 90% do valor arrecadado formam o prêmio líquido do pódio, dividido em: 60% para o 1º lugar, 30% para o 2º e 10% para o 3º." },
        { icon: "🏅", titulo: "Premiação - Campeão Final", texto: "Na aposta de longo prazo (Campeão da Competição), a premiação vai para quem acertar a seleção vencedora. Se mais de um participante acertar, o pote total é dividido igualmente entre eles. Não há 2º ou 3º lugar." },
        { icon: "💰", titulo: "Valor e Pagamento", texto: "O valor da inscrição varia conforme a rodada ou torneio escolhido. Seus palpites só serão validados e contabilizados no prêmio após a confirmação automática do pagamento via PIX. Só serão aceitos os pagamentos até 30 minutos antes do início do primeiro jogo da rodada." },
        { icon: "⏳", titulo: "Encerramento das Apostas", texto: "Nas rodadas de Placares, o sistema bloqueia novas apostas 30 minutos antes do 1º jogo. Na aposta de Campeão, o mercado fecha em uma data específica no site. Após o bloqueio, as apostas ficam visíveis, liberando o 'Modo Secador'." },
        { icon: "🤝", titulo: "Regra de Desempate", texto: "Caso participantes terminem empatados em uma mesma posição de pontuação, o valor do prêmio financeiro daquela posição (e da seguinte, se necessário) será somado e dividido igualmente entre todos os empatados." },
        { icon: "🚫", titulo: "Jogos Cancelados", texto: "Se um jogo for cancelado ou adiado oficialmente, ele será anulado no sistema e não renderá pontos para nenhum participante." },
    ];

    const pontuacaoData = [
        { tipo: "Placar Exato", desc: "Acertou perfeitamente os gols do time da casa e do visitante.", pontos: 15, cor: "#8b5cf6" },
        { tipo: "Resultado + Gols", desc: "Acertou quem venceu E a quantidade de gols de pelo menos um dos times.", pontos: 10, cor: "#10b981" },
        { tipo: "Apenas Resultado", desc: "Acertou quem venceu ou se foi empate, mas errou completamente o placar.", pontos: 8, cor: "#0ea5e9" },
        { tipo: "Soma Exata de Gols", desc: "Errou quem venceu, mas a soma total de gols bateu com a realidade.", pontos: 3, cor: "#f97316" },
        { tipo: "Nenhum Acerto", desc: "Errou o resultado e a quantidade de gols.", pontos: 0, cor: "#64748b" },
    ];

    const exemplos = [
        {
            titulo: "Cenário 1: Na mosca! (15 pts)",
            oficial: "Vasco 2 x 1 Flamengo", palpite: "Vasco 2 x 1 Flamengo",
            explicacao: "Você acertou exatamente o placar do jogo. Pontuação máxima!",
            pontos: 15, cor: "#8b5cf6"
        },
        {
            titulo: "Cenário 2: Resultado + 1 Time (10 pts)",
            oficial: "Vasco 2 x 1 Flamengo", palpite: "Vasco 2 x 0 Flamengo",
            explicacao: "Você acertou que o Vasco venceria E acertou que o Vasco faria exatos 2 gols.",
            pontos: 10, cor: "#10b981"
        },
        {
            titulo: "Cenário 3: Apenas Resultado (8 pts)",
            oficial: "Vasco 2 x 1 Flamengo", palpite: "Vasco 3 x 0 Flamengo",
            explicacao: "Você acertou que o Vasco venceria, mas errou a quantidade de gols de ambos os times.",
            pontos: 8, cor: "#0ea5e9"
        },
        {
            titulo: "Cenário 4: Soma de Gols (3 pts)",
            oficial: "Vasco 2 x 1 Flamengo", palpite: "Vasco 1 x 2 Flamengo",
            explicacao: "Apostou no Fla, mas deu Vasco. Porém, saíram 3 gols no total (2+1) e no seu palpite também saíram 3 gols (1+2).",
            pontos: 3, cor: "#f97316"
        }
    ];

    return (
        <div style={{ backgroundColor: "#e2e8f0", minHeight: "100vh", padding: "40px 0", paddingBottom: "80px" }}>
            <Container maxWidth="md">
                
                {/* CABEÇALHO */}
                <div style={{ backgroundColor: "#1e293b", color: "white", borderRadius: "12px", padding: "30px", marginBottom: "30px", textAlign: "center", boxShadow: "0 10px 15px -3px rgba(0,0,0,0.1)" }}>
                    <GavelIcon style={{ fontSize: 50, color: "#fbbf24", marginBottom: "10px" }} />
                    <Typography variant="h3" style={{ fontWeight: "bold", color: "white", fontFamily: "'Roboto', sans-serif" }}>
                        Regras do Bolão
                    </Typography>
                    <Typography variant="subtitle1" style={{ color: "#94a3b8", marginTop: "10px" }}>
                        Tudo o que você precisa saber para participar e faturar.
                    </Typography>
                </div>

                {/* SESSÃO DESTAQUE: COPA DO MUNDO */}
                <Box mb={6}>
                    <Paper style={{ padding: '30px', borderRadius: '16px', background: 'linear-gradient(135deg, #0f172a 0%, #1e293b 100%)', color: 'white', border: '2px solid #fbbf24', boxShadow: '0 10px 25px rgba(251, 191, 36, 0.15)' }}>
                        <Typography variant="h4" fontWeight="900" color="#fbbf24" textAlign="center" mb={1}>
                            🏆 Especial Copa do Mundo 2026
                        </Typography>
                        <Typography variant="body1" textAlign="center" color="#cbd5e1" mb={4}>
                            O nosso bolão para a Copa será dividido em <strong>7 rodadas independentes</strong>. Você escolhe de quais quer participar!
                        </Typography>

                        <Grid container spacing={3}>
                            {/* Card Campeão */}
                            <Grid item xs={12} md={4}>
                                <Box p={3} style={{ backgroundColor: 'rgba(251, 191, 36, 0.1)', border: '1px solid rgba(251, 191, 36, 0.3)', borderRadius: '12px', height: '100%', display: 'flex', flexDirection: 'column' }}>
                                    <Typography variant="h6" fontWeight="bold" color="#fbbf24" mb={2}>
                                        ⭐ Campeão Final
                                    </Typography>
                                    <Typography variant="body2" color="#e2e8f0" mb={3} style={{ flexGrow: 1 }}>
                                        Aposta de tiro curto! Escolha qual seleção vai levantar a taça no final. Prêmio de 100% do pote líquido dividido entre os acertadores.
                                    </Typography>
                                    <Typography variant="h5" fontWeight="900" color="#10b981">
                                        Valor: R$ 50,00
                                    </Typography>
                                </Box>
                            </Grid>

                            {/* Card Placares */}
                            <Grid item xs={12} md={8}>
                                <Box p={3} style={{ backgroundColor: 'rgba(59, 130, 246, 0.1)', border: '1px solid rgba(59, 130, 246, 0.3)', borderRadius: '12px', height: '100%', display: 'flex', flexDirection: 'column' }}>
                                    <Typography variant="h6" fontWeight="bold" color="#38bdf8" mb={2}>
                                        ⚽ 6 Rodadas de Placares
                                    </Typography>
                                    <Typography variant="body2" color="#e2e8f0" mb={3}>
                                        As apostas nos confrontos acontecerão em etapas. Cada fase do torneio é uma nova chance de faturar:
                                    </Typography>
                                    
                                    <Grid container spacing={2} mb={3} style={{ flexGrow: 1 }}>
                                        {/* Lado Esquerdo - Fase de Grupos */}
                                        <Grid item xs={12} sm={6}>
                                            <Box p={2} style={{ backgroundColor: 'rgba(15, 23, 42, 0.4)', borderRadius: '8px', border: '1px solid rgba(56, 189, 248, 0.2)', height: '100%' }}>
                                                <Typography variant="caption" fontWeight="bold" color="#94a3b8" display="block" mb={1.5} style={{ letterSpacing: '1px' }}>FASE DE GRUPOS</Typography>
                                                <Box display="flex" flexDirection="column" gap={1.5}>
                                                    <Box display="flex" alignItems="center" gap={1}><div style={{ minWidth: '6px', height: '6px', borderRadius: '50%', backgroundColor: '#38bdf8' }}></div><Typography variant="body2" fontWeight="bold" color="#f8fafc">1ª Rodada (15 jogos)</Typography></Box>
                                                    <Box display="flex" alignItems="center" gap={1}><div style={{ minWidth: '6px', height: '6px', borderRadius: '50%', backgroundColor: '#38bdf8' }}></div><Typography variant="body2" fontWeight="bold" color="#f8fafc">2ª Rodada (15 jogos)</Typography></Box>
                                                    <Box display="flex" alignItems="center" gap={1}><div style={{ minWidth: '6px', height: '6px', borderRadius: '50%', backgroundColor: '#38bdf8' }}></div><Typography variant="body2" fontWeight="bold" color="#f8fafc">3ª Rodada (15 jogos)</Typography></Box>
                                                </Box>
                                            </Box>
                                        </Grid>

                                        {/* Lado Direito - Mata-mata */}
                                        <Grid item xs={12} sm={6}>
                                            <Box p={2} style={{ backgroundColor: 'rgba(15, 23, 42, 0.4)', borderRadius: '8px', border: '1px solid rgba(16, 185, 129, 0.2)', height: '100%' }}>
                                                <Typography variant="caption" fontWeight="bold" color="#94a3b8" display="block" mb={1.5} style={{ letterSpacing: '1px' }}>MATA-MATA</Typography>
                                                <Box display="flex" flexDirection="column" gap={1.5}>
                                                    <Box display="flex" alignItems="center" gap={1}><div style={{ minWidth: '6px', height: '6px', borderRadius: '50%', backgroundColor: '#10b981' }}></div><Typography variant="body2" fontWeight="bold" color="#f8fafc">16 Avos de Final (16 jogos)</Typography></Box>
                                                    <Box display="flex" alignItems="center" gap={1}><div style={{ minWidth: '6px', height: '6px', borderRadius: '50%', backgroundColor: '#10b981' }}></div><Typography variant="body2" fontWeight="bold" color="#f8fafc">Oitavas de Final (8 jogos)</Typography></Box>
                                                    <Box display="flex" alignItems="center" gap={1}><div style={{ minWidth: '6px', height: '6px', borderRadius: '50%', backgroundColor: '#10b981' }}></div><Typography variant="body2" fontWeight="bold" color="#f8fafc" style={{ lineHeight: 1.2 }}>Fase Final<br/><span style={{ fontSize: '11px', color: '#94a3b8', fontWeight: 'normal' }}>(Quartas, Semis e Final - 7 jogos)</span></Typography></Box>
                                                </Box>
                                            </Box>
                                        </Grid>
                                    </Grid>

                                    <Typography variant="h5" fontWeight="900" color="#10b981">
                                        Valor: R$ 20,00 <span style={{fontSize: '14px', color: '#cbd5e1', fontWeight: 'normal'}}>por rodada</span>
                                    </Typography>
                                </Box>
                            </Grid>
                        </Grid>
                    </Paper>
                </Box>

                {/* SESSÃO 1: REGRAS GERAIS */}
                <Typography variant="h5" style={{ fontWeight: "bold", color: "#1e293b", marginBottom: "20px", display: "flex", alignItems: "center", gap: "10px" }}>
                    <LightbulbIcon color="primary" /> Como Funciona
                </Typography>
                <Grid container spacing={3} style={{ marginBottom: "40px" }}>
                    {regrasGerais.map((regra, index) => (
                        <Grid item xs={12} sm={6} key={index}>
                            <Card style={{ height: "100%", borderRadius: "12px", boxShadow: "0 4px 6px -1px rgba(0,0,0,0.05)", borderLeft: regra.icon === "🛡️" ? "4px solid #3b82f6" : "none" }}>
                                <CardContent>
                                    <Typography variant="h6" style={{ fontWeight: "bold", fontSize: "18px", marginBottom: "8px", color: regra.icon === "🛡️" ? "#1d4ed8" : "inherit" }}>
                                        {regra.icon} {regra.titulo}
                                    </Typography>
                                    <Typography variant="body2" color="textSecondary" style={{ lineHeight: 1.6 }}>
                                        {regra.texto}
                                    </Typography>
                                </CardContent>
                            </Card>
                        </Grid>
                    ))}
                </Grid>

                {/* SESSÃO 2: PONTUAÇÃO */}
                <Typography variant="h5" style={{ fontWeight: "bold", color: "#1e293b", marginBottom: "20px", display: "flex", alignItems: "center", gap: "10px" }}>
                    <EmojiEventsIcon style={{ color: "#fbbf24" }} /> Sistema de Pontuação (Confrontos)
                </Typography>
                <Paper style={{ borderRadius: "12px", overflow: "hidden", marginBottom: "40px", boxShadow: "0 4px 10px rgba(0,0,0,0.05)" }}>
                    {pontuacaoData.map((item, index) => (
                        <div key={index}>
                            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "20px" }}>
                                <div>
                                    <Typography variant="h6" style={{ fontWeight: "bold", fontSize: "17px", color: "#1e293b" }}>
                                        {item.tipo}
                                    </Typography>
                                    <Typography variant="body2" color="textSecondary" style={{ marginTop: "4px" }}>
                                        {item.desc}
                                    </Typography>
                                </div>
                                <div>
                                    <Chip 
                                        label={`${item.pontos} pts`} 
                                        style={{ backgroundColor: item.cor, color: "white", fontWeight: "bold", fontSize: "16px", padding: "20px 10px" }} 
                                    />
                                </div>
                            </div>
                            {index < pontuacaoData.length - 1 && <Divider />}
                        </div>
                    ))}
                </Paper>

                {/* SESSÃO 3: EXEMPLOS PRÁTICOS (ACCORDION) */}
                <Typography variant="h5" style={{ fontWeight: "bold", color: "#1e293b", marginBottom: "20px" }}>
                    🧐 Exemplos Práticos
                </Typography>
                <div style={{ marginBottom: "40px" }}>
                    {exemplos.map((ex, index) => (
                        <Accordion key={index} style={{ borderRadius: "8px", marginBottom: "10px", boxShadow: "0 2px 4px rgba(0,0,0,0.05)" }}>
                            <AccordionSummary expandIcon={<ExpandMoreIcon />} style={{ padding: "10px 20px" }}>
                                <Typography style={{ fontWeight: "bold", color: ex.cor, fontSize: "17px" }}>{ex.titulo}</Typography>
                            </AccordionSummary>
                            <AccordionDetails style={{ backgroundColor: "#f8fafc", padding: "20px", borderTop: "1px solid #e2e8f0" }}>
                                <div style={{ display: "flex", gap: "40px", marginBottom: "15px", flexWrap: "wrap" }}>
                                    <div>
                                        <Typography variant="caption" color="textSecondary" style={{ fontWeight: "bold" }}>RESULTADO OFICIAL</Typography>
                                        <Typography variant="body1" style={{ fontWeight: "bold" }}>{ex.oficial}</Typography>
                                    </div>
                                    <div>
                                        <Typography variant="caption" color="textSecondary" style={{ fontWeight: "bold" }}>SEU PALPITE</Typography>
                                        <Typography variant="body1" style={{ fontWeight: "bold" }}>{ex.palpite}</Typography>
                                    </div>
                                </div>
                                <Typography variant="body2" style={{ fontStyle: "italic", color: "#475569" }}>
                                    💡 <strong>Entenda:</strong> {ex.explicacao}
                                </Typography>
                            </AccordionDetails>
                        </Accordion>
                    ))}
                </div>

                {/* BOTÃO VOLTAR */}
                <div style={{ display: "flex", justifyContent: "center", marginTop: "30px" }}>
                    <AppButton
                        onClick={() => history.push('/public')}
                        style={{ width: "250px", padding: "12px", fontSize: "18px", backgroundColor: "#3b82f6", border: "none" }}
                        label="Voltar para a Home" 
                    />
                </div>

            </Container>
        </div>
    );
}