import classNames from 'classnames'
import React, { useMemo, useState } from 'react'
import Button from './Button'
import getChildrenByTypeAndProps from './utils/getChildrenByTypeAndProps'
import { HTMLProps } from './utils/HTMLProps'

const Portal = React.createContext({
  showModal: function <R>(content: React.ReactNode) {
    return [Promise.resolve(undefined as any as R), (r: R) => {}, () => {}] as const
  },
  alert: (content: React.ReactNode) => [Promise.resolve(undefined as any), (r: any) => {}, () => {}] as const,
  // prompt: (content: React.ReactNode) => [Promise.resolve(''), (r: string) => {}, () => {}] as const,
  confirm: function <K extends readonly string[] = readonly ['OK', 'Cancel']>(content: React.ReactNode, buttons: K = ['OK', 'Cancel'] as any) {
    return [Promise.resolve('' as any as K[number]), (r: K[number]) => {}, () => {}] as const
  },
})
const PortalProvider = Portal.Provider

const Provider: React.FC<{}> = props => {
  const { children } = props

  type PortalData = React.ContextType<typeof Portal>
  type ModalData = { content: React.ReactNode, reject: () => void }

  const [modals, setModals] = useState([] as ModalData[])

  const showModal = useMemo<PortalData['showModal']>(() => {
    return content => {
      let resolve = (r: any) => {}
      let reject = () => { }

      let promise = new Promise<any>((_resolve, _reject) => {
        resolve = _resolve
        reject = _reject
      })

      const modal = { content, reject }
      const push = () => { setModals(l => [...l, modal]) }
      const remove = (r: any) => {
        setModals(l => l.filter(m => m !== modal))
        return r
      }

      push()

      return [promise.then(remove).catch(remove), resolve, reject]
    }
  }, [])

  const confirm = useMemo<PortalData['confirm']>(() => {
    return (content, buttons = ['OK', 'Cancel'] as any) => {
      const [promise, resolve, reject] = showModal<(typeof buttons)[number]>(
        <>
          {content}
          <Foot>
            {buttons.map(button => (
              <Button key={button} onClick={() => resolve(button)}>{button}</Button>
            ))}
          </Foot>
        </>
      )

      return [promise, resolve, reject]
    }
  }, [showModal])

  const alert = useMemo<PortalData['alert']>(() => {
    return content => {
      const [promise, resolve, reject] = confirm(content, ['OK'] as const)

      return [promise.catch(), resolve, reject]
    }
  }, [confirm])

  return (
    <PortalProvider value={{ showModal, alert, confirm }}>
      {children}
      <div className="modals">
        {modals.map(({ content, reject }, i) => (
          <Modal key={i} onClose={reject} active>
            {content}
          </Modal>
        ))}
      </div>
    </PortalProvider>
  )
}

type HeadProps = HTMLProps<'header'> & {}

const Head: React.FC<HeadProps> = props => {
  const {
    children,
    innerRef,
    ...nativeProps
  } = props

  const className = classNames(nativeProps.className, {
    'modal-card-head': true,
  })

  return (
    <header {...nativeProps} ref={innerRef} className={className}>
      <p className="modal-card-title">{children}</p>
      {/* <Button cross /> */}
    </header>
  )
}

type BodyProps = HTMLProps<'section'> & {
  head?: string
}

const Body: React.FC<BodyProps> = props => {
  const {
    head: _head,
    children,
    innerRef,
    ...nativeProps
  } = props

  const className = classNames(nativeProps.className, {
    'modal-card-body': true,
  })

  const body = (
    <section {...nativeProps} ref={innerRef} className={className}>
      {children}
    </section>
  )

  if (_head) {
    const head = (
      <Head>{_head}</Head>
    )

    return (
      <React.Fragment>
        {head}
        {body}
      </React.Fragment>
    )
  }

  return body
}

type FootProps = HTMLProps<'footer'> & {}

const Foot: React.FC<FootProps> = props => {
  const {
    children,
    innerRef,
    ...nativeProps
  } = props

  const className = classNames(nativeProps.className, {
    'modal-card-foot': true,
  })

  return (
    <footer {...nativeProps} ref={innerRef} className={className}>
      {children}
    </footer>
  )
}

type Props = HTMLProps<'div'> & {
  active?: boolean
  onClose?: (event: React.MouseEvent) => void
}

const Modal: React.FC<Props> = props => {
  const {
    active,
    onClose,
    children,
    innerRef,
    ...nativeProps
  } = props

  const card = !!getChildrenByTypeAndProps(children, [Head, Body, Foot], {}).length

  const className = classNames(nativeProps.className, {
    'modal': true,
    'is-active': !!active,
  })

  return (
    <div {...nativeProps} ref={innerRef} className={className}>
      <div className="modal-background" onClick={onClose} />
      { card && (
        <div className="modal-card">
          {children}
        </div>
      )}
      {!card && (
        <div className="modal-content">
          {children}
        </div>
      )}
      {!card && (
        <button className="modal-close is-large" onClick={onClose} aria-label="close" />
      )}
    </div>
  )
}

export default Object.assign(React.memo(Modal), {
  Portal: Object.assign(Portal, {
    Provider,
  }),
  Head,
  Body,
  Foot,
})
