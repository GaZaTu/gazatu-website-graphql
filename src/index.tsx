import React from 'react'
import ReactDOM from 'react-dom'
import * as serviceWorker from './serviceWorkerRegistration'
import App from './App'
import { StoreProvider } from './store'
import './index.css'

ReactDOM.render((
  <StoreProvider>
    <App />
  </StoreProvider>
), document.getElementById('root'))

serviceWorker.register({
  onUpdate: registration => {
    if (registration?.waiting) {
      registration.waiting.postMessage({ type: 'SKIP_WAITING' })
    }

    window.location.reload()
  },
})
