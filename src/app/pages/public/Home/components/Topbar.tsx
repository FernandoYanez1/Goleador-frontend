import React, {useState} from "react";
import {FontAwesomeIcon} from "@fortawesome/react-fontawesome";
import {faAnglesRight} from "@fortawesome/free-solid-svg-icons/faAnglesRight";
import AppButton from "../../../../../vendors/components/Button";
import {faBars} from "@fortawesome/free-solid-svg-icons";
import If from "../../../../../vendors/components/If";
import { useHistory } from "react-router-dom";

export default function Topbar() {
    const [show, setShow] = useState(false);
    const history = useHistory();

    const handleLoginClick = () => {
        history.push("/public/login");
    };

    const handlePalpiteClick = () => {
        history.push("/public/palpites");
    };

    const handleRegrasClick = () => {
        history.push("/public/regras");
    };

    const handlePlacarClick = () => {
        history.push("/public/placar");
    };

    const handleRankingClick = () => {
        history.push("/public/ranking");
    };

    return (
        <>
            <div className="public-topbar-wrapper hide-mobile">
                <div className="public-topbar-group">
                    <div>
                        <img className="public-topbar-logo" src="/media/goleador-logo.png"/>
                    </div>
                    <div className="public-topbar-items">
                        {/*<div>*/}
                        {/*    <h5>ULTIMOS VENCEDORES</h5>*/}
                        {/*</div>*/}
                        <div
                            onClick={handleRegrasClick}
                        >
                            <h5>REGRAS</h5>
                        </div>
                        <div
                            onClick={handlePalpiteClick}
                        >
                            <h5>MEUS PALPITES</h5>
                        </div>
                        <div
                            onClick={handlePlacarClick}
                        >
                            <h5>FAZER PALPITE</h5>
                        </div>
                        <div
                            onClick={handleRankingClick}
                        >
                            <h5>RANKING</h5>
                        </div>
                        <div
                            className="meu-perfil"
                            onClick={handleLoginClick}
                        >
                            <h5>MEU PERFIL</h5>
                            <FontAwesomeIcon style={{marginLeft: '5px'}} color='white' icon={faAnglesRight}/>
                        </div>
                    </div>
                </div>
            </div>

            <div className="public-topbar-wrapper-mobile hide-desktop">
                <div className="wrapper">
                    <div>
                        <AppButton
                            onClick={() => setShow(!show)}
                            color="#B56B57"
                            faIconStyle={{fontSize: '50px'}}
                            faIcon={faBars}
                        />
                    </div>
                    <div className="flex justify-content-center">
                        <img className="public-topbar-logo" src="/media/goleador-logo.png"/>
                    </div>
                </div>
            </div>
            <If condition={show}>
                <div className="public-mobile-menu hide-desktop">
                    <div className="meu-perfil"
                         onClick={handleLoginClick}
                    >
                        <h5>MEU PERFIL</h5>
                    </div>
                    <div
                        onClick={handlePlacarClick}
                    >
                        <h5>FAZER PALPITES</h5>
                    </div>
                    <div
                        onClick={handlePalpiteClick}
                    >
                        <h5>MEUS PALPITES</h5>
                    </div>
                    <div
                        onClick={handleRankingClick}
                    >
                        <h5>RANKING</h5>
                    </div>
                    <div
                        onClick={handleRegrasClick}
                    >
                        <h5>REGRAS</h5>
                    </div>
                </div>
            </If>
        </>
    );
}
