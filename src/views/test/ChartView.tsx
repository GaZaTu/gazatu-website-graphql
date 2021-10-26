import { faSearch } from '@fortawesome/free-solid-svg-icons'
import { BarData, ColorType, createChart, IChartApi, IPriceLine, LineStyle } from 'lightweight-charts'
import React, { useContext, useEffect, useLayoutEffect, useRef, useState } from 'react'
import Button from '../../lib/bulma/Button'
import Column from '../../lib/bulma/Column'
import Container from '../../lib/bulma/Container'
import Content from '../../lib/bulma/Content'
import Icon from '../../lib/bulma/Icon'
import Modal from '../../lib/bulma/Modal'
import Section from '../../lib/bulma/Section'
import Tag from '../../lib/bulma/Tag'
import { Div, H1, Span } from '../../lib/bulma/Text'
import { Subscription, TraderepublicHomeInstrumentExchangeData, TraderepublicInstrumentData, TraderepublicStockDetailsData, TraderepublicWebsocket } from '../../lib/traderepublic'
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

const socket = new TraderepublicWebsocket('DE')

type SymbolSearchModalProps = {
  initialSearch?: string
  initialFilter?: 'stock' | 'fund' | 'derivative' | 'crypto'
  resolve: (isin: string) => void
  reject: () => void
}

const SymbolSearchModal: React.FC<SymbolSearchModalProps> = props => {
  const {
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
  }, [search, filter])

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

  const [timeRange, setTimeRange] = useStoredState('CHART_TIME_RANGE', '1d' as '1d' | '5d' | '1m' | '1y')

  const [instrument, setInstrument] = useState<TraderepublicInstrumentData>()
  const [exchange, setExchange] = useState<TraderepublicHomeInstrumentExchangeData>()
  const [details, setDetails] = useState<TraderepublicStockDetailsData>()
  const [value, setValue] = useState({
    current: 0,
    previous: 0,
  })

  const [recentISINs, setRecentISINs] = useStoredState('CHART_MRU', [] as { isin: string, rank: number }[])
  useEffect(() => {
    if (!instrument?.isin) {
      return
    }

    const MRU_SIZE = 10

    setRecentISINs(recentISINs => {
      const current = recentISINs
        .find(({ isin }) => isin === instrument.isin)

      if (current?.rank === MRU_SIZE) {
        return recentISINs
      }

      let highestRank = 0
      let lowestRank = 0
      for (const { rank } of recentISINs) {
        highestRank = Math.max(highestRank, rank)
        lowestRank = Math.min(lowestRank, rank)
      }

      recentISINs = recentISINs
        .map(({ isin, rank }) => ({
          isin,
          rank: isin === instrument.isin ? highestRank + 1 : rank - 1,
        }))

      if (recentISINs.length >= MRU_SIZE) {
        const isinToRemoveIdx = recentISINs
          .findIndex(({ rank }) => rank === lowestRank)

        recentISINs.splice(isinToRemoveIdx, 1)
      }

      if (!current) {
        recentISINs.unshift({
          isin: instrument.isin,
          rank: MRU_SIZE,
        })
      }

      return recentISINs
    })
  }, [instrument?.isin, setRecentISINs])

  const [recentInstruments, setRecentInstruments] = useState([] as { isin: string, data: typeof instrument, exchange: typeof exchange, details: typeof details, value: typeof value }[])
  useLayoutEffect(() => {
    const effect = {
      cancelled: false,
      subscriptions: [] as Subscription[],
    }

    ; (async () => {
      setRecentInstruments(r => {
        return recentISINs.map(({ isin }) => {
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
            ...current,
          }
        })
      })

      for (const { isin } of recentISINs) {
        const instrument = await socket.instrument(isin).toPromise()
        const exchange = await socket.exchange(instrument).toPromise()
        const details = await socket.details(instrument)

        if (effect.cancelled) {
          return
        }

        setRecentInstruments(r => r.map(i => {
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

            setRecentInstruments(r => r.map(i => {
              if (i.isin !== isin) {
                return i
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
  }, [recentISINs])

  // const currencyFormat = useMemo(() => {
  //   return new Intl.NumberFormat(undefined, {
  //     style: exchange?.currency?.id && 'currency',
  //     currency: exchange?.currency?.id,
  //   })
  // }, [exchange?.currency?.id])

  const chartContainer = useRef<HTMLDivElement | null>(null)
  const chart = useRef<IChartApi | null>(null)

  useLayoutEffect(() => {
    const effect = {
      cancelled: false,
      subscriptions: [] as Subscription[],
    }

    if (!chart.current) {
      chart.current = createChart(chartContainer.current!, {
        // width: 600,
        height: 450,
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

      const barTimeToLive = (() => {
        if (history.aggregates.length < 2) {
          return 10 * 60 // 10 minutes
        }

        const [{ time: time0 }, { time: time1 }] = history.aggregates
        const difference = (time1 - time0) / 1000

        return difference
      })()

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
  }, [search.isin, timeRange])

  const { showModal } = useContext(Modal.Portal)
  const handleSearch = async () => {
    const [modal, resolve, reject] = showModal<string>(
      <SymbolSearchModal resolve={isin => resolve(isin)} reject={() => reject()} />
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

  return (
    <Section>
      <Container>
        <H1 kind="title">Trading-Chart</H1>

        <Content>


          <Div className="is-unpadded">
            <Column.Row gapless>
              <Column width={3 / 4}>
                <Div style={{ background: '#1e222d', padding: '1rem 0 0 1rem' }}>
                  <Button onClick={handleSearch}>
                    <Icon icon={faSearch} />
                    <Span>Search Symbol...</Span>
                  </Button>
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
                  <Tag.Group>
                    <Tag as="a" onClick={() => setTimeRange('1d')} style={{ background: timeRange === '1d' ? '#3179f52e' : undefined }}>1d</Tag>
                    <Tag as="a" onClick={() => setTimeRange('5d')} style={{ background: timeRange === '5d' ? '#3179f52e' : undefined }}>5d</Tag>
                    <Tag as="a" onClick={() => setTimeRange('1m')} style={{ background: timeRange === '1m' ? '#3179f52e' : undefined }}>1m</Tag>
                    <Tag as="a" onClick={() => setTimeRange('1y')} style={{ background: timeRange === '1y' ? '#3179f52e' : undefined }}>1y</Tag>
                  </Tag.Group>
                </Div>
              </Column>

              <Column>
                <WatchList dark>
                  {recentInstruments.map(i => (
                    <WatchList.Ticker
                      key={i.isin}
                      isin={i.isin}
                      href={`?isin=${i.data?.isin}`}
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
