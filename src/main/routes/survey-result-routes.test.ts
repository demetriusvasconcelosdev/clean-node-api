import { setupApp } from '@/main/config/app'
import { MongoHelper } from '@/infra/db'
import { mockAccessToken } from '@/tests/main/mock-access-token'
import { type Collection, ObjectId } from 'mongodb'
import { type Express } from 'express'
import request from 'supertest'

let surveyCollection: Collection
let app: Express

const mockSurveyId = async (): Promise<string> => {
  const res = await surveyCollection.insertOne({
    question: 'Question',
    answers: [
      { answer: 'Answer 1', image: 'http://image-name.com' },
      { answer: 'Answer 2' }
    ],
    date: new Date()
  })
  return res.insertedId.toHexString()
}

describe('SurveyResult Routes', () => {
  beforeAll(async () => {
    app = await setupApp()
    await MongoHelper.connect(process.env.MONGO_URL!)
  })

  afterAll(async () => {
    await MongoHelper.disconnect()
  })

  beforeEach(async () => {
    surveyCollection = MongoHelper.getCollection('surveys')
    await surveyCollection.deleteMany({})
    await MongoHelper.getCollection('surveyResults').deleteMany({})
    await MongoHelper.getCollection('accounts').deleteMany({})
  })

  describe('PUT /surveys/:surveyId/results', () => {
    test('Should return 403 on save survey result without accessToken', async () => {
      await request(app)
        .put('/api/surveys/any_id/results')
        .send({ answer: 'any_answer' })
        .expect(403)
    })

    test('Should return 200 on save survey result with accessToken', async () => {
      const accessToken = await mockAccessToken()
      const surveyId = await mockSurveyId()
      const response = await request(app)
        .put(`/api/surveys/${surveyId}/results`)
        .set('x-access-token', accessToken)
        .send({ answer: 'Answer 1' })
      expect(response.status).toBe(200)
      expect(response.body.answers[0].count).toBe(1)
      expect(response.body.answers[0].percent).toBe(100)
      expect(response.body.answers[0].isCurrentAccountAnswer).toBe(true)
    })

    test('Should return 403 on save survey result with an invalid answer', async () => {
      const accessToken = await mockAccessToken()
      const surveyId = await mockSurveyId()
      await request(app)
        .put(`/api/surveys/${surveyId}/results`)
        .set('x-access-token', accessToken)
        .send({ answer: 'invalid_answer' })
        .expect(403)
    })

    test('Should return 403 on save survey result for an unknown survey', async () => {
      const accessToken = await mockAccessToken()
      await request(app)
        .put(`/api/surveys/${new ObjectId().toHexString()}/results`)
        .set('x-access-token', accessToken)
        .send({ answer: 'Answer 1' })
        .expect(403)
    })
  })

  describe('GET /surveys/:surveyId/results', () => {
    test('Should return 403 on load survey result without accessToken', async () => {
      await request(app).get('/api/surveys/any_id/results').expect(403)
    })

    test('Should return 200 on load survey result with accessToken', async () => {
      const accessToken = await mockAccessToken()
      const surveyId = await mockSurveyId()
      const response = await request(app)
        .get(`/api/surveys/${surveyId}/results`)
        .set('x-access-token', accessToken)
      expect(response.status).toBe(200)
      expect(response.body.answers).toHaveLength(2)
      expect(response.body.answers[0].count).toBe(0)
    })

    test('Should return 403 on load survey result for an unknown survey', async () => {
      const accessToken = await mockAccessToken()
      await request(app)
        .get(`/api/surveys/${new ObjectId().toHexString()}/results`)
        .set('x-access-token', accessToken)
        .expect(403)
    })
  })
})
