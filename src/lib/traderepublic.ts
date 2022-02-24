export interface Subscription {
  unsubscribe(): void
}

export interface Observable<T> {
  subscribe(onValue: (value: T) => unknown, onError?: (error: unknown) => unknown): Subscription

  toPromise(): Promise<T>
}

export type TraderepublicInstrumentSub = {
  type: 'instrument'
  id: string
  jurisdiction: string
}

export type TraderepublicInstrumentData = {
  active: boolean
  exchangeIds: string[]
  exchanges: {
    slug: string
    active: boolean
    nameAtExchange: string
    symbolAtExchange: string
    firstSeen: number
    lastSeen: number
    firstTradingDay: number | null
    tradingTimes: unknown
    fractionalTrading: unknown
  }[]
  jurisdictions: {
    [key: string]: {
      active: boolean
      kidLink: string
      kidRequired: boolean
      savable: boolean
      fractionalTradingAllowed: boolean
    }
  }
  dividends: unknown[]
  splits: unknown[]
  cfi: string
  name: string
  typeId: string
  wkn: string
  legacyTypeChar: string
  isin: string
  priceFactory: number
  shortName: string
  homeSymbol: string
  intlSymbol: string
  homeNsin: string
  tags: {
    type: string
    id: string
    name: string
    icon: string
  }[]
  derivativeProductCount: unknown
  derivativeProductCategories: unknown[]
  company: {
    name: string
    description: string | null
    ipoDate: number | null
    countryOfOrigin: string | null
  }
  marketCap: {
    value: string | null
    currencyId: string | null
  }
  lastDividend: number | null
  shareType: string | null
  custodyType: string | null
  kidRequired: boolean
  kidLink: string
  tradable: boolean
  fundInfo: {
    ter: string
    underlyingClass: string
    currency: string | null
    market: string | null
    method: string | null
    useOfProfits: string
    index: string | null
    ucits: boolean
    legalFormType: string
    domicile: string
    launchDate: string
    useOfProfitsDisplayName: string
  } | null
  derivativeInfo: {
    categoryType: string
    productCategoryName: string
    productGroupType: string
    knocked: boolean
    issuerCountry: string
    emissionDate: string
    underlying: {
      name: string
      shortName: string
      isin: string
      available: boolean
    }
    properties: {
      strike: number
      barrier: number | null
      cap: null
      factor: null
      currency: string
      size: number | null
      expiry: number | null
      maturity: number | null
      exerciseType: string
      settlementType: string
      optionType: string
      quoteType: string
      firstTradingDay: string
      lastTradingDay: string | null
      delta: number | null
      leverage: number | null
    }
    mifid: {
      entryCost: number
      exitCost: number
      ongoingCostsExpected: number
      ongoingCostsAccumulated: number
      costNotation: string
    }
  } | null
  targetMarket: {
    investorType: string
    investorExperience: string
  }
  savable: boolean
  fractionalTradingAllowed: boolean
  issuer: string
  issuerDisplayName: string
  notionalCurrency: string
  additionalBuyWarning: string | null
  warningMessage: string | null
  noTradeVolume: boolean
  additionalBuyWarnings: {
    [lang: string]: string
  }
  warningMessages: {
    [lang: string]: string
  }
}

export type TraderepublicStockDetailsSub = {
  type: 'stockDetails'
  id: string
  jurisdiction: string
}
export type TraderepublicStockDetailsData = {
  isin: string
  company: {
    name: string
    description: string
    yearFounded: number
    tickerSymbol: string
    peRatioSnapshot: number
    pbRatioSnapshot: number
    dividendYieldSnapshot: number
    earningsCall: unknown
    marketCapSnapshot: number
    dailyCloseYearSD: unknown
    beta: number
    countryCode: string
    ceoName: string
    cfoName: string
    cooName: string
    employeeCount: number
  }
  similarStocks: unknown[]
  expectedDividend: unknown
  dividends: unknown[]
  totalDivendendCount: number
  events: unknown[]
  analystRating: unknown
  hasKpis: boolean
}

export type TraderepublicHomeInstrumentExchangeSub = {
  type: 'homeInstrumentExchange'
  id: string
}

export type TraderepublicHomeInstrumentExchangeData = {
  exchangeId: string
  exchange: {
    id: string
    name: string
    timeZoneId: string
  }
  currency: {
    id: string
    name: string
  }
  orderModes: string[]
  orderExpiries: string[]
  open: boolean
  priceSteps: unknown[]
  openTimeOffsetMillis: number
  closeTimeOffsetMillis: number
  maintenanceWindow: unknown
}

export type TraderepublicTickerSub = {
  type: 'ticker'
  id: string
  exchange: string
}

export type TraderepublicTickerPrice = {
  time: number
  price: number
  size: number
}

