import React from "react";
import {FontAwesomeIcon} from "@fortawesome/react-fontawesome";
import {faFacebook, faFacebookF, faInstagram, faYoutube} from "@fortawesome/free-brands-svg-icons";

export default function Footer() {
    const year = (new Date()).getFullYear()
    return (
        <>
            <footer className="public-footer">
                <div className="content-wrapper">
                    <div className="branding">
                        {/*<img className="moicanos-logo" src="/media/moicanos-logo.png" />*/}
                        <p>
                            Experimente nossa plataforma por 7 dias sem custo.
                            Desbloqueie todo o potencial de gerenciamento para
                            sua barbearia e veja os resultados por si mesmo.
                        </p>
                        <div className="mt-5">
                            <FontAwesomeIcon color="white" icon={faFacebookF} />
                            <FontAwesomeIcon style={{marginLeft: '20px'}}
                                             color="white" icon={faInstagram} />
                            <FontAwesomeIcon style={{marginLeft: '20px'}}
                                             color="white" icon={faYoutube} />
                        </div>
                    </div>
                    <div className="menu">
                        <h4>Menu</h4>
                        <div className="menu-list">
                            <div>
                                <h3>HOME</h3>
                                <h3>RECURSOS</h3>
                                <h3>FAQ</h3>
                                {/*<h3>BARBEARIAS</h3>*/}
                                {/*<h3>PLANOS</h3>*/}
                            </div>
                            <div>
                                {/*<h3>PLANOS</h3>*/}
                                <h3>DEPOIMENTOS</h3>
                                {/*<h3>FAQ</h3>*/}
                                <h3>TERMOS</h3>
                            </div>
                        </div>
                    </div>
                </div>
                <div className="copyright">
                    <label>Copyright© Moicanos {year} | Designed by Fernando Yañez</label>
                </div>
            </footer>
        </>
    );
}
