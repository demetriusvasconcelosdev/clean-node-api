import {
  badRequest,
  forbidden,
  noContent,
  ok,
  serverError,
  unauthorized
} from './http-helper'
import { ServerError, UnauthorizedError } from '@/presentation/errors'

describe('HttpHelper', () => {
  test('badRequest should return 400 with the error', () => {
    const error = new Error('any_error')
    expect(badRequest(error)).toEqual({ statusCode: 400, body: error })
  })

  test('forbidden should return 403 with the error', () => {
    const error = new Error('any_error')
    expect(forbidden(error)).toEqual({ statusCode: 403, body: error })
  })

  test('unauthorized should return 401 with UnauthorizedError', () => {
    expect(unauthorized()).toEqual({
      statusCode: 401,
      body: new UnauthorizedError()
    })
  })

  test('serverError should return 500 with ServerError carrying the stack', () => {
    const error = new Error('any_error')
    const response = serverError(error)
    expect(response.statusCode).toBe(500)
    expect(response.body).toBeInstanceOf(ServerError)
    expect(response.body.stack).toBe(error.stack)
  })

  test('ok should return 200 with the data', () => {
    expect(ok({ any: 'data' })).toEqual({
      statusCode: 200,
      body: { any: 'data' }
    })
  })

  test('noContent should return 204 with null body', () => {
    expect(noContent()).toEqual({ statusCode: 204, body: null })
  })
})
