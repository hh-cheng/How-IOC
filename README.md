# IOC (Inversion of Control)

A TypeScript implementation of Dependency Injection using decorators and reflect-metadata.

## 实现原理 (Implementation Principles)

### 核心机制 (Core Mechanisms)

1. **装饰器拦截 (Decorator Interception)**: 使用 `@Injectable()` 和 `@Inject()` 装饰器标记类和参数
2. **元数据存储 (Metadata Storage)**: 使用 `reflect-metadata` 存储类型信息和注入标记
3. **依赖解析 (Dependency Resolution)**: 通过 `resolve()` 函数递归解析和实例化依赖
4. **容器管理 (Container Management)**: IOCContainer 存储和管理所有可注入的类

### 关键技术点 (Key Technical Points)

- **TypeScript Decorator Metadata**: `emitDecoratorMetadata: true` 让 TypeScript 自动生成类型元数据
- **Reflect Metadata API**: 
  - `design:paramtypes` - 获取构造函数参数类型
  - 自定义 `Symbol('inject')` - 标记哪些参数需要注入
- **SWC Transform**: Vitest 使用 SWC 而非 esbuild 来支持装饰器元数据

## 工作流程图 (Workflow Diagram)

```mermaid
sequenceDiagram
    participant User
    participant Decorator
    participant Metadata
    participant Container
    participant Resolve

    Note over User,Resolve: 1. 类定义阶段 (Class Definition Phase)
    
    User->>Decorator: @Injectable() class Service
    Decorator->>Container: register(Symbol.for('Service'), Service)
    Note over Container: 存储: Map { Symbol(Service) => Service }

    User->>Decorator: @Injectable() class Controller
    Decorator->>Container: register(Symbol.for('Controller'), Controller)
    
    User->>Decorator: @Inject() service: Service
    Decorator->>Metadata: defineMetadata(Symbol('inject'), [0], Controller)
    Note over Metadata: 存储参数索引: [0]
    
    Note over Metadata: TypeScript 自动生成<br/>design:paramtypes: [Service]

    Note over User,Resolve: 2. 依赖解析阶段 (Resolution Phase)

    User->>Resolve: resolve(Controller)
    
    Resolve->>Metadata: getMetadata('design:paramtypes', Controller)
    Metadata-->>Resolve: [Service]
    
    Resolve->>Metadata: getOwnMetadata(Symbol('inject'), Controller)
    Metadata-->>Resolve: [0]
    
    Note over Resolve: 知道参数0需要注入Service类型
    
    Resolve->>Container: get(Symbol.for('Service'))
    Container-->>Resolve: Service constructor
    
    Resolve->>Resolve: resolve(Service) (递归)
    Note over Resolve: Service 无依赖,直接实例化
    
    Resolve->>Resolve: new Service()
    Resolve->>Resolve: new Controller(serviceInstance)
    
    Resolve-->>User: Controller 实例 (含注入的 Service)
```

## 架构图 (Architecture Diagram)

```mermaid
graph TB
    subgraph 装饰器层_Decorator_Layer
        A[Injectable] --> B[注册类到容器]
        C[Inject] --> D[标记参数索引]
    end

    subgraph 元数据层_Metadata_Layer
        E[Reflect.defineMetadata] --> F[Symbol inject: 参数索引]
        G[TypeScript emitDecoratorMetadata] --> H[design:paramtypes: 类型数组]
    end

    subgraph 容器层_Container_Layer
        I[IOCContainer] --> J[Map: Symbol → Constructor]
        J --> K[register 注册]
        J --> L[get 获取]
    end

    subgraph 解析层_Resolution_Layer
        M[resolve 函数] --> N[读取 paramtypes]
        M --> O[读取 inject 标记]
        M --> P[从容器获取依赖]
        M --> Q[递归解析依赖]
        M --> R[实例化目标类]
    end

    A --> E
    C --> E
    B --> K
    N --> H
    O --> F
    P --> L
    Q --> M

    style A fill:#e1f5ff
    style C fill:#e1f5ff
    style I fill:#fff4e1
    style M fill:#e8f5e9
```



## 数据流示例 (Data Flow Example)

```mermaid
flowchart TB
    subgraph "定义时 (Definition Time)"
        A[Service Class] -->|Injectable| B[Container Store Service]
        C[Controller Class] -->|Injectable| D[Container Store Controller]
        E[Inject Parameter 0] -->|Metadata| F[Tag Need Injection 0]
        G[TypeScript] -->|Compile| H[Type Service]
    end

    subgraph "运行时 (Runtime)"
        I[Resolve Controller] --> J{Read Metadata}
        J --> K[Parameter Type Service]
        J --> L[Injection Index 0]
        K --> M[Find Container]
        M --> N[Get Service Constructor]
        N --> O[Resolve Service]
        O --> P[New Service]
        P --> Q[New Controller Service]
        Q --> R[Return Instance]
    end

    B -.-> M
    D -.-> I
    F -.-> L
    H -.-> K

    style I fill:#ffebee
    style R fill:#c8e6c9
```

## 核心代码流程 (Core Code Flow)

### 1. 装饰器标记 (Decorator Marking)

```typescript
@Injectable()  // ← 注册到容器
class Service {
  getName() { return 'A' }
}

@Injectable()  // ← 注册到容器
class Controller {
  constructor(@Inject() readonly service: Service) {}
  //          ^^^^^^^^^ 标记参数0需要注入
}
```

### 2. 元数据存储 (Metadata Storage)

```
Controller 类的元数据:
├── design:paramtypes → [Service]     (TypeScript 生成)
└── Symbol('inject')  → [0]           (@Inject 生成)
```

### 3. 依赖解析 (Dependency Resolution)

```typescript
resolve(Controller)
  ↓
读取 paramtypes: [Service]
读取 injections: [0]
  ↓
参数0需要注入 Service 类型
  ↓
从容器获取 Service 构造器
  ↓
递归: resolve(Service) → new Service()
  ↓
new Controller(serviceInstance)
```

## 使用示例 (Usage Example)

```typescript
import { Injectable, Inject, resolve } from './ioc'

// 1. 定义可注入的服务
@Injectable()
class DatabaseService {
  query() { return 'data' }
}

// 2. 定义依赖其他服务的类
@Injectable()
class UserService {
  constructor(@Inject() private db: DatabaseService) {}
  
  getUser() {
    return this.db.query()
  }
}

// 3. 解析并使用
const userService = resolve(UserService)
console.log(userService.getUser()) // 'data'
```

## 技术栈 (Tech Stack)

- **TypeScript**: 装饰器和类型系统
- **reflect-metadata**: 运行时元数据 API
- **SWC**: 支持装饰器元数据的转译器
- **Vitest**: 测试框架

## 参考资源 (References)

- AST Explorer: https://astexplorer.net
- Reflect Metadata: https://github.com/rbuckton/reflect-metadata
- TypeScript Decorators: https://www.typescriptlang.org/docs/handbook/decorators.html
