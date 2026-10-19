import { makeAuthMiddleware } from '@/main/factories'
import { getDirective, MapperKind, mapSchema } from '@graphql-tools/utils'
import { defaultFieldResolver, GraphQLError, type GraphQLSchema } from 'graphql'

export const authDirectiveTransformer = (
  schema: GraphQLSchema
): GraphQLSchema => {
  return mapSchema(schema, {
    [MapperKind.OBJECT_FIELD]: (fieldConfig) => {
      const authDirective = getDirective(schema, fieldConfig, 'auth')?.[0]
      if (authDirective !== undefined) {
        const { resolve = defaultFieldResolver } = fieldConfig
        fieldConfig.resolve = async (parent, args, context, info) => {
          const request = {
            accessToken: context?.req?.headers?.['x-access-token']
          }
          const httpResponse = await makeAuthMiddleware().handle(request)
          if (httpResponse.statusCode === 200) {
            Object.assign(context?.req, httpResponse.body)
            return await resolve(parent, args, context, info)
          }
          throw new GraphQLError(httpResponse.body.message as string, {
            extensions: { code: 'FORBIDDEN' }
          })
        }
      }
      return fieldConfig
    }
  })
}
