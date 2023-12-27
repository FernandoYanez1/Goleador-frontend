import React, {useState, ChangeEvent} from "react";
import {useHistory} from "react-router-dom";
import AppButton from "../../../../../vendors/components/Button";

interface Jogo {
    timeA: string;
    empate: string;
    timeB: string;
}

export default function Palpites() {
    const history = useHistory();
    const handleVoltarHomeClick = () => {
        history.push('/');
    };

    const [apostas, setApostas] = useState<string[]>(Array(10).fill(''));

    const handleApostaClick = (jogoIndex: number, opcao: string) => {
        const novasApostas = [...apostas];
        novasApostas[jogoIndex] = opcao;
        setApostas(novasApostas);
    };

    const renderOpcoesJogo = (jogoIndex: number, jogo: Jogo) => {
        return (
            <div key={jogoIndex} className="opcoes-container">
                {/*<h3>{`Jogo ${jogoIndex + 1}: ${jogo.timeA} x ${jogo.timeB}`}</h3>*/}
                <h3>{`${jogo.timeA} x ${jogo.timeB}`}</h3>
                <table>
                    <tbody>
                    <tr className="opcao">
                        <td>
                            <label className={`opcao-button ${apostas[jogoIndex] === jogo.timeA ? 'selected' : ''}`}
                                   htmlFor={`opcao-${jogoIndex}-0`}>
                                <input
                                    type="radio"
                                    id={`opcao-${jogoIndex}-0`}
                                    name={`opcao-${jogoIndex}`}
                                    value={jogo.timeA}
                                    checked={apostas[jogoIndex] === jogo.timeA}
                                    onChange={(e: ChangeEvent<HTMLInputElement>) => handleApostaClick(jogoIndex, e.target.value)}
                                />
                                Casa
                            </label>
                        </td>
                        <td>
                            <label className={`opcao-button ${apostas[jogoIndex] === jogo.empate ? 'selected' : ''}`}
                                   htmlFor={`opcao-${jogoIndex}-1`}>
                                <input
                                    type="radio"
                                    id={`opcao-${jogoIndex}-1`}
                                    name={`opcao-${jogoIndex}`}
                                    value={jogo.empate}
                                    checked={apostas[jogoIndex] === jogo.empate}
                                    onChange={(e: ChangeEvent<HTMLInputElement>) => handleApostaClick(jogoIndex, e.target.value)}
                                />
                                Empate
                            </label>
                        </td>
                        <td>
                            <label className={`opcao-button ${apostas[jogoIndex] === jogo.timeB ? 'selected' : ''}`}
                                   htmlFor={`opcao-${jogoIndex}-2`}>
                                <input
                                    type="radio"
                                    id={`opcao-${jogoIndex}-2`}
                                    name={`opcao-${jogoIndex}`}
                                    value={jogo.timeB}
                                    checked={apostas[jogoIndex] === jogo.timeB}
                                    onChange={(e: ChangeEvent<HTMLInputElement>) => handleApostaClick(jogoIndex, e.target.value)}
                                />
                                Visitante
                            </label>
                        </td>
                    </tr>
                    <hr/>
                    </tbody>
                </table>
            </div>
        );
    };

    const jogos: Jogo[] = [
        {timeA: 'Vasco', empate: 'Empate', timeB: 'Flamengo'},
        {timeA: 'Time C', empate: 'Empate', timeB: 'Time A'},
        {timeA: 'Time A', empate: 'Empate', timeB: 'Time B'},
        {timeA: 'Time C', empate: 'Empate', timeB: 'Time A'},
        {timeA: 'Time A', empate: 'Empate', timeB: 'Time B'},
        {timeA: 'Time C', empate: 'Empate', timeB: 'Time A'},
        {timeA: 'Time A', empate: 'Empate', timeB: 'Time B'},
        {timeA: 'Time C', empate: 'Empate', timeB: 'Time A'},
        {timeA: 'Time A', empate: 'Empate', timeB: 'Time B'},
        {timeA: 'Time C', empate: 'Empate', timeB: 'Time A'},
    ];

    const handleEnviarApostas = () => {
        console.log(apostas);
    };

    return (
        <>

            <div className="public-brand-wrapper no-cursor"
                 style={{background: 'lightslategrey', paddingBottom: '50px'}}>
                <div className="jogos-container"
                     style={{
                         background: 'lightslategrey',
                         boxShadow: '0 0 100px rgba(255, 165, 0, 0.5)',
                         border: '2px solid black',
                         borderRadius: '10px',
                         padding: '20px',
                         textAlign: 'center'
                     }}>
                    {jogos.map((jogo, index) => renderOpcoesJogo(index, jogo))}
                    <div className="botoes-container">
                        <AppButton
                            className="button-palpite"
                            style={{marginTop: '40px', width: '281px', padding: '10px 15px', fontSize: '20px'}}
                            label="Enviar"
                            onClick={handleEnviarApostas}
                        />
                        <AppButton
                            className="button-palpite"
                            style={{marginTop: '40px', width: '281px', padding: '10px 15px', fontSize: '20px'}}
                            label="Voltar"
                            onClick={handleVoltarHomeClick}
                        />
                    </div>
                </div>
            </div>
        </>
    );
}
