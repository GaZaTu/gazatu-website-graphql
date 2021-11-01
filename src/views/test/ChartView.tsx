import { faBookmark, faCompress, faExpand, faSearch } from '@fortawesome/free-solid-svg-icons'
import { BarData, ColorType, createChart, IChartApi, IPriceLine, LineStyle } from 'lightweight-charts'
import React, { useContext, useEffect, useLayoutEffect, useMemo, useRef, useState } from 'react'
import Button from '../../lib/bulma/Button'
import Column from '../../lib/bulma/Column'
import Container from '../../lib/bulma/Container'
import Content from '../../lib/bulma/Content'
import Divider from '../../lib/bulma/Divider'
import Icon from '../../lib/bulma/Icon'
import Level from '../../lib/bulma/Level'
import Modal from '../../lib/bulma/Modal'
import Notification from '../../lib/bulma/Notification'
import Section from '../../lib/bulma/Section'
import Tag from '../../lib/bulma/Tag'
import { Div, H1, Span } from '../../lib/bulma/Text'
import { Subscription, TraderepublicAggregateHistoryLightData, TraderepublicAggregateHistoryLightSub, TraderepublicHomeInstrumentExchangeData, TraderepublicInstrumentData, TraderepublicStockDetailsData, TraderepublicWebsocket } from '../../lib/traderepublic'
import useStoredState from '../../lib/useStoredState'
import useURLSearchParamsState from '../../lib/useURLSearchParamsState'
import './ChartView.css'
import SymbolInfo from './SymbolInfo'
import SymbolSearch from './SymbolSearch'
import WatchList from './WatchList'

const dateFormat = new Intl.DateTimeFormat(undefined, {
  year: '2-digit',
  month: '2-digit',
  day: '2-digit',
})

const currencyFormat = new Intl.NumberFormat(undefined, {
  style: 'currency',
  currency: 'EUR',
})

const numberCompactFormat = new Intl.NumberFormat(undefined, {
  minimumFractionDigits: 2,
  maximumFractionDigits: 2,
  notation: 'compact',
})

type SymbolSearchModalProps = {
  socket: TraderepublicWebsocket
  initialSearch?: string
  initialFilter?: 'stock' | 'fund' | 'derivative' | 'crypto'
  resolve: (isin: string) => void
  reject: () => void
}

const SymbolSearchModal: React.FC<SymbolSearchModalProps> = props => {
  const {
    socket,
    initialSearch,
    initialFilter,
    resolve,
    reject,
  } = props

  const [search, setSearch] = useState(initialSearch ?? '')
  const [filter, setFilter] = useState(initialFilter ?? 'stock')

  const [loading, setLoading] = useState(false)
  const [symbols, setSymbols] = useState<React.ComponentProps<typeof SymbolSearch>['symbols']>()

  useEffect(() => {
    const effect = {
      cancelled: false,
    }

    setLoading(true)

    ; (async () => {
      const results = await socket.search(search, filter, 10)
      const symbols = await Promise.all(
        results.map(async ({ isin, type }) => {
          const instrument = await socket.instrument(isin).toPromise()
          // const exchange = await socket.exchange(instrument).toPromise()
          const details = await socket.details(instrument)

          return {
            isin,
            symbol: instrument?.intlSymbol || instrument?.homeSymbol,
            description: details?.company.name ?? instrument?.shortName,
            type,
          }
        })
      )

      if (effect.cancelled) {
        return
      }

      setSymbols(symbols)
      setLoading(false)
    })()

    return () => {
      effect.cancelled = true

      setSymbols([])
      setLoading(false)
    }
  }, [socket, search, filter])

  return (
    <Modal.Body head="Symbol-Search" onClose={reject}>
      <SymbolSearch
        search={search}
        onSearchChange={setSearch}
        filters={[
          {
            id: 'stock',
            name: 'Stocks',
            active: filter === 'stock',
          },
          {
            id: 'fund',
            name: 'Funds',
            active: filter === 'fund',
          },
          {
            id: 'derivative',
            name: 'Derivatives',
            active: filter === 'derivative',
          },
          {
            id: 'crypto',
            name: 'Crypto',
            active: filter === 'crypto',
          },
        ]}
        onFilterChange={filter => setFilter(filter.id as any)}
        symbols={symbols}
        onSymbolClick={symbol => resolve(symbol.isin!)}
        loading={loading}
      />
    </Modal.Body>
  )
}

