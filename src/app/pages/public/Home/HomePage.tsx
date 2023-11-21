import React from "react";
import {Redirect, Route, Switch} from "react-router-dom";
import Home from "./pages/Home";

import './assets/hero.scss';
import './assets/topbar.scss';
import './assets/brand.scss';
import './assets/transform.scss';
import './assets/partners.scss';
import './assets/without-commitment.scss';
import './assets/about-us.scss';
import './assets/plans.scss';
import './assets/advertising.scss';
import './assets/common-question.scss';
import './assets/footer.scss';
import ContatoPage from "../Contato/ContatoPage";

export default function HomePage() {
    return (
        <>
            <Switch>
                <Route path="/public/contato" exact={true} component={ContatoPage}/>
                <Route path="/public/home" exact={true} component={Home}/>
                <Redirect from="*" to="/public/home"/>
            </Switch>
        </>
    );
}
