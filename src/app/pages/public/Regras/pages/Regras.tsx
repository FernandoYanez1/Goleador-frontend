import React from "react";
import Table from "@mui/material/Table";
import TableContainer from "@mui/material/TableContainer";
import TableHead from "@mui/material/TableHead";
import TableBody from "@mui/material/TableBody";
import TableRow from "@mui/material/TableRow";
import TableCell from "@mui/material/TableCell";
import Paper from "@mui/material/Paper";
import Button from "../../../../../vendors/components/Button";
import { useHistory } from "react-router-dom";

export default function Regras() {
    const history = useHistory();

    const pontuacaoData = [
        { tipo: "Placar Exato", pontos: 15 },
        { tipo: "Resultado + Gols do Vencedor", pontos: 10 },
        { tipo: "Resultado + Gols do Perdedor", pontos: 10 },
        { tipo: "Resultado", pontos: 8 },
        { tipo: "Gols Exato da Partida", pontos: 3 },
        { tipo: "Nenhum Acerto", pontos: 0 },
    ];

    const regrasAposta = [
        "Aposta para maiores de 18 anos.",
        "Aposta com o valor de R$20,00.",
        "Pagamentos não confirmados terão palpites invalidados.",
        "O encerramento das apostas será em até 30 min antes do primeiro jogo começar.",
        "Cada rodada será formada com 10 jogos.",
        "Ganha quem fizer mais pontos somados ao final do último jogo.",
        "Caso tenha 2 ou mais ganhadores empatados, o prêmio será dividido.",
        "A pontuação de cada jogo é única, sendo a maior conquistada.",
        "Exemplo sobre a pontuação: Caso acerte o Resultado e Gols Exato, será contabilizado 8 pontos, pois foi o acerto de mais peso.",
        "Caso algum jogo seja cancelado por qualquer motibvo, o mesmo será anulado e o bolão continuará com os jogos restantes.",
        "85% do valor arrecadado fica como premiação.",
        "15% do valor arrecadado fica para a organização.",
    ];

    const handleVoltarHomeClick = () => {
        history.push('/');
    };

    return (
        <div className="regras-container">
            <section className="table-container">
                <div className="table-header">
                    <h2>Pontuação</h2>
                </div>
                <TableContainer component={Paper} className="custom-table-container">
                    <Table className="custom-table">
                        <TableHead>
                            <TableRow>
                                <TableCell style={{ fontSize: "22px", fontWeight: "bold" }}>
                                    Tipo
                                </TableCell>
                                <TableCell
                                    style={{ fontSize: "22px", fontWeight: "bold" }}
                                    align="right"
                                >
                                    Pontos
                                </TableCell>
                            </TableRow>
                        </TableHead>
                        <TableBody>
                            {pontuacaoData.map((row, index) => (
                                <TableRow key={index}>
                                    <TableCell component="th" scope="row">
                                        {row.tipo}
                                    </TableCell>
                                    <TableCell align="right">{row.pontos}</TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                </TableContainer>

                <div className="table-header" style={{marginTop: "20px"}}>
                    <h2>Regras</h2>
                </div>
                <TableContainer component={Paper} className="custom-table-container">
                    <Table className="custom-table">
                        <TableHead>
                            <TableRow>
                                <TableCell style={{ fontSize: "22px", fontWeight: "bold" }}>
                                    Regras das Apostas
                                </TableCell>
                            </TableRow>
                        </TableHead>
                        <TableBody>
                            {regrasAposta.map((regra, index) => (
                                <TableRow key={index}>
                                    <TableCell component="th" scope="row">
                                        {regra}
                                    </TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                </TableContainer>

                <div className="flex justify-content-center" style={{marginTop: "20px", marginBottom: "20px"}}>
                    <Button
                        onClick={handleVoltarHomeClick}
                        className="p-button-orange"
                        label="Voltar" />
                </div>
            </section>
        </div>
    );
}
