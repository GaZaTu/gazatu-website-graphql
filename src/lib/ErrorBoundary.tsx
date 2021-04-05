import React from 'react'

type Props = {
  onError: NonNullable<React.Component['componentDidCatch']>
}

class ErrorBoundary extends React.Component<Props> {
  // constructor(props: Props) {
  //   super(props)
  // }

  static getDerivedStateFromError(error: Error) {
    return {}
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    this.props.onError(error, errorInfo)
  }

  render() {
    return this.props.children
  }
}

export default ErrorBoundary
