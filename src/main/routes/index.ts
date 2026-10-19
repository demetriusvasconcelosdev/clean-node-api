import loginRoutes from './login-routes'
import surveyRoutes from './survey-routes'
import surveyResultRoutes from './survey-result-routes'
import { type Router } from 'express'

export const routes: Array<(router: Router) => void> = [
  loginRoutes,
  surveyRoutes,
  surveyResultRoutes
]
