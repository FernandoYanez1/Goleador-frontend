import React from "react";
import { useHistory } from "react-router-dom";
import { 
    Container, Typography, Paper, Grid, Card, CardContent, 
    Accordion, AccordionSummary, AccordionDetails, Divider, Chip 
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
        { icon: "💰", titulo: "Valor e Pagamento", texto: "A inscrição custa R$ 20,00 por bilhete. Palpites só serão validados e contabilizados no prêmio após a confirmação do pagamento." },
        { icon: "🛠️", titulo: "Taxa de Administração (10%)", texto: "Os 10% ficam retidos como taxa de administração e manutenção. Esse percentual cobre a administração geral do bolão, taxas do Mercado Pago, os custos de infraestrutura do site e também o financiamento de premiações extras que trazemos em rodadas especiais para a galera." },
        { icon: "🏆", titulo: "Premiação do Pódio (90%)", texto: "Os 90% restantes do valor arrecadado formam o prêmio líquido, dividido em: 60% para o 1º lugar, 30% para o 2º e 10% para o 3º." },
        /* { icon: "👕", titulo: "Bônus Especial: Oitavas da Copa", texto: "O 1º colocado ISOLADO na rodada das Oitavas da Copa ganhará uma Camisa Oficial da Seleção! Caso haja empate no 1º lugar, o prêmio vira R$ 300,00 divididos igualmente entre os vencedores." }, */
        { icon: "⏳", titulo: "Encerramento", texto: "O sistema bloqueia novas apostas (e libera o Modo Secador) no horário estipulado pelo administrador, geralmente 30 minutos antes do 1º jogo da rodada." },
        { icon: "🤝", titulo: "Regra de Desempate", texto: "Caso participantes terminem empatados em uma mesma posição do pódio, o valor do prêmio financeiro daquela posição será somado e dividido igualmente entre eles." },
        { icon: "🚫", titulo: "Jogos Cancelados", texto: "Se um jogo for cancelado ou adiado oficialmente, ele será anulado no sistema e não renderá pontos para ninguém." },
    ];

    const pontuacaoData = [
        { tipo: "Placar Exato", desc: "Acertou perfeitamente os gols do time da casa e do visitante.", pontos: 15, cor: "#8b5cf6" }, // Roxo
        { tipo: "Resultado + Gols", desc: "Acertou quem venceu E a quantidade de gols de pelo menos um dos times.", pontos: 10, cor: "#10b981" }, // Verde
        { tipo: "Apenas Resultado", desc: "Acertou quem venceu ou se foi empate, mas errou completamente o placar.", pontos: 8, cor: "#0ea5e9" }, // Azul
        { tipo: "Soma Exata de Gols", desc: "Errou quem venceu, mas a soma total de gols bateu com a realidade.", pontos: 3, cor: "#f97316" }, // Laranja
        { tipo: "Nenhum Acerto", desc: "Errou o resultado e a quantidade de gols.", pontos: 0, cor: "#64748b" }, // Cinza
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
                        Tudo o que você precisa saber para participar e faturar a rodada.
                    </Typography>
                </div>

                {/* SESSÃO 1: REGRAS GERAIS */}
                <Typography variant="h5" style={{ fontWeight: "bold", color: "#1e293b", marginBottom: "20px", display: "flex", alignItems: "center", gap: "10px" }}>
                    <LightbulbIcon color="primary" /> Como Funciona
                </Typography>
                <Grid container spacing={3} style={{ marginBottom: "40px" }}>
                    {regrasGerais.map((regra, index) => (
                        <Grid item xs={12} sm={6} key={index}>
                            <Card style={{ height: "100%", borderRadius: "12px", boxShadow: "0 4px 6px -1px rgba(0,0,0,0.05)", borderLeft: regra.icon === "🇧🇷" ? "4px solid #10b981" : "none" }}>
                                <CardContent>
                                    <Typography variant="h6" style={{ fontWeight: "bold", fontSize: "18px", marginBottom: "8px", color: regra.icon === "🇧🇷" ? "#047857" : "inherit" }}>
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
                    <EmojiEventsIcon style={{ color: "#fbbf24" }} /> Sistema de Pontuação
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