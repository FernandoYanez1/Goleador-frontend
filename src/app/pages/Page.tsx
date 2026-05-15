import React from "react";
import {Redirect, Route, Switch} from "react-router-dom";
import PublicPage from "./public/PublicPage";

export default function Page() {
    return (
        <>
            <Switch>
                <Route path="/public" component={PublicPage}/>
                <Redirect from="*" to="/public" />
            </Switch>
        </>
    );
}
