import loginRoutes from './login-routes'
import surveyRoutes from './survey-routes'
import { type Router } from 'express'

export const routes: Array<(router: Router) => void> = [
  loginRoutes,
  surveyRoutes
]
