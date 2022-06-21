
import React from 'react';
import ReactDOMClient from 'react-dom/client';
import App from './components/App';
import Test from './components/Test';
import Chart from './components/Chart';

const container = document.getElementById('app');
const root = ReactDOMClient.createRoot(container);
root.render(<App />);