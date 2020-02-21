import { ThemeOptions } from '@material-ui/core/styles/createMuiTheme'

export type State = ThemeOptions & {}

export type Action = {
  type: '@@THEME/SET_STATE'
  payload: Partial<State>
}

const reducer: React.Reducer<State, Action> = (state, action) => {
  switch (action.type) {
    case '@@THEME/SET_STATE':
      return {
        ...state,
        ...action.payload,
      }
    default:
      return state
  }
}

export default reducer
