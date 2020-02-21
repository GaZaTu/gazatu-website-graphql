export const createFetchGraphQL = (init?: RequestInit) =>
  (query: string, variables?: { [key: string]: any }) =>
    fetch(process.env.REACT_APP_GRAPHQL_URL, {
      ...init,
      mode: 'cors',
      method: 'POST',
      headers: {
        ...(init ? init.headers : {}),
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        query,
        variables,
      }),
    }).then(response => response.json())
