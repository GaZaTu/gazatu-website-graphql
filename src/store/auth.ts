export type State = {
  token: string
  user: {
    id: string
    username: string
    roles: { name: string }[]
  }
}

export type Action = {
  type: '@@AUTH/LOGIN'
  payload: State
} | {
  type: '@@AUTH/LOGOUT'
}

const reducer: React.Reducer<State | null, Action> = (state, action) => {
  switch (action.type) {
    case '@@AUTH/LOGIN':
      return {
        ...state,
        ...action.payload,
      }
    case '@@AUTH/LOGOUT':
      return null
    default:
      return state
  }
}

export default reducer
