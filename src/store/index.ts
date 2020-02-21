import createStore from '../lib/createStore'
import combineReducers from '../lib/combineReducers'
import _authReducer from './auth'
import drawerReducer from './drawer'
import triviaReducer from './trivia'
import _themeReducer from './theme'
import storageReducer from '../lib/storageReducer'

const [authReducer, authInitialState] =
  storageReducer(_authReducer, '@@AUTH/LOGIN', null)

const [themeReducer, themeInitialState] =
  storageReducer(_themeReducer, '@@THEME', {})

const reducer =
  combineReducers({
    auth: authReducer,
    drawer: drawerReducer,
    trivia: triviaReducer,
    theme: themeReducer,
  })

export const {
  Context: Store,
  Provider: StoreProvider,
} = createStore<React.ReducerState<typeof reducer>, React.ReducerAction<typeof reducer>>(reducer, {
  auth: authInitialState(),
  drawer: {
    title: '',
    usePadding: true,
  },
  trivia: {
    counts: undefined,
  },
  theme: themeInitialState(),
})
