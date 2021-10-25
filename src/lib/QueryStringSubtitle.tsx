import React from 'react'
import { H2 } from './bulma/Text'

export const keywordColor = '#569cd6'
export const numberColor = '#b5cea8'
export const stringColor = '#ce915b'
export const symbolColor = '#d4d4d4'
export const variableColor = '#4fc1ff'

const getColor = (str: string, isValue = false) => {
  if (isValue) {
    if (['null', 'undefined', 'true', 'false'].includes(str)) {
      return keywordColor
    }

    if (!isNaN(Number(str))) {
      return numberColor
    }

    return stringColor
  } else {
    if (['?', '&', '='].includes(str)) {
      return symbolColor
    }

    return variableColor
  }
}

const QueryStringSubtitle: React.FC<{ query?: string }> = props => {
  const { query } = props

  const childrenNodes = [] as React.ReactNode[]
  if (query?.length) {
    let i = 0

    const symbolColor = getColor('=')
    for (const pair of query.split('&')) {
      const [key, value] = pair.split('=')
      const keyColor = getColor(key, false)
      const valueColor = getColor(value, true)

      childrenNodes.push(<span key={i++} style={{ color: symbolColor }}>{childrenNodes.length ? '&' : '?'}</span>)
      childrenNodes.push(<span key={i++} style={{ color: keyColor }}>{key}</span>)
      childrenNodes.push(<span key={i++} style={{ color: symbolColor }}>{'='}</span>)
      childrenNodes.push(<span key={i++} style={{ color: valueColor }}>{value}</span>)
    }
  }

  if (!childrenNodes.length) {
    return null
  }

  return (
    <H2 kind="subtitle">{childrenNodes}</H2>
  )
}

export default QueryStringSubtitle
