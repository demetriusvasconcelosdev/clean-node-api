import {
  makeDbAddAccount,
  makeDbAuthentication
} from '@/main/factories/usecases'
import { makeLogControllerDecorator } from '@/main/factories/decorators'
import { makeSignUpValidation } from './signup-validation-factory'
import { SignUpController } from '@/presentation/controllers'
import { type Controller } from '@/presentation/protocols'

export const makeSignUpController = (): Controller => {
  const controller = new SignUpController(
    makeDbAddAccount(),
    makeSignUpValidation(),
    makeDbAuthentication()
  )
  return makeLogControllerDecorator(controller)
}
