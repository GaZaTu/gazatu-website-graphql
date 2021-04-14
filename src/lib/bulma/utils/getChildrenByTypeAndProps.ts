import React from 'react'
import childMatches from './childMatches'

const getChildrenByTypeAndProps = <T = React.ReactNode>(children: T, types: any[], props: any) =>
  React.Children.toArray(children)
    .filter(child => childMatches(child, types, props)) as any[]

export default getChildrenByTypeAndProps
