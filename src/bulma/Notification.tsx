import classNames from 'classnames'
import React, { useMemo, useState } from 'react'
import Button from './Button'
import { Color } from './utils/classes'
import { HTMLProps } from './utils/HTMLProps'

type NotificationData = {
  content: React.ReactNode
  options?: {
    props?: Props
    timeout?: number
    closeable?: boolean
  }
}

type PushFunction = (content: React.ReactNode, options?: NotificationData['options']) => void

const Context = React.createContext({
  push: ((c, o) => { }) as PushFunction,
  pushPrimary: ((c, o) => { }) as PushFunction,
  pushInfo: ((c, o) => { }) as PushFunction,
  pushSuccess: ((c, o) => { }) as PushFunction,
  pushWarning: ((c, o) => { }) as PushFunction,
  pushDanger: ((c, o) => { }) as PushFunction,
  pushError: ((c, o) => { }) as PushFunction,
})
const ContextProvider = Context.Provider

const Provider: React.FC<{}> = props => {
  const { children } = props
  const [notifications, setNotifications] = useState([] as NotificationData[])

  const push = useMemo<PushFunction>(() => {
    return (content, options) => {
      const notification = { content, options }
      const timeout = options?.timeout ?? 10000
      const closeable = options?.closeable ?? false
      const remove = () => {
        setNotifications(a => a.filter(n => n !== notification))
      }

      if (timeout > 0) {
        setTimeout(remove, timeout)
      }

      if (closeable) {
        notification.content = (
          <>
            <Button onClick={remove} cross />
            {content}
          </>
        )
      }

      setNotifications(a => [...a, notification].slice(Math.max(a.length - 3, 0)))
    }
  }, [])

  const pushColored = useMemo(() => {
    return (content: React.ReactNode, options?: NotificationData['options'], color?: Props['color'], light?: Props['light']) =>
      push(content, {
        ...options,
        props: {
          ...options?.props,
          color,
          light,
        },
      })
  }, [push])

  const pushPrimary = useMemo<PushFunction>(() => {
    return (content, options) =>
      pushColored(content, options, 'primary', false)
  }, [pushColored])

  const pushInfo = useMemo<PushFunction>(() => {
    return (content, options) =>
      pushColored(content, options, 'info', false)
  }, [pushColored])

  const pushSuccess = useMemo<PushFunction>(() => {
    return (content, options) =>
      pushColored(content, options, 'success', false)
  }, [pushColored])

  const pushWarning = useMemo<PushFunction>(() => {
    return (content, options) =>
      pushColored(content, options, 'warning', false)
  }, [pushColored])

  const pushDanger = useMemo<PushFunction>(() => {
    return (content, options) =>
      pushColored(content, options, 'danger', false)
  }, [pushColored])

  const pushError = useMemo<PushFunction>(() => {
    return (content, options) =>
      pushDanger(String(content), options)
  }, [pushDanger])

  const context = {
    push,
    pushPrimary,
    pushInfo,
    pushSuccess,
    pushWarning,
    pushDanger,
    pushError,
  }

  return (
    <ContextProvider value={context}>
      {children}
      <div className="notifications">
        {notifications.map((notification, i) => (
          <Notification key={i} {...notification.options?.props}>
            {notification.content}
          </Notification>
        ))}
      </div>
    </ContextProvider>
  )
}

type Props = HTMLProps<'div'> & {
  color?: Color
  light?: boolean
}

const Notification: React.FC<Props> = props => {
  const {
    color,
    light,
    children,
    innerRef,
    ...nativeProps
  } = props

  const className = classNames(nativeProps.className, {
    'notification': true,
    [`is-${color}`]: !!color,
    'is-light': !!light,
  })

  return (
    <div {...nativeProps} ref={innerRef} className={className}>
      {children}
    </div>
  )
}

export default Object.assign(React.memo(Notification), {
  Context: Object.assign(Context, {
    Provider,
  })
})
