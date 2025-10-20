import { Constructor } from './types'

class IOCContainer {
  private readonly services: Map<symbol, Constructor<unknown>> = new Map()

  register<T>(token: symbol, service: Constructor<T>) {
    this.services.set(token, service as Constructor<unknown>)
  }

  get(token: symbol): Constructor<unknown> | undefined {
    return this.services.get(token)
  }
}

export const iocContainer = new IOCContainer()
