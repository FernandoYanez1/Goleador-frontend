import {Route, Switch} from "react-router-dom";
import React from "react";
import './assets/palpite.scss'
import Palpites from "./pages/Palpites";

export default function PalpitesPage() {
    return (
        <>
            <Switch>
                <Route path="/public/palpites" exact={true} component={Palpites}/>
            </Switch>
        </>
    );
}
