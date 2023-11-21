import {Route, Switch} from "react-router-dom";
import React from "react";
import Contato from "./pages/Contato";

import './assets/contato.scss'
export default function ContatoPage() {
    return (
        <>
            <Switch>
                <Route path="/public/contato" exact={true} component={Contato}/>
            </Switch>
        </>
    );
}
