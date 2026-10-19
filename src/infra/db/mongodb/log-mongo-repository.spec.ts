import { LogMongoRepository } from './log-mongo-repository'
import { MongoHelper } from './mongo-helper'
import { type Collection } from 'mongodb'
import { faker } from '@faker-js/faker'

const makeSut = (): LogMongoRepository => new LogMongoRepository()

let errorCollection: Collection

describe('LogMongoRepository', () => {
  beforeAll(async () => {
    await MongoHelper.connect(process.env.MONGO_URL!)
  })

  afterAll(async () => {
    await MongoHelper.disconnect()
  })

  beforeEach(async () => {
    errorCollection = MongoHelper.getCollection('errors')
    await errorCollection.deleteMany({})
  })

  test('Should create an error log on success', async () => {
    const sut = makeSut()
    await sut.logError(faker.lorem.sentence())
    const count = await errorCollection.countDocuments()
    expect(count).toBe(1)
  })
})
