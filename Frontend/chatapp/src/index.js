import React from 'react';
import ReactDOM from 'react-dom';
import { BrowserRouter } from 'react-router-dom';
import ChatApp from './ChatApp';

ReactDOM.render(
  <BrowserRouter>
    <ChatApp />
  </BrowserRouter>,
  document.getElementById('root')
);
