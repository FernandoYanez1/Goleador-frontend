import React from 'react';
import {BrowserRouter} from 'react-router-dom';
import Page from "../pages/Page";

const Routes: React.FC = () => {
  return (
    <BrowserRouter>
        <Page />
    </BrowserRouter>
  );
};

export default Routes;
