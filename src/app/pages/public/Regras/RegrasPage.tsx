import {Route, Switch} from "react-router-dom";
import React from "react";
import './assets/regras.scss'
import Regras from "./pages/Regras";

export default function RegrasPage() {
    return (
        <>
            <Switch>
                <Route path="/public/regras" exact={true} component={Regras}/>
            </Switch>
        </>
    );
}
