import { setupApp } from '@/main/config/app'
import { MongoHelper } from '@/infra/db'
import { mockAccessToken } from '@/tests/main/mock-access-token'
import { type Express } from 'express'
import request from 'supertest'

let app: Express

describe('Survey Routes', () => {
  beforeAll(async () => {
    app = await setupApp()
    await MongoHelper.connect(process.env.MONGO_URL!)
  })

  afterAll(async () => {
    await MongoHelper.disconnect()
  })

  beforeEach(async () => {
    await MongoHelper.getCollection('surveys').deleteMany({})
    await MongoHelper.getCollection('accounts').deleteMany({})
  })

  describe('POST /surveys', () => {
    const body = {
      question: 'Question',
      answers: [
        { answer: 'Answer 1', image: 'http://image-name.com' },
        { answer: 'Answer 2' }
      ]
    }

    test('Should return 403 on add survey without accessToken', async () => {
      await request(app).post('/api/surveys').send(body).expect(403)
    })

    test('Should return 403 on add survey with a non admin accessToken', async () => {
      const accessToken = await mockAccessToken()
      await request(app)
        .post('/api/surveys')
        .set('x-access-token', accessToken)
        .send(body)
        .expect(403)
    })

    test('Should return 204 on add survey with a valid admin accessToken', async () => {
      const accessToken = await mockAccessToken('admin')
      await request(app)
        .post('/api/surveys')
        .set('x-access-token', accessToken)
        .send(body)
        .expect(204)
    })

    test('Should return 400 on add survey without a question', async () => {
      const accessToken = await mockAccessToken('admin')
      await request(app)
        .post('/api/surveys')
        .set('x-access-token', accessToken)
        .send({ answers: body.answers })
        .expect(400)
    })
  })

  describe('GET /surveys', () => {
    test('Should return 403 on load surveys without accessToken', async () => {
      await request(app).get('/api/surveys').expect(403)
    })

    test('Should return 204 on load surveys with a valid accessToken and no surveys', async () => {
      const accessToken = await mockAccessToken()
      await request(app)
        .get('/api/surveys')
        .set('x-access-token', accessToken)
        .expect(204)
    })

    test('Should return 200 on load surveys with a valid accessToken', async () => {
      const accessToken = await mockAccessToken()
      await MongoHelper.getCollection('surveys').insertOne({
        question: 'Question',
        answers: [{ answer: 'Answer 1' }, { answer: 'Answer 2' }],
        date: new Date()
      })
      const response = await request(app)
        .get('/api/surveys')
        .set('x-access-token', accessToken)
      expect(response.status).toBe(200)
      expect(response.body).toHaveLength(1)
      expect(response.body[0].didAnswer).toBe(false)
    })
  })
})
