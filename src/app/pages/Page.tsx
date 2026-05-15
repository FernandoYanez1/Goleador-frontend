import React from "react";
import {Redirect, Route, Switch} from "react-router-dom";
import PublicPage from "./Page";

export default function Page() {
    return (
        <>
            <Switch>
                <Route path="/" component={PublicPage}/>
                <Redirect from="*" to="/" />
            </Switch>
        </>
    );
}
