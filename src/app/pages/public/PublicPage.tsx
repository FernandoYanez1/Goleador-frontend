import React from "react";
import {Route, Switch} from "react-router-dom";
import HomePage from "./Home/HomePage";
import Login from "./Login/pages/Login";
import Contato from "./Contato/pages/Contato";
import Perfil from "./Perfil/pages/Perfil";
import Placar from "./FazerPlacar/pages/Placar";
import MeusPalpites from "./MeusPalpites/pages/Palpites";
import Admin from "./Admin/pages/Admin";
import ResetarSenha from "./ResetarSenha/pages/ResetarSenha";
import GlobalMobileNav from "./Home/components/GlobalMobileNav";
import GlobalAvisos from "./GlobalAvisos/pages/GlobalAvisos";

export default function PublicPage() {
    return (
        <>
            <Switch>
                <Route path="/public/login" component={Login} />
                <Route path="/public/contato" component={Contato} />
                <Route path="/public/perfil" component={Perfil} />
                <Route path="/public/placar" component={Placar} />
                <Route path="/public/meus-palpites" component={MeusPalpites} />
                <Route path="/public/resetar-senha" component={ResetarSenha} />
                <Route path="/public/admin" component={Admin} />
                <Route path="/public/globalavisos" component={GlobalAvisos} />
                <Route path="/public" component={HomePage} /> 
            </Switch>
            
            <GlobalMobileNav />
        </>
    );
}