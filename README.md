## Description

一个在线即时通讯系统服务端，技术栈 `NestJS` `TypeORM` `WebSocket` `WebRTC`

## Installation

```bash
$ pnpm install
```

## Running the app

```bash
# development
$ mv src/config/dev.yaml.example  src/config/dev.yaml
$ pnpm run start

# watch mode
$ pnpm run start:dev

# production mode
$ pnpm run start:prod
```

## Test

```bash
# unit tests
$ pnpm run test

# e2e tests
$ pnpm run test:e2e

# test coverage
$ pnpm run test:cov
```

## Support

Nest is an MIT-licensed open source project. It can grow thanks to the sponsors and support by the amazing backers. If you'd like to join them, please [read more here](https://docs.nestjs.com/support).

## Stay in touch

- Author - [Kamil Myśliwiec](https://kamilmysliwiec.com)
- Website - [https://nestjs.com](https://nestjs.com/)
- Twitter - [@nestframework](https://twitter.com/nestframework)

## License

Nest is [MIT licensed](LICENSE).

## 声明周期
  - 收到请求
  - 全局绑定的中间件
  - 模块绑定的中间件
  - 全局守卫
  - 控制层守卫
  - 路由守卫
  - 全局拦截器（控制器之前）
  - 控制器层拦截器 （控制器之前）
  - 路由拦截器 （控制器之前）
  - 全局管道
  - 控制器管道
  - 路由管道
  - 路由参数管道
  - 控制器（方法处理器）
    - 服务（如果有）
  - 路由拦截器（请求之后）
  - 控制器拦截器 （请求之后）
  - 全局拦截器 （请求之后）
  - 异常过滤器 （路由，之后是控制器，之后是全局）
  - 服务器响应
