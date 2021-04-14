import React from 'react'
import { H2 } from './bulma/Text'

const getColor = (str: string, isValue = false) => {
  if (isValue) {
    if (['null', 'undefined', 'true', 'false'].includes(str)) {
      return '#569cd6'
    }

    if (!isNaN(Number(str))) {
      return '#b5cea8'
    }

    return '#ce915b'
  } else {
    if (['?', '&', '='].includes(str)) {
      return '#d4d4d4'
    }

    return '#4fc1ff'
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
