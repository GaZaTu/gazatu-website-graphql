import classNames from 'classnames'
import React from 'react'
import A from '../../lib/bulma/A'
import { HTMLProps } from '../../lib/bulma/utils/HTMLProps'
import './SymbolInfo.css'

type Props = HTMLProps<'div'> & {
  logo?: string // https://s3-symbol-logo.tradingview.com/apple--big.svg
  name?: string // Apple Inc
  isin?: string
  symbol?: string // AAPL
  countryFlag?: string // https://s3-symbol-logo.tradingview.com/country/US.svg
  country?: string // US
  exchange?: string // NASDAQ
  value?: number
  currency?: string
  valueAtPreviousClose?: number
  open?: boolean
  openStatusSince?: number
  meta?: {
    key: string
    value?: unknown
    href?: string
    title?: string
    width?: string
    highlighted?: boolean
    upperCase?: boolean
  }[]
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

const SymbolInfo: React.FC<Props> = props => {
  const {
    children,
    innerRef,
    logo,
    name,
    isin,
    symbol,
    countryFlag = props.country && `https://s3-symbol-logo.tradingview.com/country/${props.country}.svg`,
    country,
    exchange,
    value,
    currency,
    valueAtPreviousClose,
    open,
    openStatusSince,
    meta,
    dark,
    ...nativeProps
  } = props

  // const previousValue = usePrevious(value)

  const valueChange = (value && valueAtPreviousClose) && (value - valueAtPreviousClose)
  const valueChangePercentage = (valueChange) && ((valueChange * 100) / valueAtPreviousClose)

  const openStatusSinceDateString = (openStatusSince) && new Date(openStatusSince).toISOString() // TODO: only time if same date

  const className = classNames(nativeProps.className, {
    'tv-embed-widget-wrapper': true,
    'theme-dark': dark,
  })

  return (
    <div {...nativeProps} ref={innerRef} className={className}>
      <div className="tv-embed-widget-wrapper__header" />
      <div className="tv-embed-widget-wrapper__body" style={{ border: 'unset' }}>
        <div id="symbol-info-widget" className="tv-category-header tv-category-header--transparent tv-symbol-info-widget">
          <div className="tv-category-header__content tv-symbol-info-widget__content">
            <a className="tv-category-header__title-line tv-symbol-info-widget__title-line tv-symbol-info-widget__link" href="?" style={{ pointerEvents: 'none' }}>
              {logo && (
                <img className="tv-circle-logo tv-circle-logo--large tv-category-header__icon" src={logo} alt="" />
              )}
              <div className="tv-category-header__title">
                <div className="tv-symbol-header tv-symbol-header--mobile-adaptive">
                  <div>
                    <h1 className="tv-symbol-header__first-line tv-symbol-info-widget__first-line" style={{ display: 'inline' }}>{name}</h1>
                    {isin && (
                      <div className="tv-symbol-price-quote__supply">
                        <div className="tv-symbol-price-quote__currency">{isin}</div>
                      </div>
                    )}
                  </div>
                  {(symbol || (exchange || countryFlag)) && (
                    <span className="tv-symbol-header__second-line">
                      {symbol && (
                        <span className="tv-symbol-header__second-line--text">{symbol}</span>
                      )}
                      {(exchange || countryFlag) && (
                        <span className="tv-symbol-header__exchange-container">
                          {countryFlag && (
                            <img className="tv-circle-logo tv-circle-logo--medium tv-symbol-header__exchange-logo" src={countryFlag} alt="" style={{ marginTop: '-2px' }} />
                          )}
                          {!countryFlag && (
                            <span style={{ fontWeight: 'bold', marginRight: '0.5em' }}>@</span>
                          )}
                          {exchange && (
                            <span className="tv-symbol-header__exchange">{exchange}</span>
                          )}
                        </span>
                      )}
                    </span>
                  )}
                </div>
                <div className="tv-symbol-header tv-symbol-header--mobile-adaptive tv-symbol-header--mobile">
                  <div>
                    <div className="tv-symbol-header__first-line tv-symbol-info-widget__first-line" style={{ display: 'inline' }}>{symbol ?? name}</div>
                    {isin && (
                      <div className="tv-symbol-price-quote__supply">
                        <div className="tv-symbol-price-quote__currency">{isin}</div>
                      </div>
                    )}
                  </div>
                  {(symbol || (exchange || countryFlag)) && (
                    <span className="tv-symbol-header__second-line">
                      {symbol && (
                        <span className="tv-symbol-header__second-line--text">{name}</span>
                      )}
                      {(exchange || countryFlag) && (
                        <span className="tv-symbol-header__exchange-container">
                          {countryFlag && (
                            <img className="tv-circle-logo tv-circle-logo--medium tv-symbol-header__exchange-logo" src={countryFlag} alt="" style={{ marginTop: '-2px' }} />
                          )}
                          {!countryFlag && (
                            <span style={{ fontWeight: 'bold', marginRight: '0.5em' }}>@</span>
                          )}
                          {exchange && (
                            <span className="tv-symbol-header__exchange">{exchange}</span>
                          )}
                        </span>
                      )}
                    </span>
                  )}
                </div>
              </div>
            </a>
            <div className="tv-category-header__price-line">
              <div className="tv-category-header__main-price">
                <div className="tv-scroll-wrap tv-scroll-wrap--horizontal">
                  <div className="tv-category-header__main-price-content">
                    <div className="tv-symbol-price-quote">
                      {value && (
                        <div className="tv-symbol-price-quote__row">
                          {value && (
                            // <div className={`tv-symbol-price-quote__value tv-symbol-price-quote__value--${(value && previousValue && (value !== previousValue)) ? (value > previousValue ? 'growing' : 'falling') : ''}`}>
                            //   <span>{numberUnsignedFormat.format(value)}</span>
                            // </div>
                            <div className="tv-symbol-price-quote__value">
                              <span>{numberUnsignedFormat.format(value)}</span>
                            </div>
                          )}
                          {currency && (
                            <div className="tv-symbol-price-quote__supply">
                              {/* <div className="tv-symbol-price-quote__data-mode tv-data-mode tv-data-mode--size_large tv-data-mode--no-realtime tv-data-mode--delayed tv-data-mode--delayed--no-realtime" title="Quotes are delayed by 15 min">D</div> */}
                              <div className="tv-symbol-price-quote__currency">{currency}</div>
                            </div>
                          )}
                          {valueChange && (
                            <div className={`tv-symbol-price-quote__change tv-symbol-price-quote__change--${valueChange >= 0 ? 'growing' : 'falling'}`}>
                              <span className="tv-symbol-price-quote__change-value">{numberSignedFormat.format(valueChange)}</span>
                              <span className="tv-symbol-price-quote__change-value" style={{ marginLeft: '0.25em' }}>({numberSignedFormat.format(valueChangePercentage!)}%)</span>
                            </div>
                          )}
                        </div>
                      )}
                      {(open !== undefined) && (
                        <div className="tv-symbol-price-quote__sub-line">
                          <span className={`tv-symbol-price-quote__market-stat tv-symbol-price-quote__market-stat--${open ? 'open' : 'closed'}`}>Market {open ? 'Open' : 'Closed'}</span>
                          {openStatusSinceDateString && (
                            <span>(as of {openStatusSinceDateString})</span>
                          )}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>
              <div className="tv-category-header__rtc-price-group-fundamentals">
                <div className="tv-scroll-wrap tv-scroll-wrap--horizontal">
                  <div className="tv-category-header__rtc-price-group-fundamentals-content">
                    <div className="tv-symbol-price-quote tv-category-header__rtc-price i-hidden">
                      <div className="tv-symbol-price-quote__row tv-symbol-price-quote__row--small">
                        {value && (
                          <div className="tv-symbol-price-quote__value tv-symbol-price-quote__value--small">{numberUnsignedFormat.format(value)}</div>
                        )}
                        {valueChange && (
                          <div className={`tv-symbol-price-quote__change tv-symbol-price-quote__change--${valueChange >= 0 ? 'growing' : 'falling'}`}>
                            <span className="tv-symbol-price-quote__change-value">{numberSignedFormat.format(valueChange)}</span>
                            <span className="tv-symbol-price-quote__change-value" style={{ marginLeft: '0.25em' }}>({numberSignedFormat.format(valueChangePercentage!)}%)</span>
                          </div>
                        )}
                      </div>
                      {(open !== undefined) && (
                        <div className="tv-symbol-price-quote__sub-line">
                          <span className="tv-symbol-price-quote__market-stat" />
                          {openStatusSinceDateString && (
                            <span>(as of {openStatusSinceDateString})</span>
                          )}
                        </div>
                      )}
                    </div>
                    <div className="tv-category-header__fundamentals tv-category-header__fundamentals--price-group">
                      {meta?.filter(entry => !!entry.value).map(entry => {
                        const valueDiv = (
                          <div className={`tv-fundamental-block__value ${entry.highlighted ? 'tv-fundamental-block__value--highlighted' : ''} ${entry.upperCase ? 'tv-fundamental-block__value--sentence-cased' : ''}`}>{String(entry.value)}</div>
                        )
                        const keyDiv = (
                          <div className="tv-fundamental-block__title">{entry.key}</div>
                        )

                        return (
                          <div key={entry.key} className="tv-fundamental-block tv-category-header__fundamentals-block" title={entry.title} style={{ width: entry.width }}>
                            {entry.href && (
                              <A href={entry.href}>{valueDiv}</A>
                            )}
                            {!entry.href && (
                              valueDiv
                            )}
                            {keyDiv}
                          </div>
                        )
                      })}
                    </div>
                  </div>
                </div>
              </div>
              <div className="tv-category-header__fundamentals">
                {meta?.filter(entry => !!entry.value).map(entry => {
                  const valueDiv = (
                    <div className={`tv-fundamental-block__value ${entry.highlighted ? 'tv-fundamental-block__value--highlighted' : ''} ${entry.upperCase ? 'tv-fundamental-block__value--sentence-cased' : ''}`}>{String(entry.value)}</div>
                  )
                  const keyDiv = (
                    <div className="tv-fundamental-block__title">{entry.key}</div>
                  )

                  return (
                    <div key={entry.key} className="tv-fundamental-block tv-category-header__fundamentals-block" style={{ width: entry.width }}>
                      {entry.href && (
                        <A href={entry.href}>{valueDiv}</A>
                      )}
                      {!entry.href && (
                        valueDiv
                      )}
                      {keyDiv}
                    </div>
                  )
                })}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default React.memo(SymbolInfo)
