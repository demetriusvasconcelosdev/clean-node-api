import { AccountMongoRepository } from './account-mongo-repository'
import { MongoHelper } from './mongo-helper'
import { mockAddAccountParams } from '@/tests/domain/mocks'
import { type Collection } from 'mongodb'
import { faker } from '@faker-js/faker'

const makeSut = (): AccountMongoRepository => new AccountMongoRepository()

let accountCollection: Collection

describe('AccountMongoRepository', () => {
  beforeAll(async () => {
    await MongoHelper.connect(process.env.MONGO_URL!)
  })

  afterAll(async () => {
    await MongoHelper.disconnect()
  })

  beforeEach(async () => {
    accountCollection = MongoHelper.getCollection('accounts')
    await accountCollection.deleteMany({})
  })

  describe('add()', () => {
    test('Should return true on success', async () => {
      const sut = makeSut()
      const isValid = await sut.add(mockAddAccountParams())
      expect(isValid).toBe(true)
    })
  })

  describe('loadByEmail()', () => {
    test('Should return an account on success', async () => {
      const sut = makeSut()
      const addAccountParams = mockAddAccountParams()
      await accountCollection.insertOne({ ...addAccountParams })
      const account = await sut.loadByEmail(addAccountParams.email)
      expect(account).toBeTruthy()
      expect(account?.id).toBeTruthy()
      expect(account?.name).toBe(addAccountParams.name)
      expect(account?.password).toBe(addAccountParams.password)
    })

    test('Should return null if loadByEmail fails', async () => {
      const sut = makeSut()
      const account = await sut.loadByEmail(faker.internet.email())
      expect(account).toBeNull()
    })
  })

  describe('checkByEmail()', () => {
    test('Should return true if email is found', async () => {
      const sut = makeSut()
      const addAccountParams = mockAddAccountParams()
      await accountCollection.insertOne({ ...addAccountParams })
      const exists = await sut.checkByEmail(addAccountParams.email)
      expect(exists).toBe(true)
    })

    test('Should return false if email is not found', async () => {
      const sut = makeSut()
      const exists = await sut.checkByEmail(faker.internet.email())
      expect(exists).toBe(false)
    })
  })

  describe('updateAccessToken()', () => {
    test('Should update the account accessToken on success', async () => {
      const sut = makeSut()
      const res = await accountCollection.insertOne({
        ...mockAddAccountParams()
      })
      const fakeAccount = await accountCollection.findOne({
        _id: res.insertedId
      })
      expect(fakeAccount?.accessToken).toBeFalsy()
      const accessToken = faker.string.uuid()
      await sut.updateAccessToken(res.insertedId.toHexString(), accessToken)
      const account = await accountCollection.findOne({ _id: res.insertedId })
      expect(account).toBeTruthy()
      expect(account?.accessToken).toBe(accessToken)
    })
  })

  describe('loadByToken()', () => {
    let accessToken: string

    beforeEach(() => {
      accessToken = faker.string.uuid()
    })

    test('Should return an account on loadByToken without role', async () => {
      const sut = makeSut()
      await accountCollection.insertOne({
        ...mockAddAccountParams(),
        accessToken
      })
      const account = await sut.loadByToken(accessToken)
      expect(account).toBeTruthy()
      expect(account?.id).toBeTruthy()
    })

    test('Should return an account on loadByToken with admin role', async () => {
      const sut = makeSut()
      await accountCollection.insertOne({
        ...mockAddAccountParams(),
        accessToken,
        role: 'admin'
      })
      const account = await sut.loadByToken(accessToken, 'admin')
      expect(account).toBeTruthy()
      expect(account?.id).toBeTruthy()
    })

    test('Should return null on loadByToken with invalid role', async () => {
      const sut = makeSut()
      await accountCollection.insertOne({
        ...mockAddAccountParams(),
        accessToken
      })
      const account = await sut.loadByToken(accessToken, 'admin')
      expect(account).toBeNull()
    })

    test('Should return an account on loadByToken if user is admin', async () => {
      const sut = makeSut()
      await accountCollection.insertOne({
        ...mockAddAccountParams(),
        accessToken,
        role: 'admin'
      })
      const account = await sut.loadByToken(accessToken)
      expect(account).toBeTruthy()
      expect(account?.id).toBeTruthy()
    })

    test('Should return null if loadByToken fails', async () => {
      const sut = makeSut()
      const account = await sut.loadByToken(accessToken)
      expect(account).toBeNull()
    })
  })
})
