import React from "react";
import {FontAwesomeIcon} from "@fortawesome/react-fontawesome";
import {faArrowRight} from "@fortawesome/free-solid-svg-icons";

export default function AboutUs() {
    return (
        <>
            <div className="public-about-us">
                <img src="/media/landing-page/barber.png"/>
                <div className="wrapper">
                    <h1>UM POUCO SOBRE A <br/> MOICANOS</h1>
                    <p>
                        Na MOICANOS, estamos apaixonados por transformar a gestão de barbearias. Fundada com a visão de
                        simplificar e aprimorar o setor de beleza e cuidados pessoais, nossa equipe está comprometida em
                        proporcionar uma experiência única para barbeiros e proprietários de barbearias.<br />

                    </p>
                    <p>
                        Somos um grupo de especialistas da tecnologia e entusiastas no mercado de barbearias. Combinamos
                        nossa paixão pela inovação com um profundo conhecimento do setor para criar uma solução completa
                        que atenda às necessidades específicas das barbearias modernas
                    </p>
                    <div>
                        <h5>SEJA UMA BARBEARIA PARCEIRA</h5>
                        <FontAwesomeIcon style={{fontSize: '20px', marginLeft: '20px', cursor: 'pointer'}}
                                         color="var(--orange)"
                                         icon={faArrowRight}/>
                    </div>
                </div>
            </div>
        </>
    );
}
