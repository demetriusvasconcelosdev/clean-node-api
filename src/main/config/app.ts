import setupMiddlewares from '@/main/config/middlewares'
import setupRoutes from '@/main/config/routes'
import express, { type Express } from 'express'

export const setupApp = (): Express => {
  const app = express()
  setupMiddlewares(app)
  setupRoutes(app)
  return app
}
