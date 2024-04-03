import React from "react";
import { Container, Typography, Paper, List, ListItem, ListItemText, Divider } from "@mui/material";
import AppButton from "../../../../../vendors/components/Button";
import { useHistory } from "react-router-dom";
import { EmojiEvents, LooksTwo, Looks3, StarBorder } from "@mui/icons-material";

const Ranking = () => {
    const participants = [
        { name: "Fernando Yañez", points: 35 },
        { name: "Wia", points: 30 },
        { name: "Ana", points: 28 },
        { name: "Beatriz", points: 25 },
        { name: "Thayllan Lima", points: 24 },
        { name: "Diana Lua Sangrenta", points: 22 },
        { name: "Eduardo Souza", points: 20 },
        { name: "Fabiana", points: 18 },
        { name: "Gabriel", points: 15 },
        { name: "Helena", points: 12 },
        { name: "Igor", points: 10 },
        { name: "Julia", points: 8 },
        { name: "Kaique", points: 5 },
        { name: "Larissa", points: 3 },
        { name: "Mariana", points: 1 },
    ];

    const history = useHistory();

    const handleVoltarHomeClick = () => {
        history.push("/");
    };

    const getIcon = (position: number) => {
        switch (position) {
            case 1:
                return <EmojiEvents color="warning" fontSize="large" />;
            case 2:
                return <LooksTwo color="inherit" fontSize="large" />;
            case 3:
                return <Looks3 color="error" fontSize="large" />;
            default:
                return <StarBorder color="action" fontSize="large" />;
        }
    };

    return (
        <Container maxWidth="md" className="ranking-container" style={{ paddingBottom:"30px"}}>
            <Typography variant="h4" align="center" gutterBottom className="header-text">
                Premiação: R$ 1.000,00
            </Typography>

            <Paper elevation={3} className="ranking-paper">
                <Typography variant="h4" align="center" gutterBottom className="header-text">
                    Fernando - 35 Pontos
                </Typography>
                <Typography variant="h5" align="center" gutterBottom className="paper-heading">
                    Ranking Geral
                </Typography>

                <List className="ranking-list">
                    {participants.map((participant, index) => (
                        <React.Fragment key={index}>
                            <ListItem className="list-item">
                                <ListItemText
                                    primary={`${index + 1}- ${participant.name}`}
                                    secondary={`Pontuação: ${participant.points}`}
                                    className="list-item-text"
                                />
                                {getIcon(index + 1)}
                            </ListItem>
                            {index < participants.length - 1 && <Divider className="divider" />}
                        </React.Fragment>
                    ))}
                </List>
            </Paper>
            <AppButton
                className="voltar-ranking"
                label="Relatório de Palpites"
                style={{marginBottom:"10px"}}
            />
            <AppButton
                className="voltar-ranking"
                label="Voltar"
                onClick={handleVoltarHomeClick}
            />
        </Container>
    );
};

export default Ranking;
