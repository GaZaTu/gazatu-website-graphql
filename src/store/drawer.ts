export type State = {
  title: string
  usePadding: boolean
}

export type Action = {
  type: '@@DRAWER/SET_STATE'
  payload: Partial<State>
}

const reducer: React.Reducer<State, Action> = (state, action) => {
  switch (action.type) {
    case '@@DRAWER/SET_STATE':
      return {
        ...state,
        ...action.payload,
      }
    default:
      return state
  }
}

export default reducer
