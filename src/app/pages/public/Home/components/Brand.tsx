import React from "react";
import AppButton from "../../../../../vendors/components/Button";

export default function Brand() {
    return (
        <>
            <div className="public-brand-wrapper">
                <img className="public-topbar-logo" src="/media/navalha-white.png"/>
                <div>
                    <h1>MOICANOS</h1>
                    <label>BARBER & TECH</label>
                </div>
            </div>
            <div className="public-brand-text-wrapper">
                <h1>SIMPLIFICANDO O SUCESSO DA SUA BARBEARIA</h1>
                <h3>Alavanque sua barbearia com nossa plataforma de gerenciamento, agendamentos, equipe organizada e
                    crescimento ao seu alcance.</h3>
                <AppButton className="p-button-orange"
                           style={{marginTop: '40px', width: '281px', padding: '24px 20px'}}
                           label="EXPERIMENTE AGORA"/>
            </div>
        </>
    );
}
