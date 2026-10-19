import { makeDbAuthentication } from '@/main/factories/usecases'
import { makeLogControllerDecorator } from '@/main/factories/decorators'
import { makeLoginValidation } from './login-validation-factory'
import { LoginController } from '@/presentation/controllers'
import { type Controller } from '@/presentation/protocols'

export const makeLoginController = (): Controller => {
  const controller = new LoginController(
    makeDbAuthentication(),
    makeLoginValidation()
  )
  return makeLogControllerDecorator(controller)
}
