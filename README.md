# clean-node-api

API de enquetes para programadores, escrita em TypeScript com TDD, Clean Architecture e princípios SOLID. Inspirada em [rmanguinho/clean-ts-api](https://github.com/rmanguinho/clean-ts-api), com dependências e configurações atuais.

## Funcionalidades

- **Contas:** cadastro (`signUp`) e login com JWT
- **Enquetes:** criar (apenas admin) e listar (usuário autenticado)
- **Resultados:** responder uma enquete e consultar o resultado, com contagem e percentual por resposta
- REST (`/api`), GraphQL (`/graphql`), Swagger (`/api-docs`) e log de erros no MongoDB

## Arquitetura

```
src/
├── domain/        # modelos e interfaces dos casos de uso
├── data/          # protocolos (repositórios, criptografia) e casos de uso Db*
├── infra/         # adapters: bcrypt, jwt, validator e repositórios MongoDB
├── validation/    # validadores compostos
├── presentation/  # controllers, middlewares, erros e helpers HTTP
└── main/          # composição: factories, rotas, Express, GraphQL, Swagger, server
tests/             # mocks compartilhados (spies)
```

As dependências apontam sempre para dentro: `main` conhece todas as camadas, `domain` não conhece nenhuma. Os testes unitários ficam ao lado do código (`*.spec.ts`) e os de integração usam `*.test.ts` (e os repositórios em `infra/db`), rodando contra um MongoDB em memória.

## Rodando

```bash
npm install
npm run build
MONGO_URL=mongodb://localhost:27017/clean-node-api npm start
```

Ou com Docker: `npm run up` (sobe MongoDB e API) e `npm run down`.

| Variável     | Padrão                                        |
| ------------ | --------------------------------------------- |
| `MONGO_URL`  | `mongodb://localhost:27017/clean-node-api`    |
| `PORT`       | `5050`                                        |
| `JWT_SECRET` | valor de desenvolvimento (defina em produção) |

## Scripts

| Script                     | O que faz                          |
| -------------------------- | ---------------------------------- |
| `npm test`                 | todos os testes, em série          |
| `npm run test:unit`        | testes unitários em modo watch     |
| `npm run test:integration` | testes de integração em modo watch |
| `npm run test:ci`          | testes com cobertura               |
| `npm run lint`             | ESLint                             |
| `npm run build`            | compila para `dist/`               |

Após `npm install`, o husky ativa os hooks: `pre-commit` roda `lint-staged` e `pre-push` roda `test:ci`.

## Endpoints

| Método | Rota                             | Acesso      |
| ------ | -------------------------------- | ----------- |
| POST   | `/api/signup`                    | público     |
| POST   | `/api/login`                     | público     |
| POST   | `/api/surveys`                   | admin       |
| GET    | `/api/surveys`                   | autenticado |
| PUT    | `/api/surveys/:surveyId/results` | autenticado |
| GET    | `/api/surveys/:surveyId/results` | autenticado |

A autenticação usa o header `x-access-token`.
