import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';
import App from './App';
import { BrowserRouter, HashRouter, Route, Routes, useLocation } from 'react-router-dom';

const root = ReactDOM.createRoot(
  document.getElementById('root') as HTMLElement
);

root.render(
  <React.StrictMode>
    <BrowserRouter basename='/frc-group-tracker'>
      <Routes>
        <Route path='/' element={<App/>}/>
      </Routes>  
    </BrowserRouter>
  </React.StrictMode>
);