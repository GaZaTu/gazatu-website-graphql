/// <reference types="react-scripts" />

declare namespace NodeJS {
  interface ProcessEnv {
    readonly REACT_APP_NAME: string
    readonly REACT_APP_VERSION: string
    readonly REACT_APP_API_URL: string
    readonly REACT_APP_GRAPHQL_URL: string
    readonly REACT_APP_GRAPHQL_SUBSCRIPTIONS_URL: string
  }
}

declare module 'graphiql' {
  const GraphiQL: any

  export default GraphiQL
}
