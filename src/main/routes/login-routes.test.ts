import { setupApp } from '@/main/config/app'
import { MongoHelper } from '@/infra/db'
import { type Collection } from 'mongodb'
import { hash } from 'bcrypt'
import { type Express } from 'express'
import request from 'supertest'

let accountCollection: Collection
let app: Express

describe('Login Routes', () => {
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

  describe('POST /signup', () => {
    test('Should return 200 on signup', async () => {
      const response = await request(app).post('/api/signup').send({
        name: 'Demetrius',
        email: 'demetrius@mail.com',
        password: '123',
        passwordConfirmation: '123'
      })
      expect(response.status).toBe(200)
      expect(response.body.accessToken).toBeTruthy()
      expect(response.body.name).toBe('Demetrius')
    })

    test('Should return 403 on signup if the email is already in use', async () => {
      const body = {
        name: 'Demetrius',
        email: 'demetrius@mail.com',
        password: '123',
        passwordConfirmation: '123'
      }
      await request(app).post('/api/signup').send(body)
      await request(app).post('/api/signup').send(body).expect(403)
    })

    test('Should return 400 on signup if the passwords do not match', async () => {
      await request(app)
        .post('/api/signup')
        .send({
          name: 'Demetrius',
          email: 'demetrius@mail.com',
          password: '123',
          passwordConfirmation: '456'
        })
        .expect(400)
    })
  })

  describe('POST /login', () => {
    test('Should return 200 on login', async () => {
      const password = await hash('123', 12)
      await accountCollection.insertOne({
        name: 'Demetrius',
        email: 'demetrius@mail.com',
        password
      })
      const response = await request(app).post('/api/login').send({
        email: 'demetrius@mail.com',
        password: '123'
      })
      expect(response.status).toBe(200)
      expect(response.body.accessToken).toBeTruthy()
    })

    test('Should return 401 on login with invalid credentials', async () => {
      await request(app)
        .post('/api/login')
        .send({ email: 'demetrius@mail.com', password: '123' })
        .expect(401)
    })

    test('Should return 400 on login without a password', async () => {
      await request(app)
        .post('/api/login')
        .send({ email: 'demetrius@mail.com' })
        .expect(400)
    })
  })
})
