import React from 'react';
import 'primeicons/primeicons.css';
import {addLocale, locale} from "primereact/api";
import {localeConfig} from "./app/shared/locale";
import Routes from "./app/router";

import "primereact/resources/themes/lara-light-indigo/theme.css";

import "primereact/resources/primereact.min.css";

function App() {
    addLocale('pt-BR', localeConfig);

    locale('pt-BR');
    return (
        <>
            <Routes/>
        </>
    );
}

export default App;
