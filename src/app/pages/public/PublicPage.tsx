import React from "react";
import {Route, Switch} from "react-router-dom";
import HomePage from "./Home/HomePage";


export default function PublicPage() {
    return (
        <>
            <Switch>
                <Route path="/public" component={HomePage}/>
            </Switch>
        </>
    );
}
