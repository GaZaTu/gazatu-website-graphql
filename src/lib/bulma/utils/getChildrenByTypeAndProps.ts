import React from 'react'
import childMatches from './childMatches'

type ExtractComponentProps<T extends (React.JSXElementConstructor<any> | keyof JSX.IntrinsicElements)[]> = {
  [K in keyof T]: T[K] extends React.JSXElementConstructor<infer P> ? P : T[K] extends keyof JSX.IntrinsicElements ? JSX.IntrinsicElements[T[K]] : {}
}

const getChildrenByTypeAndProps = <C = React.ReactNode, T extends (React.JSXElementConstructor<any> | keyof JSX.IntrinsicElements)[] = any[]>(children: C, types: T, props: Partial<ExtractComponentProps<T>[number]>) =>
  React.Children.toArray(children)
    .filter(child => childMatches(child, types, props)) as React.ReactElement<ExtractComponentProps<T>[number], string | React.JSXElementConstructor<ExtractComponentProps<T>[number]>>[]

export default getChildrenByTypeAndProps
