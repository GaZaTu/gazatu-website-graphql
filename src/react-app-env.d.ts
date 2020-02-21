/// <reference types="react-scripts" />

declare module 'graphiql' {
  const GraphiQL: any

  export default GraphiQL
}

declare namespace NodeJS {
  interface ProcessEnv {
    readonly REACT_APP_API_URL: string
    readonly REACT_APP_GRAPHQL_URL: string
    readonly REACT_APP_GRAPHQL_SUBSCRIPTIONS_URL: string
  }
}
