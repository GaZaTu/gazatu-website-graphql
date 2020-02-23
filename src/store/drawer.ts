export type State = {
  title: string
  usePadding: boolean
  promptDialog?: {
    title: string
    content?: string
    disableBackdropClick?: boolean
    buttons: { key: string, label: string }[]
    clickedButton?: string | null
  }
}

export type Action = {
  type: '@@DRAWER/SET_STATE'
  payload: Partial<State>
} | {
  type: '@@DRAWER/SHOW_PROMPT_DIALOG'
  payload: Exclude<State['promptDialog'], undefined>
} | {
  type: '@@DRAWER/HIDE_PROMPT_DIALOG'
} | {
  type: '@@DRAWER/SET_PROMPT_DIALOG_CLICKED_BUTTON'
  payload: Exclude<Exclude<State['promptDialog'], undefined>['clickedButton'], undefined>
}

const reducer: React.Reducer<State, Action> = (state, action) => {
  switch (action.type) {
    case '@@DRAWER/SET_STATE':
      return {
        ...state,
        ...action.payload,
      }
    case '@@DRAWER/SHOW_PROMPT_DIALOG':
      return {
        ...state,
        promptDialog: action.payload,
      }
    case '@@DRAWER/HIDE_PROMPT_DIALOG':
      return {
        ...state,
        promptDialog: undefined,
      }
    case '@@DRAWER/SET_PROMPT_DIALOG_CLICKED_BUTTON':
      return {
        ...state,
        promptDialog: state.promptDialog && {
          ...state.promptDialog,
          clickedButton: action.payload,
        },
      }
    default:
      return state
  }
}

export default reducer
