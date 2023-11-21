import React from "react";
import AppButton from "../../../../../vendors/components/Button";

export default function WithoutCommitment() {
    return (
        <>
            <div className="public-without-commitment">
                <div className="description">
                    <h1>EXPLORE SEM COMPROMISSO POR 7 DIAS GRÁTIS</h1>
                    <p>
                        Experimente nossa plataforma por 7 dias sem custo. Desbloqueie todo o potencial de gerenciamento
                        para sua barbearia e veja os resultados por si mesmo.
                    </p>
                </div>
                <div className="call">
                    <AppButton
                        className="p-button-black"
                        label="EXPERIMENTE AGORA"
                    />
                </div>
            </div>
        </>
    )
}
