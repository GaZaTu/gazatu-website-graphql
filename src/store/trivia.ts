import { TriviaCounts } from '../graphql/schema.gql'

export type State = {
  counts?: TriviaCounts
  invalidateCounts?: boolean
}

export type Action = {
  type: '@@TRIVIA/SET_STATE'
  payload: Partial<State>
} | {
  type: '@@TRIVIA/INVALIDATE_COUNTS'
}

const reducer: React.Reducer<State, Action> = (state, action) => {
  switch (action.type) {
    case '@@TRIVIA/SET_STATE':
      return {
        ...state,
        ...action.payload,
      }
    case '@@TRIVIA/INVALIDATE_COUNTS':
      return {
        ...state,
        invalidateCounts: !state.invalidateCounts,
      }
    default:
      return state
  }
}

export default reducer
