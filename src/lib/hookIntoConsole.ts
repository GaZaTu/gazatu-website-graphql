type ConsoleLogKind = 'log' | 'info' | 'warn' | 'error' | 'debug'

type ConsoleLogEvent = {
  time: Date
  kind: ConsoleLogKind
  args: any[]
}

function hookIntoConsole(handler: (event: ConsoleLogEvent) => unknown, console = window.console) {
  const methodNames: ConsoleLogKind[] = ['log', 'info', 'warn', 'error', 'debug']

  for (const methodName of methodNames) {
    const method = console[methodName] as Function

    console[methodName] = function (this: Console, ...args: any[]) {
      handler({
        time: new Date(),
        kind: methodName,
        args,
      })

      method.apply(this, args)
    }
  }
}

export default hookIntoConsole
