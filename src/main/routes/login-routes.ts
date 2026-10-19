import { adaptRoute } from '@/main/adapters'
import { makeLoginController, makeSignUpController } from '@/main/factories'
import { type Router } from 'express'

export default (router: Router): void => {
  router.post('/signup', adaptRoute(makeSignUpController()))
  router.post('/login', adaptRoute(makeLoginController()))
}
