import env from '@/main/config/env'
import { MongoHelper } from '@/infra/db'
import { sign } from 'jsonwebtoken'

export const mockAccessToken = async (role?: string): Promise<string> => {
  const accountCollection = MongoHelper.getCollection('accounts')
  const res = await accountCollection.insertOne({
    name: 'Demetrius',
    email: 'demetrius@mail.com',
    password: '123',
    ...(role !== undefined ? { role } : {})
  })
  const accessToken = sign({ id: res.insertedId.toHexString() }, env.jwtSecret)
  await accountCollection.updateOne(
    { _id: res.insertedId },
    { $set: { accessToken } }
  )
  return accessToken
}
