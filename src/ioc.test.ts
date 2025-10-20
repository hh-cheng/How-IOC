import 'reflect-metadata'
import { describe, it, expect } from 'vitest'

import { Inject, Injectable, resolve } from './ioc'

@Injectable()
class Service {
  getName() {
    return 'A'
  }
}

@Injectable()
class Controller {
  constructor(@Inject() readonly service: Service) {}
}

describe('IOC', () => {
  it('should be able to inject dependencies', () => {
    const controller = resolve(Controller)
    expect(controller.service).toBeInstanceOf(Service)
    expect(controller.service.getName()).toBe('A')
  })

  it('should handle mixed injected and non-injected parameters', () => {
    @Injectable()
    class Logger {
      log(msg: string) {
        return `LOG: ${msg}`
      }
    }

    class MixedController {
      constructor(
        @Inject() readonly service: Service,
        readonly config: string,
        @Inject() readonly logger: Logger,
      ) {}
    }

    const controller = resolve(MixedController)

    // Injected parameters work
    expect(controller.service).toBeInstanceOf(Service)
    expect(controller.logger).toBeInstanceOf(Logger)

    // Non-injected parameter is undefined
    expect(controller.config).toBeUndefined()
  })
})