export type TraderepublicTickerData = {
  bid: TraderepublicTickerPrice
  ask: TraderepublicTickerPrice
  last: TraderepublicTickerPrice
  pre: TraderepublicTickerPrice
  open: TraderepublicTickerPrice
  qualityId: 'realtime'
  leverage: unknown
  delta: unknown
}

export type TraderepublicAggregateHistoryLightSub = {
  type: 'aggregateHistoryLight'
  id: string
  exchange: string
  range: '1d' | '5d' | '1m' | '3m' | '1y' | 'max'
}

export type TraderepublicAggregateHistoryLightData = {
  expectedClosingTime: number
  aggregates: {
    time: number
    open: number
    high: number
    low: number
    close: number
    volume: 0
    adjValue: number
  }[]
  resolution: number
  lastAggregateEndTime: number
}

export type TraderepublicNeonSearchSub = {
  type: 'neonSearch'
  data: {
    q: string
    page: number
    pageSize: number
    filter: ({
      key: 'type'
      value: 'stock' | 'fund' | 'derivative' | 'crypto'
    } | {
      key: 'jurisdiction'
      value: string
    })[]
  }
}

export type TraderepublicNeonSearchData = {
  results: {
    isin: string
    name: string
    tags: {
      type: string
      id: string
      name: string
    }[]
    type: string
    subtitle: string | null
    derivativeProductCategories: string[]
  }[]
  resultCount: number
}

export class TraderepublicWebsocket {
  static URI = 'wss://api.traderepublic.com/' as const
  static CLIENT_INFO = {
    locale: 'en',
    platformId: 'undefined',
    platformVersion: 'undefined',
    clientId: 'app.traderepublic.com',
    clientVersion: '5582',
  } as const

  private _subscriptions = new Map<number, { sub: any, onValue: (payload: any) => void, onError?: (error: unknown) => unknown }>()
  private _counter = 24
  private _socket = undefined as undefined | WebSocket
  private _echo = 0 as any
  private _inactivityTimeout = 0 as any
  private _connected = false
  private _connecting = false
  private _resolveConnected = () => { }
  private _connectingDone = new Promise<void>(resolve => this._resolveConnected = resolve)

  constructor(
    private _jurisdiction: string,
  ) { }

  private _send(reqKind: 'connect' | 'sub' | 'unsub' | 'echo', number: number, payload?: any) {
    const str = `${reqKind} ${number} ${payload ? JSON.stringify(payload) : ''}`

    this._socket?.send(str.trim())
  }

  private _sub(sub: TraderepublicInstrumentSub): Observable<TraderepublicInstrumentData>
  private _sub(sub: TraderepublicStockDetailsSub): Observable<TraderepublicStockDetailsData>
  private _sub(sub: TraderepublicHomeInstrumentExchangeSub): Observable<TraderepublicHomeInstrumentExchangeData>
  private _sub(sub: TraderepublicTickerSub): Observable<TraderepublicTickerData>
  private _sub(sub: TraderepublicAggregateHistoryLightSub): Observable<TraderepublicAggregateHistoryLightData>
  private _sub(sub: TraderepublicNeonSearchSub): Observable<TraderepublicNeonSearchData>
  private _sub(sub: TraderepublicInstrumentSub | TraderepublicStockDetailsSub | TraderepublicHomeInstrumentExchangeSub | TraderepublicTickerSub | TraderepublicAggregateHistoryLightSub | TraderepublicNeonSearchSub): Observable<TraderepublicInstrumentData | TraderepublicStockDetailsData | TraderepublicHomeInstrumentExchangeData | TraderepublicTickerData | TraderepublicAggregateHistoryLightData | TraderepublicNeonSearchData> {
    return {
      subscribe: (onValue: (data: any) => unknown, onError?: (error: unknown) => unknown) => {
        if (sub.type === 'ticker' || sub.type === 'aggregateHistoryLight') {
          sub.id = `${sub.id}.${sub.exchange}`
        }

        const number = ++this._counter

        this._subscriptions.set(number, {
          sub,
          onValue,
          onError,
        })

        this.connect().catch(console.error)
        if (this._connected) {
          this._send('sub', number, sub)
        }

        return {
          unsubscribe: () => {
            this._send('unsub', number)

            this._subscriptions.delete(number)
          },
        }
      },
      toPromise() {
        return new Promise<any>((resolve, reject) => {
          const sub = this.subscribe(value => {
            sub.unsubscribe()
            resolve(value)
          }, reject)
        })
      },
    }
  }

  instrument(isin: string, jurisdiction: string = this._jurisdiction) {
    return this._sub({
      type: 'instrument',
      id: isin,
      jurisdiction,
    })
  }

  details(isin: string | TraderepublicInstrumentData, jurisdiction: string = this._jurisdiction) {
    if (typeof isin === 'object') {
      isin = isin.isin
    }

    return this._sub({
      type: 'stockDetails',
      id: isin,
      jurisdiction,
    }).toPromise().then(details => {
      if (!details.isin) {
        return undefined
      }

      return details
    })
  }

