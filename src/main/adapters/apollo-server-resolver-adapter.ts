import { type Controller } from '@/presentation/protocols'
import { GraphQLError } from 'graphql'

const toGraphQLError = (message: string, code: string): GraphQLError =>
  new GraphQLError(message, { extensions: { code } })

export const adaptResolver = async (
  controller: Controller,
  args?: any,
  context?: any
): Promise<any> => {
  const request = {
    ...(args ?? {}),
    accountId: context?.req?.accountId
  }
  const httpResponse = await controller.handle(request)
  const message: string = httpResponse.body?.message
  switch (httpResponse.statusCode) {
    case 200:
    case 204:
      return httpResponse.body
    case 400:
      throw toGraphQLError(message, 'BAD_USER_INPUT')
    case 401:
      throw toGraphQLError(message, 'UNAUTHENTICATED')
    case 403:
      throw toGraphQLError(message, 'FORBIDDEN')
    default:
      throw toGraphQLError(message, 'INTERNAL_SERVER_ERROR')
  }
}
