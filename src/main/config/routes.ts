import { routes } from '@/main/routes'
import { type Express, Router } from 'express'

export default (app: Express): void => {
  const router = Router()
  app.use('/api', router)
  routes.forEach((setupRoute) => {
    setupRoute(router)
  })
}
