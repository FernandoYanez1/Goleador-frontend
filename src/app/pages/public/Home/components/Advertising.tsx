import React from "react";

export default function Advertising() {
    return (
        <>
            <div className="public-advertising">
                <h1>O QUE NOSSOS PARCEIROS ESTÃO<br/>DIZENDO</h1>
                <div className="wrapper">
                    <img className="logo" src="/media/landing-page/canivia.png"/>
                    <div className="report">
                        <img  src="/media/images/quotes.png"/>
                        <h1>
                            Existe uma Canivia antes e <br/>depois do sistema
                        </h1>
                        <p>
                            Nossa barbearia duplicou o faturamento e resolveu praticamente todos os problemas de
                            horários com os barbeiros. Fantástico!!!
                        </p>
                        <div className="author">
                            <h5>Idris Elba</h5>
                            <h5>CEO Canivia Barber</h5>
                        </div>
                    </div>
                </div>
            </div>
        </>
    );
}
