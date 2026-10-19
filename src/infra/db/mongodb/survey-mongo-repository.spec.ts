import { SurveyMongoRepository } from './survey-mongo-repository'
import { MongoHelper } from './mongo-helper'
import { mockAddAccountParams, mockAddSurveyParams } from '@/tests/domain/mocks'
import { type Collection, ObjectId } from 'mongodb'

let surveyCollection: Collection
let surveyResultCollection: Collection
let accountCollection: Collection

const mockAccountId = async (): Promise<string> => {
  const res = await accountCollection.insertOne({ ...mockAddAccountParams() })
  return res.insertedId.toHexString()
}

const makeSut = (): SurveyMongoRepository => new SurveyMongoRepository()

describe('SurveyMongoRepository', () => {
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

  describe('add()', () => {
    test('Should add a survey on success', async () => {
      const sut = makeSut()
      await sut.add(mockAddSurveyParams())
      const count = await surveyCollection.countDocuments()
      expect(count).toBe(1)
    })
  })

  describe('loadAll()', () => {
    test('Should load all surveys on success', async () => {
      const accountId = await mockAccountId()
      const addSurveyModels = [mockAddSurveyParams(), mockAddSurveyParams()]
      const result = await surveyCollection.insertMany(
        addSurveyModels.map((survey) => ({ ...survey }))
      )
      const survey = await surveyCollection.findOne({
        _id: result.insertedIds[0]
      })
      await surveyResultCollection.insertOne({
        surveyId: survey?._id,
        accountId: new ObjectId(accountId),
        answer: survey?.answers[0].answer,
        date: new Date()
      })
      const sut = makeSut()
      const surveys = await sut.loadAll(accountId)
      expect(surveys.length).toBe(2)
      expect(surveys[0].id).toBeTruthy()
      expect(surveys[0].question).toBe(addSurveyModels[0].question)
      expect(surveys[0].didAnswer).toBe(true)
      expect(surveys[1].question).toBe(addSurveyModels[1].question)
      expect(surveys[1].didAnswer).toBe(false)
    })

    test('Should load an empty list', async () => {
      const accountId = await mockAccountId()
      const sut = makeSut()
      const surveys = await sut.loadAll(accountId)
      expect(surveys.length).toBe(0)
    })
  })

  describe('loadById()', () => {
    test('Should load a survey by id on success', async () => {
      const res = await surveyCollection.insertOne({ ...mockAddSurveyParams() })
      const sut = makeSut()
      const survey = await sut.loadById(res.insertedId.toHexString())
      expect(survey).toBeTruthy()
      expect(survey.id).toBe(res.insertedId.toHexString())
    })
  })

  describe('loadAnswers()', () => {
    test('Should load answers on success', async () => {
      const res = await surveyCollection.insertOne({ ...mockAddSurveyParams() })
      const survey = await surveyCollection.findOne({ _id: res.insertedId })
      const sut = makeSut()
      const answers = await sut.loadAnswers(res.insertedId.toHexString())
      expect(answers).toEqual([
        survey?.answers[0].answer,
        survey?.answers[1].answer
      ])
    })

    test('Should return an empty array if the survey does not exist', async () => {
      const sut = makeSut()
      const answers = await sut.loadAnswers(new ObjectId().toHexString())
      expect(answers).toEqual([])
    })
  })

  describe('checkById()', () => {
    test('Should return true if the survey exists', async () => {
      const res = await surveyCollection.insertOne({ ...mockAddSurveyParams() })
      const sut = makeSut()
      const exists = await sut.checkById(res.insertedId.toHexString())
      expect(exists).toBe(true)
    })

    test('Should return false if the survey does not exist', async () => {
      const sut = makeSut()
      const exists = await sut.checkById(new ObjectId().toHexString())
      expect(exists).toBe(false)
    })
  })
})
