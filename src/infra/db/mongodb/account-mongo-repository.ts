import {
  type AddAccountRepository,
  type CheckAccountByEmailRepository,
  type LoadAccountByEmailRepository,
  type LoadAccountByTokenRepository,
  type UpdateAccessTokenRepository
} from '@/data/protocols'
import { MongoHelper } from './mongo-helper'
import { ObjectId } from 'mongodb'

export class AccountMongoRepository
  implements
    AddAccountRepository,
    LoadAccountByEmailRepository,
    UpdateAccessTokenRepository,
    LoadAccountByTokenRepository,
    CheckAccountByEmailRepository
{
  async add(
    data: AddAccountRepository.Params
  ): Promise<AddAccountRepository.Result> {
    const accountCollection = MongoHelper.getCollection('accounts')
    const result = await accountCollection.insertOne({ ...data })
    return result.insertedId !== null
  }

  async loadByEmail(
    email: string
  ): Promise<LoadAccountByEmailRepository.Result | null> {
    const accountCollection = MongoHelper.getCollection('accounts')
    const account = await accountCollection.findOne(
      { email },
      { projection: { _id: 1, name: 1, password: 1 } }
    )
    return account !== null ? MongoHelper.map(account) : null
  }

  async checkByEmail(
    email: string
  ): Promise<CheckAccountByEmailRepository.Result> {
    const accountCollection = MongoHelper.getCollection('accounts')
    const account = await accountCollection.findOne(
      { email },
      { projection: { _id: 1 } }
    )
    return account !== null
  }

  async updateAccessToken(id: string, token: string): Promise<void> {
    const accountCollection = MongoHelper.getCollection('accounts')
    await accountCollection.updateOne(
      { _id: new ObjectId(id) },
      { $set: { accessToken: token } }
    )
  }

  async loadByToken(
    token: string,
    role?: string
  ): Promise<LoadAccountByTokenRepository.Result | null> {
    const accountCollection = MongoHelper.getCollection('accounts')
    const account = await accountCollection.findOne(
      {
        accessToken: token,
        $or: [{ role }, { role: 'admin' }]
      },
      { projection: { _id: 1 } }
    )
    return account !== null ? MongoHelper.map(account) : null
  }
}
