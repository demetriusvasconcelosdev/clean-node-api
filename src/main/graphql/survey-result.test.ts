import { setupApp } from '@/main/config/app'
import { MongoHelper } from '@/infra/db'
import { mockAccessToken } from '@/tests/main/mock-access-token'
import { type Express } from 'express'
import request from 'supertest'

let app: Express

const mockSurveyId = async (): Promise<string> => {
  const res = await MongoHelper.getCollection('surveys').insertOne({
    question: 'Question',
    answers: [
      { answer: 'Answer 1', image: 'http://image-name.com' },
      { answer: 'Answer 2' }
    ],
    date: new Date()
  })
  return res.insertedId.toHexString()
}

describe('SurveyResult GraphQL', () => {
  beforeAll(async () => {
    app = await setupApp()
    await MongoHelper.connect(process.env.MONGO_URL!)
  })

  afterAll(async () => {
    await MongoHelper.disconnect()
  })

  beforeEach(async () => {
    await MongoHelper.getCollection('surveys').deleteMany({})
    await MongoHelper.getCollection('surveyResults').deleteMany({})
    await MongoHelper.getCollection('accounts').deleteMany({})
  })

  describe('SurveyResult Query', () => {
    test('Should return a SurveyResult', async () => {
      const accessToken = await mockAccessToken()
      const surveyId = await mockSurveyId()
      const query = `query {
        surveyResult (surveyId: "${surveyId}") {
          surveyId
          question
          answers {
            answer
            count
            percent
            isCurrentAccountAnswer
          }
          date
        }
      }`
      const res = await request(app)
        .post('/graphql')
        .set('x-access-token', accessToken)
        .send({ query })
      expect(res.status).toBe(200)
      expect(res.body.data.surveyResult.question).toBe('Question')
      expect(res.body.data.surveyResult.answers).toEqual([
        {
          answer: 'Answer 1',
          count: 0,
          percent: 0,
          isCurrentAccountAnswer: false
        },
        {
          answer: 'Answer 2',
          count: 0,
          percent: 0,
          isCurrentAccountAnswer: false
        }
      ])
    })

    test('Should return 403 without an accessToken', async () => {
      const query = `query {
        surveyResult (surveyId: "any_id") {
          surveyId
        }
      }`
      const res = await request(app).post('/graphql').send({ query })
      expect(res.status).toBe(403)
      expect(res.body.errors[0].message).toBe('Access denied')
    })
  })

  describe('SaveSurveyResult Mutation', () => {
    test('Should save and return a SurveyResult', async () => {
      const accessToken = await mockAccessToken()
      const surveyId = await mockSurveyId()
      const query = `mutation {
        saveSurveyResult (surveyId: "${surveyId}", answer: "Answer 1") {
          surveyId
          answers {
            answer
            count
            percent
            isCurrentAccountAnswer
          }
        }
      }`
      const res = await request(app)
        .post('/graphql')
        .set('x-access-token', accessToken)
        .send({ query })
      expect(res.status).toBe(200)
      expect(res.body.data.saveSurveyResult.surveyId).toBe(surveyId)
      expect(res.body.data.saveSurveyResult.answers[0]).toEqual({
        answer: 'Answer 1',
        count: 1,
        percent: 100,
        isCurrentAccountAnswer: true
      })
    })

    test('Should return 403 on an invalid answer', async () => {
      const accessToken = await mockAccessToken()
      const surveyId = await mockSurveyId()
      const query = `mutation {
        saveSurveyResult (surveyId: "${surveyId}", answer: "invalid") {
          surveyId
        }
      }`
      const res = await request(app)
        .post('/graphql')
        .set('x-access-token', accessToken)
        .send({ query })
      expect(res.status).toBe(403)
      expect(res.body.errors[0].message).toBe('Invalid Param: answer')
    })
  })
})
