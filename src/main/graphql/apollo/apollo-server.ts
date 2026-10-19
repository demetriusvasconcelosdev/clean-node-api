import typeDefs from '@/main/graphql/type-defs'
import resolvers from '@/main/graphql/resolvers'
import { authDirectiveTransformer } from '@/main/graphql/directives'
import { ApolloServer, type ApolloServerPlugin } from '@apollo/server'
import { makeExecutableSchema } from '@graphql-tools/schema'

const statusByCode: Record<string, number> = {
  BAD_USER_INPUT: 400,
  UNAUTHENTICATED: 401,
  FORBIDDEN: 403
}

const handleErrors: ApolloServerPlugin = {
  requestDidStart: async () => ({
    willSendResponse: async ({ response }) => {
      if (response.body.kind !== 'single') return
      const { errors } = response.body.singleResult
      if (errors === undefined || errors.length === 0) return
      response.body.singleResult.data = undefined
      for (const error of errors) {
        const code = error.extensions?.code as string
        response.http.status = statusByCode[code] ?? 500
      }
    }
  })
}

export const setupApolloServer = (): ApolloServer => {
  const schema = authDirectiveTransformer(
    makeExecutableSchema({ resolvers, typeDefs })
  )
  return new ApolloServer({ schema, plugins: [handleErrors] })
}
