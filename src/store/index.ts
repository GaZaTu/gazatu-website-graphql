import createStore from '../lib/store/createStore'
import mergeReducers from '../lib/store/mergeReducers'
import storageReducer from '../lib/store/storageReducer'
import _authReducer from './auth'

const [authReducer, authInitialState] =
  storageReducer(_authReducer, '@@AUTH/LOGIN', null)

const reducer =
  mergeReducers({
    auth: authReducer,
  })

export type State = React.ReducerState<typeof reducer>

export type Action = React.ReducerAction<typeof reducer>

export const Store =
  createStore<State, Action>(reducer, {
    auth: authInitialState(),
  })
