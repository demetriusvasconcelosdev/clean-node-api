import { MongoHelper } from './mongo-helper'
import { ObjectId } from 'mongodb'

describe('MongoHelper', () => {
  beforeAll(async () => {
    await MongoHelper.connect(process.env.MONGO_URL!)
  })

  afterAll(async () => {
    await MongoHelper.disconnect()
  })

  test('Should throw if getCollection is called while disconnected', async () => {
    await MongoHelper.disconnect()
    expect(() => MongoHelper.getCollection('any_collection')).toThrow()
    await MongoHelper.connect(process.env.MONGO_URL!)
  })

  test('Should return a collection when connected', () => {
    const collection = MongoHelper.getCollection('any_collection')
    expect(collection.collectionName).toBe('any_collection')
  })

  test('Should map _id to id', () => {
    const _id = new ObjectId()
    expect(MongoHelper.map({ _id, name: 'any_name' })).toEqual({
      id: _id.toHexString(),
      name: 'any_name'
    })
  })

  test('Should map every document of a collection', () => {
    const _id = new ObjectId()
    expect(MongoHelper.mapCollection([{ _id }])).toEqual([
      { id: _id.toHexString() }
    ])
  })
})
