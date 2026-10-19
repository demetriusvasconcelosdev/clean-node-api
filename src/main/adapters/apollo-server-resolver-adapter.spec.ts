import { adaptResolver } from './apollo-server-resolver-adapter'
import { type Controller, type HttpResponse } from '@/presentation/protocols'
import { GraphQLError } from 'graphql'

class ControllerSpy implements Controller {
  request: any
  result: HttpResponse = { statusCode: 200, body: { any: 'data' } }

  async handle(request: any): Promise<HttpResponse> {
    this.request = request
    return this.result
  }
}

const code = (error: any): string => error.extensions.code

describe('ApolloServerResolverAdapter', () => {
  test('Should merge args and the accountId from the context into the request', async () => {
    const controllerSpy = new ControllerSpy()
    await adaptResolver(
      controllerSpy,
      { field: 'any_value' },
      { req: { accountId: 'any_id' } }
    )
    expect(controllerSpy.request).toEqual({
      field: 'any_value',
      accountId: 'any_id'
    })
  })

  test('Should return the body on 200 and 204', async () => {
    const controllerSpy = new ControllerSpy()
    expect(await adaptResolver(controllerSpy)).toEqual({ any: 'data' })
    controllerSpy.result = { statusCode: 204, body: null }
    expect(await adaptResolver(controllerSpy)).toBeNull()
  })

  test.each([
    [400, 'BAD_USER_INPUT'],
    [401, 'UNAUTHENTICATED'],
    [403, 'FORBIDDEN'],
    [500, 'INTERNAL_SERVER_ERROR']
  ])(
    'Should throw a GraphQLError with the right code on %i',
    async (statusCode, expectedCode) => {
      const controllerSpy = new ControllerSpy()
      controllerSpy.result = { statusCode, body: new Error('any_error') }
      const error = await adaptResolver(controllerSpy).catch((e) => e)
      expect(error).toBeInstanceOf(GraphQLError)
      expect(error.message).toBe('any_error')
      expect(code(error)).toBe(expectedCode)
    }
  )
})
