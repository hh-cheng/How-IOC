import { Constructor } from './types'

class IOCContainer {
  private readonly services: Map<symbol, new () => unknown> = new Map()

  register<T>(token: symbol, service: new () => T) {
    this.services.set(token, service)
  }

  get(token: symbol) {
    if (!this.services.has(token)) {
      throw new Error(`Service ${String(token)} not found`)
    }

    return this.services.get(token)
  }
}

export const iocContainer = new IOCContainer()
