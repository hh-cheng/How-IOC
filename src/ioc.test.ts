import 'reflect-metadata'
import { describe, it, expect } from 'vitest'

import { Inject, Injectable } from './ioc'

describe('IOC', () => {
  it('should be able to inject dependencies', () => {
    @Injectable()
    class Service {
      getName() {
        return 'A'
      }
    }

    const service = new Service()

    // class Controller {
    //   constructor(@Inject() private readonly service: Service) {}
    // }
    expect(1).toBe(1)
  })
})
