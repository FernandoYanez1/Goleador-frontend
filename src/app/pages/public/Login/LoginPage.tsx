import {Route, Switch} from "react-router-dom";
import React from "react";
import './assets/login.scss'
import Login from "./pages/Login";

export default function LoginPage() {
    return (
        <>
            <Switch>
                <Route path="/public/login" exact={true} component={Login}/>
            </Switch>
        </>
    );
}
