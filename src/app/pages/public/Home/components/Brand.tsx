import React from "react";
import { useHistory } from "react-router-dom";
import AppButton from "../../../../../vendors/components/Button";

export default function Brand() {

    const history = useHistory();

    const handleCriarContaClick = () => {
        history.push("/public/contato");
    };

    return (
        <>
                <div className="public-brand-wrapper no-cursor">
                    <img className="public-topbar-logo no-cursor" src="/media/landing-page/lambreta-white.png"/>
                    <div>
                        <h1>BOLÃO GOLEADOR</h1>
                        <label>ARRISCAR PRA GANHAR</label>
                    </div>
                </div>
            <div className="public-brand-text-wrapper">
                {/*<h1>PARTICIPE DO MELHOR BOLÃO DE FUTEBOL</h1>*/}
                {/*<h3>Alavanque sua barbearia com nossa plataforma de gerenciamento, agendamentos, equipe organizada e*/}
                {/*    crescimento ao seu alcance.</h3>*/}
                <AppButton
                    className="p-button-orange"
                    style={{marginTop: '40px', width: '281px', padding: '10px 15px', fontSize: '20px'}}
                    label="CRIAR CONTA"
                    onClick={handleCriarContaClick}
                />
            </div>
        </>
    );
}
