import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import App from './App';
import './globals.css';

// 主题初始化脚本（内联到 HTML 避免 FOUC）
const savedTheme = localStorage.getItem('compass-theme');
const validThemes = ['light', 'dark', 'ocean'];
const theme = savedTheme && validThemes.includes(savedTheme) ? savedTheme : 'dark';
document.documentElement.setAttribute('data-theme', theme);

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <BrowserRouter>
      <App />
    </BrowserRouter>
  </React.StrictMode>,
);
