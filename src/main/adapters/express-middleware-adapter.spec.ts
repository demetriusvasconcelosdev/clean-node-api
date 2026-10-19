import { adaptMiddleware } from './express-middleware-adapter'
import { type HttpResponse, type Middleware } from '@/presentation/protocols'
import express from 'express'
import request from 'supertest'

class MiddlewareSpy implements Middleware {
  request: any
  result: HttpResponse = { statusCode: 200, body: { accountId: 'any_id' } }

  async handle(request: any): Promise<HttpResponse> {
    this.request = request
    return this.result
  }
}

const makeApp = (middleware: Middleware): express.Express => {
  const app = express()
  app.get('/route', adaptMiddleware(middleware), (req, res) => {
    res.json({ accountId: req.accountId })
  })
  return app
}

describe('ExpressMiddlewareAdapter', () => {
  test('Should pass x-access-token and headers to the middleware', async () => {
    const middlewareSpy = new MiddlewareSpy()
    await request(makeApp(middlewareSpy))
      .get('/route')
      .set('x-access-token', 'any_token')
    expect(middlewareSpy.request.accessToken).toBe('any_token')
    expect(middlewareSpy.request['x-access-token']).toBe('any_token')
  })

  test('Should add the middleware response body to the request and call next', async () => {
    const middlewareSpy = new MiddlewareSpy()
    await request(makeApp(middlewareSpy))
      .get('/route')
      .expect(200, { accountId: 'any_id' })
  })

  test('Should respond with the error message if the middleware fails', async () => {
    const middlewareSpy = new MiddlewareSpy()
    middlewareSpy.result = { statusCode: 403, body: new Error('any_error') }
    await request(makeApp(middlewareSpy))
      .get('/route')
      .expect(403, { error: 'any_error' })
  })
})
