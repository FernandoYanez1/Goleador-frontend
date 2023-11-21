import React from "react";
import AppButton from "../../../../../vendors/components/Button";

export default function Release() {
    return (
        <>
            <div className="public-release">
                <div className="description">
                    <h1>Temos uma oferta especial para você</h1>
                    <p>
                        Entrando em nossa lista de espera você ganha 20% de desconto na assinatura de qualquer plano em
                        nosso lançamento.<br /> Não perca esta oportunidade!
                    </p>
                </div>
                <div className="call">
                    <AppButton
                        className="p-button-black"
                        label="CADASTRA-SE AGORA"
                    />
                </div>
            </div>
        </>
    );
}
