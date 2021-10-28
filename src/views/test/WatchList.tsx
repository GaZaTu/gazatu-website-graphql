import classNames from 'classnames'
import React from 'react'
import A from '../../lib/bulma/A'
import { HTMLProps } from '../../lib/bulma/utils/HTMLProps'
import './WatchList.css'

type TickerProps = {
  isin?: string
  href?: string
  logo?: string
  symbol?: string
  name?: string
  open?: boolean
  invalid?: boolean
  value?: number
  currency?: string
  valueAtPreviousClose?: number
  highlighted?: boolean
}

const Ticker: React.FC<TickerProps> = props => {
  const {
    isin,
    href,
    logo,
    symbol,
    name,
    open,
    invalid,
    value,
    // currency,
    valueAtPreviousClose,
    highlighted,
  } = props

  // const previousValue = usePrevious(value)

  const valueChange = (value && valueAtPreviousClose) && (value - valueAtPreviousClose)
  const valueChangePercentage = (valueChange) && ((valueChange * 100) / valueAtPreviousClose)

  return (
    <A key={isin} className={`tv-widget-watch-list__row tv-site-table__row tv-site-table__row--interactive tv-widget-watch-list__row--interactive quote-ticker-inited ${highlighted ? 'tv-site-table__row--highlighted tv-widget-watch-list__row--highlighted' : ''}`} href={href}>
      <div className="tv-site-table__column tv-widget-watch-list__main-column" style={{ maxWidth: '55%', paddingRight: '0.5rem' }}>
        {logo && (
          <div className="tv-widget-watch-list__icon">
            <img className="tv-circle-logo tv-circle-logo--medium" src={logo} alt="" />
          </div>
        )}
        <div className="tv-widget-watch-list__name">
          <div className="tv-widget-watch-list__ticker">
            {/* <a href="https://www.tradingview.com/symbols/FOREXCOM-SPXUSD/" target="_blank" className="tv-widget-watch-list__short-name">SPXUSD</a> */}
            {symbol && (
              <span className="tv-widget-watch-list__short-name">{symbol}</span>
            )}
            {/* <span className="tv-data-mode--watch-list tv-data-mode tv-data-mode--for-watch-list tv-data-mode--realtime--for-watch-list tv-data-mode--for-ticker tv-data-mode--realtime tv-data-mode--realtime--for-ticker" title="Real-time">R</span> */}
            {(open !== undefined || invalid !== undefined) && (() => {
              const status = (() => {
                if (invalid) {
                  return 'invalid'
                } else if (open) {
                  return 'market'
                } else {
                  return 'out-of-session'
                }
              })()

              return (
                <span className={`tv-market-status--watch-list tv-market-status tv-market-status--for-watch-list tv-market-status--${status} tv-market-status--${status}--for-watch-list`}>
                  <span className="tv-market-status__label tv-market-status__label--for-watch-list">{status}</span>
                  <span className="tv-market-status__dot tv-market-status__dot--for-watch-list" />
                </span>
              )
            })()}
          </div>
          {name && (
            <div>
              <span className="tv-widget-watch-list__description">{name}</span>
            </div>
          )}
        </div>
      </div>
      <div className="tv-widget-watch-list__quote-column tv-site-table__column tv-site-table__column--align_right tv-site-table__column--last-phone-vertical">
        {!!value && (
          <div className="tv-widget-watch-list__last-wrap" style={{ maxWidth: '50%' }}>
            {/* <div className={`tv-widget-watch-list__last ${(value && previousValue && (value !== previousValue)) ? (value > previousValue ? 'growing' : 'falling') : ''}`}>{numberUnsignedFormat.format(value)}</div> */}
            <div className="tv-widget-watch-list__last">{numberUnsignedFormat.format(value)}</div>
          </div>
        )}
        <div className={`tv-widget-watch-list__change ${valueChange ? (valueChange >= 0 ? 'up' : 'down') : ''}`} style={{ width: '80px' }}>
          {!!valueChangePercentage && (
            <span className="tv-widget-watch-list__change-inline">{numberSignedFormat.format(valueChangePercentage)}%</span>
          )}
          {!!valueChange && (
            <span className="tv-widget-watch-list__change-inline">{numberSignedFormat.format(valueChange)}</span>
          )}
        </div>
      </div>
    </A>
  )
}

type Props = HTMLProps<'div'> & {
  children?: TickerProps[]
  dark?: boolean
}

const numberUnsignedFormat = new Intl.NumberFormat(undefined, {
  minimumFractionDigits: 2,
  maximumFractionDigits: 2,
  signDisplay: 'never',
})

const numberSignedFormat = new Intl.NumberFormat(undefined, {
  minimumFractionDigits: 2,
  maximumFractionDigits: 2,
  signDisplay: 'always',
})

const WatchList: React.FC<Props> = props => {
  const {
    children,
    innerRef,
    // tickers,
    dark,
    ...nativeProps
  } = props

  const className = classNames(nativeProps.className, {
    'tv-embed-widget-wrapper': true,
    'theme-dark': dark,
  })

  return (
    <div {...nativeProps} ref={innerRef} className={className}>
      <div className="tv-embed-widget-wrapper__header" />
      <div className="tv-embed-widget-wrapper__body" style={{ border: 'unset' }}>
        <div id="widget-market-overview-container" className="tv-site-widget tv-site-widget--bg_none">
          <div className="tv-widget-watch-list__body-embed">
            <div className="">
              <div className="tv-widget-watch-list">
                <div className="">
                  <div className="tv-site-table tv-widget-watch-list__table tv-site-table--start-border tv-site-table--with-end-border" style={{ paddingTop: '8px', paddingBottom: '8px' }}>
                    {children}
                  </div>
                </div>
              </div>
              <div className="tv-widget-watch-list i-hidden">
                <div className="tv-widget-watch-list__chart" />
                <div className="tv-widget-watch-list__timeframe" />
                <div className="">
                  <div className="tv-site-table tv-widget-watch-list__table tv-site-table--start-border tv-site-table--with-end-border">
                  </div>
                </div>
              </div>
              <div className="tv-widget-watch-list i-hidden">
                <div className="tv-widget-watch-list__chart" />
                <div className="tv-widget-watch-list__timeframe" />
                <div className="">
                  <div className="tv-site-table tv-widget-watch-list__table tv-site-table--start-border tv-site-table--with-end-border">
                  </div>
                </div>
              </div>
              <div className="tv-widget-watch-list i-hidden">
                <div className="tv-widget-watch-list__chart" />
                <div className="tv-widget-watch-list__timeframe" />
                <div className="">
                  <div className="tv-site-table tv-widget-watch-list__table tv-site-table--start-border tv-site-table--with-end-border">
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default Object.assign(React.memo(WatchList), {
  Ticker: React.memo(Ticker),
})
