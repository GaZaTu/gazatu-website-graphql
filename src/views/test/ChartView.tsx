import { BarData, ColorType, createChart, IPriceLine, LineStyle } from 'lightweight-charts'
import React, { useLayoutEffect, useRef, useState } from 'react'
import Container from '../../lib/bulma/Container'
import Content from '../../lib/bulma/Content'
import Input from '../../lib/bulma/Input'
import Section from '../../lib/bulma/Section'
import { H1 } from '../../lib/bulma/Text'
import { TraderepublicHomeInstrumentExchangeData, TraderepublicInstrumentData, TraderepublicStockDetailsData, TraderepublicWebsocket } from '../../lib/traderepublic'
import useStoredState from '../../lib/useStoredState'
import { useDebounce } from 'use-debounce'
import './ChartView.css'
import SymbolInfo from './SymbolInfo'

const currencyFormat = new Intl.NumberFormat(undefined, {
  style: 'currency',
  currency: 'EUR',
})

const numberCompactFormat = new Intl.NumberFormat(undefined, {
  minimumFractionDigits: 2,
  maximumFractionDigits: 2,
  notation: 'compact',
})

const ChartView: React.FC = props => {
  const [search, setSearch] = useStoredState('CHART_SEARCH', '')
  const [searchDebounced] = useDebounce(search, 500)

  const [instrument, setInstrument] = useState<TraderepublicInstrumentData>()
  const [exchange, setExchange] = useState<TraderepublicHomeInstrumentExchangeData>()
  const [details, setDetails] = useState<TraderepublicStockDetailsData>()
  const [value, setValue] = useState({
    current: 0,
    previous: 0,
  })

  // const currencyFormat = useMemo(() => {
  //   return new Intl.NumberFormat(undefined, {
  //     style: exchange?.currency?.id && 'currency',
  //     currency: exchange?.currency?.id,
  //   })
  // }, [exchange?.currency?.id])

  const container = useRef<HTMLDivElement | null>(null)

  useLayoutEffect(() => {
    const chart = createChart(container.current!, {
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

    const series = chart.addCandlestickSeries({
    })

    let currentBar = { time: 0 } as BarData
    let previousClose: IPriceLine | undefined

    const socket = new TraderepublicWebsocket('DE')

    ; (async () => {
      if (searchDebounced.length < 2) {
        return
      }

      let isin = searchDebounced
      if (isin.length !== 12) {
        const searchResult = await socket.search(isin.trim())
        if (searchResult.length === 0) {
          return
        }

        isin = searchResult[0].isin
      }

      const instrument = await socket.instrument(isin.trim())
      if (!instrument) {
        return
      }

      setInstrument(instrument)

      socket.exchange(instrument).subscribe(exchange => {
        setExchange(exchange)
      })

      socket.details(instrument).then(details => {
        setDetails(details)
      })

      const timezoneOffset = (new Date().getTimezoneOffset() / 60) * -1
      const mapUnixToUTC = (time: number) =>
        Math.floor(time / 1000) + (60 * 60 * timezoneOffset) as any

      const history = await socket.aggregateHistory(instrument, '1d')
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

      socket.ticker(instrument).subscribe(data => {
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

        if ((utcTimestamp - (currentBar.time as any)) >= (60 * 10)) {
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
    })()

    return () => {
      socket.close()
      chart.remove()

      setInstrument(undefined)
      setExchange(undefined)
      setDetails(undefined)
      setValue({
        current: 0,
        previous: 0,
      })
    }
  }, [searchDebounced])

  return (
    <Section>
      <Container>
        <H1 kind="title">Trading-Chart</H1>

        <Content>
          <Input value={search} onValueChange={setSearch} style={{ width: 'unset' }} />

          <div className="is-unpadded">
            <SymbolInfo
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
              ]}
              dark
            />
          </div>

          <div className="is-unpadded" style={{ position: 'relative' }}>
            <div ref={container} />
            <div className="legend">
              <div>{instrument?.shortName}</div>
            </div>
          </div>
        </Content>
      </Container>
    </Section>
  )
}

export default React.memo(ChartView)
