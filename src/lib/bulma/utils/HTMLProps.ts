export type MutableRef<T> = ((instance: T | null) => void) | React.MutableRefObject<T | null> | null

export type ElementTypeOfJSXProps<T> = T extends React.DetailedHTMLProps<React.AnchorHTMLAttributes<any>, infer E> ? E : never

export type HTMLProps<K extends keyof JSX.IntrinsicElements, Default = undefined> =
  Omit<JSX.IntrinsicElements[K], 'ref'> &
  { innerRef?: MutableRef<ElementTypeOfJSXProps<JSX.IntrinsicElements[K]>> } &
  (Default extends undefined ? {} : Default extends true ? { as?: K } : { as: K })
