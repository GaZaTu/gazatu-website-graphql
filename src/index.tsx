import React from 'react'
import ReactDOM from 'react-dom'
import * as serviceWorker from './serviceWorker'
import App from './App'
import { StoreProvider } from './store'
import './index.css'

ReactDOM.render((
  <StoreProvider>
    <App />
  </StoreProvider>
), document.getElementById('root'))

serviceWorker.register({
  onUpdate: () => window.location.reload(),
})
