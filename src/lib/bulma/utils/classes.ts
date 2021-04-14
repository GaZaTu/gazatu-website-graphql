const newClassFunc = (cls: string) =>
  Object.assign((v: any) => v && cls, { toString: () => cls })

const colors = {
  white: 'white',
  black: 'black',
  light: 'light',
  dark: 'dark',
  primary: 'primary',
  link: 'link',
  info: 'info',
  success: 'success',
  warning: 'warning',
  danger: 'danger',
  ghost: 'ghost',
  text: 'text',
}

export type Color = keyof typeof colors

const spacing = {
  // margin-top
  mt0: newClassFunc('mt-0'),
  mt1: newClassFunc('mt-1'),
  mt2: newClassFunc('mt-2'),

  // margin-bottom
  mb0: newClassFunc('mb-0'),
  mb1: newClassFunc('mb-1'),
  mb2: newClassFunc('mb-2'),
}

const classes = {
  colors,
  spacing,
}

export default classes
