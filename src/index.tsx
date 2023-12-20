import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';
import App from './App';
import { BrowserRouter, HashRouter, Route, Routes } from 'react-router-dom';
import { Line, LineChart } from 'recharts';

const root = ReactDOM.createRoot(
  document.getElementById('root') as HTMLElement
);

root.render(
  <React.StrictMode>
    <BrowserRouter basename='/'>
      <Routes>
        <Route path='/' element={<App />}></Route>
      </Routes>  
    </BrowserRouter>
  </React.StrictMode>
);