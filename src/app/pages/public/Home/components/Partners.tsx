import React from "react";
import {InputText} from "primereact/inputtext";
import AppButton from "../../../../../vendors/components/Button";
import {faSearch} from "@fortawesome/free-solid-svg-icons";
import Barber from "../../../../mocks/barber";
import PartnersItems from "./PartnersItems";

export default function Partners() {
    const items = Barber.BARBER_LIST;
    return (
        <>
            <div className="public-partners ">
                <div className="app-title">
                    <h1>BARBEARIAS PARCEIRAS</h1>
                    <p>Encontre a barbearia mais próxima e agende agora mesmo seu próximo corte</p>
                </div>
                <div className="app-search-wrapper">
                    <InputText className="app-find" placeholder="DIGITE AQUI O NOME DA BARBEARIA"/>
                    <AppButton color="white" faIconOpts={{size: 'lg'}} faIcon={faSearch}/>
                </div>
                <div className="items-wrapper">
                    {
                        items.map((m: any, index: any) => <PartnersItems key={`partner-item-${index}`}
                                                                         item={m}
                                                                         index={index}/>)
                    }
                </div>
            </div>
            <div>

            </div>
        </>
    );
}
