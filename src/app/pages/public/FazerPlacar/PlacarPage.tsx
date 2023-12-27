import {Route, Switch} from "react-router-dom";
import React from "react";
import './assets/placar.scss'
import Placar from "./pages/Placar";

export default function PlacarPage() {
    return (
        <>
            <Switch>
                <Route path="/public/placar" exact={true} component={Placar}/>
            </Switch>
        </>
    );
}
