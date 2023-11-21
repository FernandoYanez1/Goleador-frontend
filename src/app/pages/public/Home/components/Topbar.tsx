import React, {useState} from "react";
import {FontAwesomeIcon} from "@fortawesome/react-fontawesome";
import {faAnglesRight} from "@fortawesome/free-solid-svg-icons/faAnglesRight";
import AppButton from "../../../../../vendors/components/Button";
import {faBars} from "@fortawesome/free-solid-svg-icons";
import If from "../../../../../vendors/components/If";

export default function Topbar() {
    const [show, setShow] = useState(false);
    return (
        <>
            <div className="public-topbar-wrapper hide-mobile">
                <div className="public-topbar-group">
                    <div>
                        <img className="public-topbar-logo" src="/media/moicanos-logo.png"/>
                    </div>
                    <div className="public-topbar-items">
                        <div>
                            <h5>SERVIÇOS</h5>
                        </div>
                        <div>
                            <h5>PLANOS</h5>
                        </div>
                        <div>
                            <h5>BARBEARIAS</h5>
                        </div>
                        <div className="teste-gratis">
                            <h5>TESTE GRÁTIS</h5>
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
                        <img className="public-topbar-logo" src="/media/moicanos-logo.png"/>
                    </div>
                </div>
            </div>
            <If condition={show}>
                <div className="public-mobile-menu hide-desktop">
                    <div>
                        <h5>SERVIÇOS</h5>
                    </div>
                    <div>
                        <h5>PLANOS</h5>
                    </div>
                    <div>
                        <h5>BARBEARIAS</h5>
                    </div>
                </div>
            </If>
        </>
    );
}
