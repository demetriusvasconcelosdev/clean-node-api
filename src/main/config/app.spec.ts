import { setupApp } from './app'
import request from 'supertest'

describe('App', () => {
  test('Should serve the swagger docs without cache', async () => {
    const response = await request(setupApp()).get('/api-docs/')
    expect(response.status).toBe(200)
    expect(response.headers['cache-control']).toContain('no-store')
  })
})
