import React from "react";
import { Container, Typography, Paper, List, ListItem, ListItemText, Divider } from "@mui/material";
import AppButton from "../../../../../vendors/components/Button";
import { useHistory } from "react-router-dom";


const Ranking = () => {
    const participants = [
        { name: "John Doe", points: 25 },
        { name: "Jane Doe", points: 20 },
        { name: "Jane Doe", points: 20 },
        { name: "Jane Doe", points: 20 },
        { name: "Jane Doe", points: 20 },
        { name: "Jane Doe", points: 20 },
        { name: "Jane Doe", points: 20 },
        { name: "Jane Doe", points: 20 },
    ];

    const history = useHistory();

    const handleVoltarHomeClick = () => {
        history.push("/");
    };

    return (
        <Container maxWidth="md" className="ranking-container">
            <Typography variant="h4" align="center" className="header-text">
                Seu Nome - Sua Pontuação
            </Typography>

            <Paper elevation={5} className="ranking-paper">
                <Typography variant="h5" align="center" className="paper-heading">
                    Ranking Geral
                </Typography>

                <List>
                    {participants.map((participant, index) => (
                        <React.Fragment key={index}>
                            <ListItem className="list-item">
                                <ListItemText
                                    primary={`${index + 1}. ${participant.name}`}
                                    secondary={`Pontuação: ${participant.points}`}
                                    className="list-item-text"
                                />
                            </ListItem>
                            {index < participants.length - 1 && <Divider className="divider" />}
                        </React.Fragment>
                    ))}
                </List>
            </Paper>
            <AppButton
                className="voltar-ranking"
                label="Voltar"
                onClick={handleVoltarHomeClick}
            />
        </Container>
    );
};

export default Ranking;
