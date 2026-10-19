import { makeDbAddSurvey } from '@/main/factories/usecases'
import { makeLogControllerDecorator } from '@/main/factories/decorators'
import { makeAddSurveyValidation } from './add-survey-validation-factory'
import { AddSurveyController } from '@/presentation/controllers'
import { type Controller } from '@/presentation/protocols'

export const makeAddSurveyController = (): Controller => {
  const controller = new AddSurveyController(
    makeAddSurveyValidation(),
    makeDbAddSurvey()
  )
  return makeLogControllerDecorator(controller)
}
