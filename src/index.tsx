import React from 'react'
import ReactDOM from 'react-dom'
import './index.scss'
import App from './App'
import * as serviceWorkerRegistration from './serviceWorkerRegistration'
// import reportWebVitals from './reportWebVitals'
import { Store } from './store'

ReactDOM.render(
  <React.StrictMode>
    <Store.Provider>
      <App />
    </Store.Provider>
  </React.StrictMode>,
  document.getElementById('root'),
)

// If you want your app to work offline and load faster, you can change
// unregister() to register() below. Note this comes with some pitfalls.
// Learn more about service workers: https://cra.link/PWA
serviceWorkerRegistration.register({
  onUpdate: registration => {
    registration?.waiting?.postMessage?.({ type: 'SKIP_WAITING' })
    setTimeout(() => window.location.reload(), 100)
  },
})

// If you want to start measuring performance in your app, pass a function
// to log results (for example: reportWebVitals(console.log))
// or send to an analytics endpoint. Learn more: https://bit.ly/CRA-vitals
// reportWebVitals(metric => {
//   const body = JSON.stringify(metric)
//   const url = `${process.env.REACT_APP_API_URL}/analytics`

//   // navigator.sendBeacon(url, body)
//   console.log(metric)
// })