  exchange(isin: string | TraderepublicInstrumentData) {
    if (typeof isin === 'object') {
      isin = isin.isin
    }

    return this._sub({
      type: 'homeInstrumentExchange',
      id: isin,
    })
  }

  ticker(isin: string | TraderepublicInstrumentData, exchange?: string | TraderepublicHomeInstrumentExchangeData) {
    if (typeof isin === 'object') {
      exchange = isin.exchangeIds[0]
      isin = isin.isin
    }

    if (typeof exchange === 'object') {
      exchange = exchange.exchangeId
    }

    return this._sub({
      type: 'ticker',
      id: isin,
      exchange: exchange!,
    })
  }

  aggregateHistory(isin: string | TraderepublicInstrumentData, range: TraderepublicAggregateHistoryLightSub['range'], exchange?: string | TraderepublicHomeInstrumentExchangeData) {
    if (typeof isin === 'object') {
      exchange = isin.exchangeIds[0]
      isin = isin.isin
    }

    if (typeof exchange === 'object') {
      exchange = exchange.exchangeId
    }

    return this._sub({
      type: 'aggregateHistoryLight',
      id: isin,
      exchange: exchange!,
      range,
    }).toPromise()
  }

  search(q: string, type: 'stock' | 'fund' | 'derivative' | 'crypto' = 'stock', pageSize = 1, page = 1) {
    const sub: TraderepublicNeonSearchSub = {
      type: 'neonSearch',
      data: {
        q,
        page,
        pageSize,
        filter: [
          {
            key: 'type',
            value: type,
          },
          {
            key: 'jurisdiction',
            value: this._jurisdiction,
          },
        ],
      },
    }

    const prefix = q?.trim().toLowerCase().slice(0, 2)
    if (prefix?.endsWith('?')) {
      sub.data.q = q.slice(2).trim()

      switch (prefix) {
        case 'f?':
          sub.data.filter[0].value = 'fund'
          break

        case 'c?':
          sub.data.filter[0].value = 'crypto'
          break
      }
    }

    return this._sub(sub).toPromise()
      .then(data => data.results)
  }

  async connect() {
    clearInterval(this._inactivityTimeout)
    this._inactivityTimeout = setInterval(() => {
      if (!this.active) {
        this.close()
      }
    }, 60000)

    if (this._connected) {
      return
    }

    if (this._connecting) {
      await this._connectingDone
      return
    }

    this._connecting = true
    this._socket = new WebSocket(TraderepublicWebsocket.URI)

    try {
      await new Promise<unknown>((resolve, reject) => {
        this._socket!.onerror = ev => reject(ev)
        this._socket!.onopen = resolve
      })

      await new Promise<void>((resolve, reject) => {
        this._socket!.onerror = ev => reject(ev)
        this._socket!.onmessage = message => {
          const messageString = message.data.toString('utf-8')

          if (messageString === 'connected') {
            resolve()
          } else {
            const regex = /(\d+) (A|E) ?(.*)/
            const match = regex.exec(messageString)

            if (match) {
              const [, number, messageType, payload] = match
              const subscription = this._subscriptions.get(Number(number))

              if (subscription) {
                const parsedPayload = JSON.parse(payload)

                if (messageType === 'A') {
                  subscription.onValue(parsedPayload)
                } else {
                  subscription.onError?.(parsedPayload)
                }
              }
            }
          }
        }

        this._send('connect', 22, TraderepublicWebsocket.CLIENT_INFO)
      })
    } finally {
      this._connecting = false
    }

    this._socket.onerror = console.error
    this._socket.onclose = ev => {
      this._connected = false

      clearInterval(this._echo)
      clearInterval(this._inactivityTimeout)

      if (!this.hasSubscriptions) {
        this._counter = 24
      }

      if (!ev.wasClean) {
        this.connect().catch(console.error)
      }
    }

    this._echo = setInterval(() => {
      this._send('echo', Math.floor(new Date().getTime() / 1000))
    }, 5000)

    for (const [number, { sub }] of this._subscriptions) {
      this._send('sub', number, sub)
    }

    this._connected = true
    this._resolveConnected()
    this._connectingDone = new Promise<void>(resolve => this._resolveConnected = resolve)

    if (process.env.NODE_ENV !== 'production' && !!globalThis.window) {
      (window as any).trwsSub = (sub: any) =>
        this._sub(sub).subscribe(console.log, console.error)
    }
  }

  close() {
    if (this._socket?.readyState === WebSocket.OPEN) {
      this._socket.close()
    }
  }

  get connected() {
    return this._connected
  }

  get hasSubscriptions() {
    return this._subscriptions.size > 0
  }

  get active() {
    return this.connected && this.hasSubscriptions
  }
}
