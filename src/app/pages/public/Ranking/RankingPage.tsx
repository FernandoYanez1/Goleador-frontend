import {Route, Switch} from "react-router-dom";
import React from "react";
import './assets/ranking.scss'
import Ranking from "./pages/Ranking";

export default function RankingPage() {
    return (
        <>
            <Switch>
                <Route path="/public/ranking" exact={true} component={Ranking}/>
            </Switch>
        </>
    );
}
