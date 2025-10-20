import 'reflect-metadata'
import acorn from 'acorn'
import acornWalk from 'acorn-walk'

import { iocContainer } from './container'

export function Inject(): ParameterDecorator & PropertyDecorator {
  return (
    target: any,
    propertyKey?: string | symbol,
    parameterIndex?: number,
  ) => {}
}

export function Injectable(): ClassDecorator {
  return (target) => {
    iocContainer.register(
      Symbol.for(target.name),
      new (target as unknown as { new (...args: any[]): any })(),
    )

    console.log(iocContainer.get(Symbol.for(target.name)))
  }
}
