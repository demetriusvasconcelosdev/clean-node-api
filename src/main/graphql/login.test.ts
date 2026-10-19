import { setupApp } from '@/main/config/app'
import { MongoHelper } from '@/infra/db'
import { type Collection } from 'mongodb'
import { hash } from 'bcrypt'
import { type Express } from 'express'
import request from 'supertest'

let accountCollection: Collection
let app: Express

describe('Login GraphQL', () => {
  beforeAll(async () => {
    app = await setupApp()
    await MongoHelper.connect(process.env.MONGO_URL!)
  })

  afterAll(async () => {
    await MongoHelper.disconnect()
  })

  beforeEach(async () => {
    accountCollection = MongoHelper.getCollection('accounts')
    await accountCollection.deleteMany({})
  })

  describe('Login Query', () => {
    const query = `query {
      login (email: "demetrius@mail.com", password: "123") {
        accessToken
        name
      }
    }`

    test('Should return an Account on valid credentials', async () => {
      const password = await hash('123', 12)
      await accountCollection.insertOne({
        name: 'Demetrius',
        email: 'demetrius@mail.com',
        password
      })
      const res = await request(app).post('/graphql').send({ query })
      expect(res.status).toBe(200)
      expect(res.body.data.login.accessToken).toBeTruthy()
      expect(res.body.data.login.name).toBe('Demetrius')
    })

    test('Should return 401 on invalid credentials', async () => {
      const res = await request(app).post('/graphql').send({ query })
      expect(res.status).toBe(401)
      expect(res.body.data).toBeFalsy()
      expect(res.body.errors[0].message).toBe('Unauthorized')
      expect(res.body.errors[0].extensions.stacktrace).toBeUndefined()
    })
  })

  describe('SignUp Mutation', () => {
    const query = `mutation {
      signUp (name: "Demetrius", email: "demetrius@mail.com", password: "123", passwordConfirmation: "123") {
        accessToken
        name
      }
    }`

    test('Should return an Account on valid data', async () => {
      const res = await request(app).post('/graphql').send({ query })
      expect(res.status).toBe(200)
      expect(res.body.data.signUp.accessToken).toBeTruthy()
      expect(res.body.data.signUp.name).toBe('Demetrius')
    })

    test('Should return 403 if the email is already in use', async () => {
      await request(app).post('/graphql').send({ query })
      const res = await request(app).post('/graphql').send({ query })
      expect(res.status).toBe(403)
      expect(res.body.data).toBeFalsy()
      expect(res.body.errors[0].message).toBe(
        'The received email is already in use'
      )
    })
  })
})
