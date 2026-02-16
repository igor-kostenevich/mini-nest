# mini-nest 🐣

A **200-line** toy re-implementation of the core ideas behind NestJS
(decorators, IoC container, module system, Express adapter).

```bash
npm i       # install deps
npm run dev # start dev server on http://localhost:8081/api/books
```

## Recent Changes & Architecture Compliance

The framework has been updated to comply with minimal Nest-like architecture requirements.

### Implemented Features

- Added `@Inject(token?)` decorator with override token support in DI container.
- Container now resolves dependencies using:
  - singleton caching
  - transitive dependency resolution
  - override tokens via metadata (`mini:inject_tokens`)
- Implemented `NestFactory.create(AppModule)` as root bootstrap API.
- Added full `@Module` metadata support:
  - `providers`
  - `controllers`
  - `imports`
  - `exports`
- Recursive module graph initialization.
- Fixed ZodValidationPipe usage — invalid requests now return:
  - HTTP 400
  - JSON `{ "message": "..." }`
- Implemented global error handler:
  - `HttpException` maps to `status + { message }`
  - Removed default HTML error responses.
- Execution order guaranteed:
  Global pipes → Controller pipes → Method pipes → Param pipes → Guard → Interceptor(before) → Handler → Interceptor(after) → Filter
- Fixed potential guard duplication (no mutation of global arrays).
