# IOC

> ## 实现原理

1. 使用装饰器对类做拦截
2. 分析类构造函数接收的参数
3. 通过 AST 动态分析构造函数参数 (acorn, acorn-walk)
4. 通过 reflect-metadata 解决在注入时 controller 没定义引用类(service)，但在业务层需要定义类型时能理所当然引用被注入类
