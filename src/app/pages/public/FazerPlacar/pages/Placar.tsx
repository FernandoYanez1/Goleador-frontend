import React, { useState, ChangeEvent, useEffect } from "react";
import { useHistory } from "react-router-dom";
import AppButton from "../../../../../vendors/components/Button";
import axios from 'axios';

interface Jogo {
    estadio: string;
    horario: string;
    timeA: string;
    escudoA: string;
    siglaA: string;
    timeB: string;
    escudoB: string;
    siglaB: string;
}

interface Placar {
    timeA: number | null;
    timeB: number | null;
}

export default function Placar() {
    const history = useHistory();

    const handleVoltarHomeClick = () => {
        history.push("/");
    };

    const [placares, setPlacares] = useState<Placar[]>(
        Array(10).fill({ timeA: null, timeB: null })
    );

    const [confrontos, setConfrontos] = useState<Jogo[]>([
        {
            estadio: "Maracanã",
            horario: "20/03 às 16:30",

            timeA: "Vasco",
            escudoA: "/media/escudos-times/Vasco.png",
            siglaA: "VAS",
            timeB: "Flamengo",
            escudoB: "/media/escudos-times/Flamengo.png",
            siglaB: "FLA",
        },
        {
            estadio: "Neo Química Arena",
            horario: "21/03 às 12:00",

            timeA: "Corinthians",
            escudoA: "/media/escudos-times/Corinthians.png",
            siglaA: "COR",
            timeB: "Gremio",
            escudoB: "/media/escudos-times/Gremio.png",
            siglaB: "GRE",
        },
        {
            estadio: "Estádio 3",
            horario: "Horário 3",

            timeA: "Cruzeiro",
            escudoA: "/media/escudos-times/Cruzeiro.png",
            siglaA: "Cru",
            timeB: "Botafogo",
            escudoB: "/media/escudos-times/Botafogo.png",
            siglaB: "BOT",
        },


    ]);

    const handlePlacarChange = (
        jogoIndex: number,
        time: "timeA" | "timeB",
        value: string
    ) => {
        const placarValue = parseInt(value, 10);
        const novosPlacares = [...placares];
        novosPlacares[jogoIndex] = {
            ...novosPlacares[jogoIndex],
            [time]: isNaN(placarValue) ? null : placarValue,
        };
        setPlacares(novosPlacares);
    };

    const renderOpcoesJogo = (jogoIndex: number, jogo: Jogo) => {
        return (
            <div key={jogoIndex} className="placar-container"  style={{marginTop: "-25px"}}>
                <div className="dados-jogo" style={{ marginBottom: "20px", display: "inline" }}>
                    <span style={{ fontWeight: 'bold' }}>{`${jogo.estadio},`}</span>
                    {` ${jogo.horario}`}
                </div>

                <table>
                    <tbody>
                    <tr className="placar">
                        <td className="time">
                            <img
                                src={jogo.escudoA}
                                alt={`${jogo.timeA} Escudo`}
                                className="escudo"
                                style={{ filter: 'brightness(1.0) saturate(1.1)' }}
                            />
                            <span className="sigla">{jogo.siglaA}</span>
                            <input
                                type="text"
                                value={(placares[jogoIndex]?.timeA ?? "").toString()}
                                onChange={(e) =>
                                    handlePlacarChange(jogoIndex, "timeA", e.target.value)
                                }
                                maxLength={1}
                                className="input placar-input"
                            />
                        </td>
                        <td className="versus">X</td>
                        <td className="time">
                            <input
                                type="text"
                                value={(placares[jogoIndex]?.timeB ?? "").toString()}
                                onChange={(e) =>
                                    handlePlacarChange(jogoIndex, "timeB", e.target.value)
                                }
                                maxLength={1}
                                className="input placar-input"
                            />
                            <span className="sigla">{jogo.siglaB}</span>
                            <img
                                src={jogo.escudoB}
                                alt={`${jogo.timeB} Escudo`}
                                className="escudo"
                                style={{ filter: 'brightness(1.1) saturate(1.1)' }}
                            />
                        </td>
                    </tr>
                    <div style={{ borderTop: "2px solid black", width: "100%" }}></div>
                    </tbody>
                </table>
            </div>
        );
    };

    const handleEnviarApostas = () => {
        console.log(placares);
    };

    return (
        <>
            <div
                className="public-brand-wrapper no-cursor"
                style={{ background: "lightslategrey", paddingBottom: "50px" }}
            >
                <div
                    className="placar-container"
                    style={{
                        background: "lightslategrey",
                        boxShadow: "0 0 100px rgba(255, 165, 0, 0.5)",
                        border: "2px solid black",
                        borderRadius: "10px",
                        padding: "20px",
                        textAlign: "center",
                    }}
                >
                    <div style={{ display: "flex", flexDirection: "column" }}>
                        {confrontos.map((jogo, index) => renderOpcoesJogo(index, jogo))}
                    </div>
                    <div className="botoes-placar-container">
                        <AppButton
                            className="button-placar"
                            style={{
                                marginTop: "40px",
                                width: "281px",
                                padding: "10px 15px",
                                fontSize: "20px",
                            }}
                            label="Enviar"
                            onClick={handleEnviarApostas}
                        />
                        <AppButton
                            className="button-placar"
                            style={{
                                marginTop: "40px",
                                width: "281px",
                                padding: "10px 15px",
                                fontSize: "20px",
                            }}
                            label="Voltar"
                            onClick={handleVoltarHomeClick}
                        />
                    </div>
                </div>
            </div>
        </>
    );
}
