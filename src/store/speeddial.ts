import SpeedDialAction from '@material-ui/lab/SpeedDialAction'

export type State = {
  actions: React.ComponentProps<typeof SpeedDialAction>[]
}

export type Action = {
  type: '@@SPEEDDIAL/SET_STATE'
  payload: Partial<State>
}

const reducer: React.Reducer<State, Action> = (state, action) => {
  switch (action.type) {
    case '@@SPEEDDIAL/SET_STATE':
      return {
        ...state,
        ...action.payload,
      }
    default:
      return state
  }
}

export default reducer
