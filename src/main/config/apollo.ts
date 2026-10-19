import { setupApolloServer } from '@/main/graphql/apollo'
import { expressMiddleware } from '@as-integrations/express5'
import { type Express } from 'express'

export default async (app: Express): Promise<void> => {
  const server = setupApolloServer()
  await server.start()
  app.use(
    '/graphql',
    expressMiddleware(server, { context: async ({ req }) => ({ req }) })
  )
}
