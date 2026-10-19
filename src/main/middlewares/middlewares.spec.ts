import { bodyParser, contentType, cors, noCache } from '.'
import express from 'express'
import request from 'supertest'

const makeApp = (...handlers: express.RequestHandler[]): express.Express => {
  const app = express()
  handlers.forEach((handler) => app.use(handler))
  app.post('/test', (req, res) => {
    res.send(req.body)
  })
  return app
}

describe('Express middlewares', () => {
  test('bodyParser should parse the body as json', async () => {
    await request(makeApp(bodyParser))
      .post('/test')
      .send({ name: 'any_name' })
      .expect({ name: 'any_name' })
  })

  test('contentType should default the response to json', async () => {
    const app = express()
    app.use(contentType)
    app.get('/test', (req, res) => res.send(''))
    await request(app).get('/test').expect('content-type', /json/)
  })

  test('contentType should allow overriding to xml', async () => {
    const app = express()
    app.use(contentType)
    app.get('/test', (req, res) => {
      res.type('xml')
      res.send('')
    })
    await request(app).get('/test').expect('content-type', /xml/)
  })

  test('cors should enable CORS', async () => {
    await request(makeApp(cors))
      .post('/test')
      .expect('access-control-allow-origin', '*')
      .expect('access-control-allow-headers', '*')
      .expect('access-control-allow-methods', '*')
  })

  test('noCache should disable caching', async () => {
    await request(makeApp(noCache))
      .post('/test')
      .expect(
        'cache-control',
        'no-store, no-cache, must-revalidate, proxy-revalidate'
      )
      .expect('pragma', 'no-cache')
      .expect('expires', '0')
      .expect('surrogate-control', 'no-store')
  })
})
