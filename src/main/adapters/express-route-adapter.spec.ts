import { adaptRoute } from './express-route-adapter'
import { type Controller, type HttpResponse } from '@/presentation/protocols'
import express from 'express'
import request from 'supertest'

class ControllerSpy implements Controller {
  request: any
  result: HttpResponse = { statusCode: 200, body: { any: 'data' } }

  async handle(request: any): Promise<{ statusCode: number; body: any }> {
    this.request = request
    return this.result
  }
}

const makeApp = (controller: Controller): express.Express => {
  const app = express()
  app.use(express.json())
  app.post('/route/:id', adaptRoute(controller))
  return app
}

describe('ExpressRouteAdapter', () => {
  test('Should merge body and params into the controller request', async () => {
    const controllerSpy = new ControllerSpy()
    await request(makeApp(controllerSpy))
      .post('/route/any_id')
      .send({ field: 'any_value' })
    expect(controllerSpy.request).toEqual({ field: 'any_value', id: 'any_id' })
  })

  test('Should respond with the body on success status codes', async () => {
    const controllerSpy = new ControllerSpy()
    controllerSpy.result = { statusCode: 200, body: { any: 'data' } }
    await request(makeApp(controllerSpy))
      .post('/route/any_id')
      .expect(200, { any: 'data' })
  })

  test('Should respond with an error message on error status codes', async () => {
    const controllerSpy = new ControllerSpy()
    controllerSpy.result = { statusCode: 400, body: new Error('any_error') }
    await request(makeApp(controllerSpy))
      .post('/route/any_id')
      .expect(400, { error: 'any_error' })
  })
})
