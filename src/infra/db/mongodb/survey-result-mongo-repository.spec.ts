import { SurveyResultMongoRepository } from './survey-result-mongo-repository'
import { MongoHelper } from './mongo-helper'
import { type SurveyModel } from '@/domain/models'
import { mockAddAccountParams, mockAddSurveyParams } from '@/tests/domain/mocks'
import { type Collection, ObjectId } from 'mongodb'

let surveyCollection: Collection
let surveyResultCollection: Collection
let accountCollection: Collection

const makeSut = (): SurveyResultMongoRepository =>
  new SurveyResultMongoRepository()

const mockSurvey = async (): Promise<SurveyModel> => {
  const res = await surveyCollection.insertOne({ ...mockAddSurveyParams() })
  const survey = await surveyCollection.findOne({ _id: res.insertedId })
  return MongoHelper.map(survey)
}

const mockAccountId = async (): Promise<string> => {
  const res = await accountCollection.insertOne({ ...mockAddAccountParams() })
  return res.insertedId.toHexString()
}

const mockResult = (
  surveyId: string,
  accountId: string,
  answer: string
): object => ({
  surveyId: new ObjectId(surveyId),
  accountId: new ObjectId(accountId),
  answer,
  date: new Date()
})

describe('SurveyResultMongoRepository', () => {
  beforeAll(async () => {
    await MongoHelper.connect(process.env.MONGO_URL!)
  })

  afterAll(async () => {
    await MongoHelper.disconnect()
  })

  beforeEach(async () => {
    surveyCollection = MongoHelper.getCollection('surveys')
    await surveyCollection.deleteMany({})
    surveyResultCollection = MongoHelper.getCollection('surveyResults')
    await surveyResultCollection.deleteMany({})
    accountCollection = MongoHelper.getCollection('accounts')
    await accountCollection.deleteMany({})
  })

  describe('save()', () => {
    test('Should add a survey result if it is new', async () => {
      const survey = await mockSurvey()
      const accountId = await mockAccountId()
      const sut = makeSut()
      await sut.save({
        surveyId: survey.id,
        accountId,
        answer: survey.answers[0].answer,
        date: new Date()
      })
      const surveyResult = await surveyResultCollection.findOne({
        surveyId: new ObjectId(survey.id),
        accountId: new ObjectId(accountId)
      })
      expect(surveyResult).toBeTruthy()
    })

    test('Should update the survey result if it is not new', async () => {
      const survey = await mockSurvey()
      const accountId = await mockAccountId()
      await surveyResultCollection.insertOne(
        mockResult(survey.id, accountId, survey.answers[0].answer)
      )
      const sut = makeSut()
      await sut.save({
        surveyId: survey.id,
        accountId,
        answer: survey.answers[1].answer,
        date: new Date()
      })
      const surveyResults = await surveyResultCollection
        .find({
          surveyId: new ObjectId(survey.id),
          accountId: new ObjectId(accountId)
        })
        .toArray()
      expect(surveyResults.length).toBe(1)
      expect(surveyResults[0].answer).toBe(survey.answers[1].answer)
    })
  })

  describe('loadBySurveyId()', () => {
    test('Should load the survey result when everyone picked the same answer', async () => {
      const survey = await mockSurvey()
      const accountId = await mockAccountId()
      const accountId2 = await mockAccountId()
      await surveyResultCollection.insertMany([
        mockResult(survey.id, accountId2, survey.answers[0].answer),
        mockResult(survey.id, accountId, survey.answers[0].answer)
      ])
      const sut = makeSut()
      const surveyResult = await sut.loadBySurveyId(survey.id, accountId)
      expect(surveyResult).toBeTruthy()
      expect(surveyResult?.surveyId).toEqual(survey.id)
      expect(surveyResult?.answers[0].count).toBe(2)
      expect(surveyResult?.answers[0].percent).toBe(100)
      expect(surveyResult?.answers[0].isCurrentAccountAnswer).toBe(true)
      expect(surveyResult?.answers[1].count).toBe(0)
      expect(surveyResult?.answers[1].percent).toBe(0)
      expect(surveyResult?.answers[1].isCurrentAccountAnswer).toBe(false)
      expect(surveyResult?.answers.length).toBe(survey.answers.length)
    })

    test('Should load the survey result with split answers and rounded percents', async () => {
      const survey = await mockSurvey()
      const accountId = await mockAccountId()
      const accountId2 = await mockAccountId()
      const accountId3 = await mockAccountId()
      await surveyResultCollection.insertMany([
        mockResult(survey.id, accountId, survey.answers[0].answer),
        mockResult(survey.id, accountId2, survey.answers[1].answer),
        mockResult(survey.id, accountId3, survey.answers[1].answer)
      ])
      const sut = makeSut()
      const surveyResult = await sut.loadBySurveyId(survey.id, accountId2)
      expect(surveyResult?.answers[0].count).toBe(2)
      expect(surveyResult?.answers[0].percent).toBe(67)
      expect(surveyResult?.answers[0].isCurrentAccountAnswer).toBe(true)
      expect(surveyResult?.answers[1].count).toBe(1)
      expect(surveyResult?.answers[1].percent).toBe(33)
      expect(surveyResult?.answers[1].isCurrentAccountAnswer).toBe(false)
    })

    test('Should mark no answer as the current account answer if the account did not answer', async () => {
      const survey = await mockSurvey()
      const accountId = await mockAccountId()
      const accountId2 = await mockAccountId()
      const accountId3 = await mockAccountId()
      await surveyResultCollection.insertMany([
        mockResult(survey.id, accountId, survey.answers[0].answer),
        mockResult(survey.id, accountId2, survey.answers[1].answer)
      ])
      const sut = makeSut()
      const surveyResult = await sut.loadBySurveyId(survey.id, accountId3)
      expect(surveyResult?.answers[0].count).toBe(1)
      expect(surveyResult?.answers[0].percent).toBe(50)
      expect(surveyResult?.answers[0].isCurrentAccountAnswer).toBe(false)
      expect(surveyResult?.answers[1].count).toBe(1)
      expect(surveyResult?.answers[1].percent).toBe(50)
      expect(surveyResult?.answers[1].isCurrentAccountAnswer).toBe(false)
    })

    test('Should return null if there is no survey result', async () => {
      const survey = await mockSurvey()
      const accountId = await mockAccountId()
      const sut = makeSut()
      const surveyResult = await sut.loadBySurveyId(survey.id, accountId)
      expect(surveyResult).toBeNull()
    })
  })
})
