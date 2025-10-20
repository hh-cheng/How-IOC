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
})
