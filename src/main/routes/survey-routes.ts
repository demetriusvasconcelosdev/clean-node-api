import { adaptRoute } from '@/main/adapters'
import {
  makeAddSurveyController,
  makeLoadSurveysController
} from '@/main/factories'
import { adminAuth, auth } from '@/main/middlewares'
import { type Router } from 'express'

export default (router: Router): void => {
  router.post('/surveys', adminAuth, adaptRoute(makeAddSurveyController()))
  router.get('/surveys', auth, adaptRoute(makeLoadSurveysController()))
}
