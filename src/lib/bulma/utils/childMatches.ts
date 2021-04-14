import { typeOfComponent } from 'react-nanny'

const childMatches = (child: any, types: any[], props: any): child is any => {
  if (!child) {
    return false
  }

  let type = typeOfComponent(child)
  if (!type && child.type?.['$$typeof'] === Symbol.for('react.memo')) {
    type = child.type
  }

  if (!types.includes(type)) {
    return false
  }

  if (!child.props) {
    return false
  }

  for (const [key, value] of Object.entries(props)) {
    if (child[key] !== value) {
      return false
    }
  }

  return true
}

export default childMatches
