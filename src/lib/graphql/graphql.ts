export class GraphQLScript {
  static regex = /PLACEHOLDER/

  script: string
  match: RegExpMatchArray

  constructor(script: string, match: RegExpMatchArray) {
    this.script = script
    this.match = match
  }
}

export class GraphQLQuery extends GraphQLScript {
  static regex = /query (\w+)/

  name: string
  query: string

  constructor(script: string, match: RegExpMatchArray) {
    super(script, match)

    this.name = match[1]
    this.query = this.script.slice(match.index! + match[0].length)
  }
}

export class GraphQLMutation extends GraphQLScript {
  static regex = /mutation (\w+)/

  name: string
  query: string

  constructor(script: string, match: RegExpMatchArray) {
    super(script, match)

    this.name = match[1]
    this.query = this.script.slice(match.index! + match[0].length)
  }
}

export class GraphQLFragment extends GraphQLScript {
  static regex = /fragment (\w+) on (\w+)/

  name: string
  onType: string
  query: string

  constructor(script: string, match: RegExpMatchArray) {
    super(script, match)

    this.name = match[1]
    this.onType = match[2]
    this.query = this.script.slice(match.index! + match[0].length)
  }

  get spread() {
    return `on ${this.onType}${this.query}`
  }
}

const graphQLScriptTypes: (typeof GraphQLScript)[] = [GraphQLQuery, GraphQLMutation, GraphQLFragment]

function createGraphQLScriptType(script: string) {
  for (const GraphQLScriptType of graphQLScriptTypes) {
    const match = GraphQLScriptType.regex.exec(script)

    if (match) {
      return new GraphQLScriptType(script, match)
    }
  }

  throw new Error('Invalid script')
}

export function graphql(strings: TemplateStringsArray, ...args: (string | GraphQLScript)[]) {
  let script = ''

  for (let i = 0; i < strings.length; i++) {
    const str = strings[i]
    const arg = args[i]

    let argAsString = ''

    if (arg) {
      if (typeof arg === 'string') {
        argAsString = arg
      } else if (arg instanceof GraphQLFragment) {
        argAsString = arg.spread
      } else {
        throw new Error('Invalid argument')
      }
    }

    script += str + argAsString
  }

  return createGraphQLScriptType(script)
}
