import React from 'react';
import ReactDOM from 'react-dom';
import App from './App';
import { Provider } from 'react-redux';
import configureStore from "./redux/store"

ReactDOM.render(
        <Provider 
            store={configureStore({
                schoolName: 'Dhanmondi Tutorial'
            })
        }>
            <App/>
        </Provider>
    , document.getElementById('root')
);
