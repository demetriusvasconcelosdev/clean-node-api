import { setupApp } from '@/main/config/app'
import { MongoHelper } from '@/infra/db'
import { mockAccessToken } from '@/tests/main/mock-access-token'
import { type Express } from 'express'
import request from 'supertest'

let app: Express

describe('Survey GraphQL', () => {
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

  describe('Surveys Query', () => {
    const query = `query {
      surveys {
        id
        question
        answers {
          image
          answer
        }
        date
        didAnswer
      }
    }`

    test('Should return Surveys', async () => {
      const accessToken = await mockAccessToken()
      const now = new Date()
      await MongoHelper.getCollection('surveys').insertOne({
        question: 'Question',
        answers: [
          { answer: 'Answer 1', image: 'http://image-name.com' },
          { answer: 'Answer 2' }
        ],
        date: now
      })
      const res = await request(app)
        .post('/graphql')
        .set('x-access-token', accessToken)
        .send({ query })
      expect(res.status).toBe(200)
      expect(res.body.data.surveys).toHaveLength(1)
      expect(res.body.data.surveys[0].id).toBeTruthy()
      expect(res.body.data.surveys[0].question).toBe('Question')
      expect(res.body.data.surveys[0].date).toBe(now.toISOString())
      expect(res.body.data.surveys[0].didAnswer).toBe(false)
      expect(res.body.data.surveys[0].answers).toEqual([
        { answer: 'Answer 1', image: 'http://image-name.com' },
        { answer: 'Answer 2', image: null }
      ])
    })

    test('Should return 403 without an accessToken', async () => {
      const res = await request(app).post('/graphql').send({ query })
      expect(res.status).toBe(403)
      expect(res.body.data).toBeFalsy()
      expect(res.body.errors[0].message).toBe('Access denied')
    })
  })
})
