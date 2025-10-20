import 'reflect-metadata'
import { iocContainer } from './container'
import type { Constructor } from './types'

// Store metadata about which parameters need injection
const injectMetadataKey = Symbol('inject')

export function Inject(): ParameterDecorator & PropertyDecorator {
  return (
    target: any,
    propertyKey?: string | symbol,
    parameterIndex?: number,
  ) => {
    if (parameterIndex !== undefined) {
      // Constructor parameter injection
      const existingInjections: number[] =
        Reflect.getOwnMetadata(injectMetadataKey, target) || []
      existingInjections.push(parameterIndex)
      Reflect.defineMetadata(injectMetadataKey, existingInjections, target)
    }
  }
}

export function Injectable(): ClassDecorator {
  return (target) => {
    // Register the constructor (not an instance)
    iocContainer.register(
      Symbol.for(target.name),
      target as unknown as Constructor<unknown>,
    )
  }
}

// Resolve and instantiate a class with its dependencies
export function resolve<T>(target: Constructor<T>): T {
  // Get the types of constructor parameters
  const paramTypes: Constructor<unknown>[] =
    Reflect.getMetadata('design:paramtypes', target) || []

  // Get which parameters are marked with @Inject()
  const injections: number[] =
    Reflect.getOwnMetadata(injectMetadataKey, target) || []

  // Resolve dependencies - keep them in the correct parameter positions
  const dependencies = paramTypes.map((paramType, index) => {
    // Only inject if marked with @Inject()
    if (injections.includes(index)) {
      const token = Symbol.for(paramType.name)
      const ServiceConstructor = iocContainer.get(token)
      if (!ServiceConstructor) {
        throw new Error(`No provider found for ${paramType.name}`)
      }
      // Recursively resolve the dependency
      return resolve(ServiceConstructor as Constructor<unknown>)
    }
    // For non-injected parameters, pass undefined
    return
  })

  // Instantiate the target class with resolved dependencies
  return new target(...dependencies)
}