const ChartView: React.FC = props => {
  const [search, setSearch] = useURLSearchParamsState({
    isin: '',
  })

  const {
    pushError,
  } = useContext(Notification.Portal)

  const [fullscreen, setFullscreen] = useState(false)

  const [timeRange, setTimeRange] = useStoredState('CHART_TIME_RANGE', '1d' as '30s' | '60s' | TraderepublicAggregateHistoryLightSub['range'])

  const [instrument, setInstrument] = useState<TraderepublicInstrumentData>()
  const [exchange, setExchange] = useState<TraderepublicHomeInstrumentExchangeData>()
  const [details, setDetails] = useState<TraderepublicStockDetailsData>()
  const [value, setValue] = useState({
    current: 0,
    previous: 0,
  })

  const intradayHistory = useRef({
    30: {} as { [isin: string]: TraderepublicAggregateHistoryLightData['aggregates'] | undefined },
    60: {} as { [isin: string]: TraderepublicAggregateHistoryLightData['aggregates'] | undefined },
  })

  const socket = useMemo(() => new TraderepublicWebsocket('DE'), [])
  useEffect(() => {
    ; (async () => {
      try {
        await socket.connect()
      } catch (error) {
        pushError(error)
      }
    })()

    return () => {
      socket.close()
    }
  }, [socket, pushError])

  const [watchList, setWatchList] = useStoredState('CHART_WATCH_LIST', [] as string[])

  type WatchedInstrument = {
    isin: string
    data: typeof instrument
    exchange: typeof exchange
    details: typeof details
    value: typeof value
  }

  const [watchedInstruments, setWatchedInstruments] = useState([] as WatchedInstrument[])
  useLayoutEffect(() => {
    const effect = {
      cancelled: false,
      subscriptions: [] as Subscription[],
    }

    for (const [key, history] of Object.entries(intradayHistory.current)) {
      (intradayHistory.current as any)[key] = watchList
        .reduce((o, isin) => { o[isin] = history[isin] ?? []; return o; }, {} as { [key: string]: any })
    }

    ; (async () => {
      setWatchedInstruments(r => {
        return watchList.map(isin => {
          const current = r.find(i => i.isin === isin)

          return {
            isin,
            data: undefined,
            exchange: undefined,
            details: undefined,
            value: {
              current: 0,
              previous: 0,
            },
            history: [],
            ...current,
          }
        })
      })

      for (const isin of watchList) {
        const instrument = await socket.instrument(isin).toPromise()
        const exchange = await socket.exchange(instrument).toPromise()
        const details = await socket.details(instrument)

        if (effect.cancelled) {
          return
        }

        setWatchedInstruments(r => r.map(i => {
          if (i.isin !== isin) {
            return i
          }

          return {
            ...i,
            data: instrument,
            exchange,
            details,
          }
        }))

        effect.subscriptions.push(
          socket.ticker(instrument).subscribe(data => {
            if (effect.cancelled) {
              return
            }

            setWatchedInstruments(r => r.map(i => {
              if (i.isin !== isin) {
                return i
              }

              for (const [key, history] of Object.entries(intradayHistory.current)) {
                const barTimeToLive = Number(key)
                const currentHistory = history[i.isin]
                if (!currentHistory) {
                  continue
                }

                const currentBar = currentHistory[currentHistory.length - 1]

                if ((data.bid.time - (currentBar?.time ?? 0)) >= (barTimeToLive * 1000)) {
                  if (currentBar) {
                    currentHistory[currentHistory.length - 1] = {
                      ...currentBar,
                      close: data.last.price,
                    }
                  }

                  currentHistory.push({
                    time: data.bid.time,
                    open: data.bid.price,
                    high: data.bid.price,
                    low: data.bid.price,
                    close: data.bid.price,
                    volume: 0,
                    adjValue: 0,
                  })
                } else {
                  currentHistory[currentHistory.length - 1] = {
                    ...currentBar,
                    close: data.bid.price,
                    low: Math.min(currentBar.low, data.bid.price),
                    high: Math.max(currentBar.high, data.bid.price),
                  }
                }
              }

              return {
                ...i,
                value: {
                  current: data.bid.price,
                  previous: data.pre.price,
                },
              }
            }))
          })
        )
      }
    })()

    return () => {
      effect.cancelled = true
      effect.subscriptions.forEach(s => s.unsubscribe())
    }
  }, [socket, watchList, timeRange])

  const chartContainer = useRef<HTMLDivElement | null>(null)
  const chart = useRef<IChartApi | null>(null)

  useLayoutEffect(() => {
    const CHART_HEIGHT_DEFAULT = 450
    const CHART_HEIGHT_FULLSCREEN = window.innerHeight - 333

    const effect = {
      cancelled: false,
      subscriptions: [] as Subscription[],
    }

    if (!chart.current) {
      chart.current = createChart(chartContainer.current!, {
        height: CHART_HEIGHT_DEFAULT,
        layout: {
          background: {
            type: ColorType.Solid,
            color: '#1E222D',
          },
          textColor: '#D9D9D9',
          fontSize: 14,
        },
        crosshair: {
          horzLine: {
            color: '#758696',
          },
          vertLine: {
            color: '#758696',
          },
        },
        grid: {
          horzLines: {
            color: '#363C4E',
          },
          vertLines: {
            color: '#2B2B43',
          },
        },
        timeScale: {
          // borderVisible: false,
          timeVisible: true,
          secondsVisible: false,
        },
        rightPriceScale: {
          // borderVisible: false,
          // mode: PriceScaleMode.Percentage,
        },
        localization: {
          priceFormatter: (price: number) => currencyFormat.format(price),
          // timeFormatter: (time: number) => timeFormat.format(new Date(time * 1000)),
        },
      })
    } else {
      const { height } = chart.current.options()
      const newHeight = (() => {
        if (fullscreen && height === CHART_HEIGHT_DEFAULT) {
          return CHART_HEIGHT_FULLSCREEN
        }

        if (!fullscreen && height === CHART_HEIGHT_FULLSCREEN) {
          return CHART_HEIGHT_DEFAULT
        }

        return undefined
      })()

      if (newHeight) {
        const containerWidth = chartContainer.current?.clientWidth ?? 0

        chart.current?.applyOptions({ height: newHeight })
        chart.current?.resize(containerWidth, newHeight)
      }
    }

    const series = chart.current.addCandlestickSeries({
    })

    let currentBar = { time: 0 } as BarData
    let previousClose: IPriceLine | undefined

    ; (async () => {
      if (search.isin.length !== 12) {
        return
      }

      const instrument = await new Promise<TraderepublicInstrumentData>((resolve, reject) => (
        socket.instrument(search.isin).subscribe(instrument => {
          if (effect.cancelled) {
            reject()
            return
          }

          setInstrument(instrument)
          resolve(instrument)
        })
      ))
      if (!instrument) {
        return
      }

      socket.exchange(instrument).subscribe(exchange => {
        if (effect.cancelled) {
          return
        }

        setExchange(exchange)
      })

      socket.details(instrument).then(details => {
        if (effect.cancelled) {
          return
        }

        setDetails(details)
      })

      const timezoneOffset = (new Date().getTimezoneOffset() / 60) * -1
      const mapUnixToUTC = (time: number) =>
        Math.floor(time / 1000) + (60 * 60 * timezoneOffset) as any

      let barTimeToLive = 10 * 60

      if (timeRange !== '30s' && timeRange !== '60s') {
        const history = await socket.aggregateHistory(instrument, timeRange)

        if (effect.cancelled) {
          return
        }

        for (const aggregate of history.aggregates) {
          let utcTimestamp = mapUnixToUTC(aggregate.time)

          currentBar = {
            time: utcTimestamp,
            open: aggregate.open,
            close: aggregate.close,
            low: aggregate.low,
            high: aggregate.high,
          }

          series.update(currentBar)
        }

        if (history.aggregates.length >= 2) {
          const [{ time: time0 }, { time: time1 }] = history.aggregates
          const difference = (time1 - time0) / 1000

          barTimeToLive = difference
        }
      } else {
        if (timeRange === '30s') {
          barTimeToLive = 30 as const
        } else if (timeRange === '60s') {
          barTimeToLive = 60 as const
        }

        const history = intradayHistory.current[barTimeToLive as 30 | 60]
        const currentHistory = history[instrument.isin] ?? []

        for (const aggregate of currentHistory) {
          let utcTimestamp = mapUnixToUTC(aggregate.time)

          currentBar = {
            time: utcTimestamp,
            open: aggregate.open,
            close: aggregate.close,
            low: aggregate.low,
            high: aggregate.high,
          }

          series.update(currentBar)
        }
      }

      chart.current?.timeScale().fitContent()

      effect.subscriptions.push(
        socket.ticker(instrument).subscribe(data => {
          if (effect.cancelled) {
            return
          }

          let utcTimestamp = mapUnixToUTC(data.bid.time)

          if (!previousClose) {
            previousClose = series.createPriceLine({
              price: data.pre.price,
              color: 'gray',
              lineWidth: 1,
              lineStyle: LineStyle.Dotted,
              axisLabelVisible: false,
              title: 'previous close',
            })

            setValue(v => ({
              ...v,
              previous: data.pre.price,
            }))
          }

          if ((utcTimestamp - (currentBar.time as any)) >= barTimeToLive) {
            currentBar = {
              ...currentBar,
              close: data.last.price,
            }

            series.update({
              ...currentBar,
            })

            currentBar = {
              time: utcTimestamp,
              open: data.bid.price,
              close: data.bid.price,
              low: data.bid.price,
              high: data.bid.price,
            }
          } else {
            currentBar = {
              ...currentBar,
              close: data.bid.price,
              low: Math.min(currentBar.low, data.bid.price),
              high: Math.max(currentBar.high, data.bid.price),
            }
          }

          setValue(v => ({
            ...v,
            current: currentBar.close,
          }))

          series.update({
            ...currentBar,
          })
        })
      )
    })()

    return () => {
      chart.current?.removeSeries(series)

      setInstrument(undefined)
      setExchange(undefined)
      setDetails(undefined)
      setValue({
        current: 0,
        previous: 0,
      })

      effect.cancelled = true
      effect.subscriptions.forEach(s => s.unsubscribe())
    }
  }, [socket, search.isin, timeRange, fullscreen])

  const { showModal } = useContext(Modal.Portal)
  const handleSearch = useMemo(() => {
    return async () => {
      const [modal, resolve, reject] = showModal<string>(
        <SymbolSearchModal socket={socket} resolve={isin => resolve(isin)} reject={() => reject()} />
      )

      const isin = await modal
      if (!isin) {
        return
      }

      setSearch(search => ({
        ...search,
        isin,
      }))
    }
  }, [socket, setSearch, showModal])

  const toggleInstrumentInWatchList = useMemo(() => {
    return () =>
      setWatchList(l => {
        if (!instrument) {
          return l
        }

        if (l.includes(instrument.isin)) {
          return l.filter(isin => isin !== instrument.isin)
        } else {
          return [instrument.isin, ...l]
        }
      })
  }, [setWatchList, instrument])

  // const manageInstrumentNotifications = useMemo(() => {
  //   return async () => {
  //     const permission = await Notification.requestPermission()
  //     if (permission !== 'granted') {
  //       return
  //     }
  //   }
  // }, [])

  const toggleFullscreen = useMemo(() => {
    return () =>
      setFullscreen(f => !f)
  }, [])

  return (
    <Section>
      <Container>
        <H1 kind="title" caps>Trading-Chart</H1>

        <Content style={{ background: '#1e222d' }} fullscreen={fullscreen}>
          <Div className="is-unpadded" style={{ boxShadow: '-10px 0px 13px -7px #161616, 10px 0px 13px -7px #161616, 5px 5px 15px 5px rgb(0 0 0 / 0%)' }}>
            <Column.Row gapless>
              <Column width={3 / 4} style={{ background: '#1e222d' }}>
                <Div style={{ background: '#1e222d' }}>
                  <Level style={{ padding: '1rem 1rem 0.25rem 1rem' }} mobile>
                    <Level.Left>
                      <Button onClick={handleSearch}>
                        <Icon icon={faSearch} />
                        <Span>Search Symbol...</Span>
                      </Button>
                    </Level.Left>
                    <Level.Right>
                      <Level.Item>
                        <Button onClick={toggleFullscreen}>
                          <Icon icon={fullscreen ? faCompress : faExpand} />
                        </Button>
                      </Level.Item>
                      {/* <Level.Item>
                        <Button onClick={manageInstrumentNotifications} disabled={!instrument}>
                          <Icon icon={faBell} />
                        </Button>
                      </Level.Item> */}
                      <Level.Item>
                        <Button onClick={toggleInstrumentInWatchList} disabled={!instrument}>
                          <Icon icon={faBookmark} color={watchList.includes(instrument?.isin ?? '') ? 'danger' : undefined} />
                        </Button>
                      </Level.Item>
                    </Level.Right>
                  </Level>
                </Div>

                <SymbolInfo
                  style={{ height: 'unset' }}
                  name={details?.company.name ?? instrument?.shortName}
                  isin={instrument?.isin}
                  symbol={instrument?.intlSymbol || instrument?.homeSymbol}
                  countryFlag={instrument?.tags.find(tag => tag.type === 'country')?.icon}
                  exchange={exchange?.exchangeId}
                  value={value.current}
                  currency={exchange?.currency.id}
                  valueAtPreviousClose={value.previous}
                  open={exchange?.open}
                  meta={[
                    {
                      key: 'MARKET CAP',
                      value: details && numberCompactFormat.format(details.company.marketCapSnapshot),
                    },
                    {
                      key: 'P/E',
                      value: details && numberCompactFormat.format(details.company.peRatioSnapshot),
                    },
                    {
                      key: 'UNDERLYING',
                      value: instrument?.derivativeInfo && instrument?.derivativeInfo.underlying.shortName,
                      href: `/test/chart?q=${instrument?.derivativeInfo?.underlying.isin}`,
                    },
                    {
                      key: 'TYPE',
                      value: instrument?.derivativeInfo && instrument?.derivativeInfo.properties.optionType,
                      upperCase: true,
                    },
                    {
                      key: 'LEVERAGE',
                      value: instrument?.derivativeInfo && instrument?.derivativeInfo.properties.leverage.toFixed(0),
                    },
                    {
                      key: 'RATIO',
                      value: instrument?.derivativeInfo && instrument?.derivativeInfo.properties.size.toFixed(2),
                    },
                    {
                      key: 'EXPIRY',
                      value: instrument?.derivativeInfo && (instrument?.derivativeInfo.properties.lastTradingDay ? dateFormat.format(new Date(instrument?.derivativeInfo.properties.lastTradingDay)) : 'Open End'),
                      upperCase: true,
                    },
                  ]}
                  dark
                />

                <div ref={chartContainer} />

                <Div style={{ background: '#1e222d', padding: '0.5rem' }}>
                  {(() => {
                    const tag = (t: typeof timeRange) => ({
                      as: 'a',
                      onClick: () => setTimeRange(t),
                      style: {
                        background: timeRange === t ? '#3179f52e' : undefined,
                      },
                      children: t,
                    } as const)

                    return (
                      <Column.Row>
                        <Column narrow>
                          <Tag.Group>
                            <Tag {...tag('30s')} />
                            <Tag {...tag('60s')} />
                          </Tag.Group>
                        </Column>

                        <Divider vertical className="is-hidden-mobile" style={{ padding: '1rem' }} />

                        <Column narrow>
                          <Tag.Group>
                            <Tag {...tag('1d')} />
                            <Tag {...tag('5d')} />
                            <Tag {...tag('1m')} />
                            <Tag {...tag('3m')} />
                            <Tag {...tag('1y')} />
                            <Tag {...tag('max')} />
                          </Tag.Group>
                        </Column>
                      </Column.Row>
                    )
                  })()}
                </Div>
              </Column>

              <Column width={1 / 4}>
                <WatchList dark>
                  {watchedInstruments.map(i => (
                    <WatchList.Ticker
                      key={i.isin}
                      isin={i.isin}
                      href={`?isin=${i.isin}`}
                      symbol={i.data?.intlSymbol || i.data?.homeSymbol || i.isin}
                      name={i.details?.company.name ?? i.data?.shortName}
                      open={i.exchange?.open}
                      value={i.value.current}
                      valueAtPreviousClose={i.value.previous}
                      highlighted={i.isin === instrument?.isin}
                    />
                  ))}
                </WatchList>
              </Column>
            </Column.Row>
          </Div>
        </Content>
      </Container>
    </Section>
  )
}

export default React.memo(ChartView)
