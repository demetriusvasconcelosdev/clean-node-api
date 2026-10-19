import {
  makeDbCheckSurveyById,
  makeDbLoadSurveyResult
} from '@/main/factories/usecases'
import { makeLogControllerDecorator } from '@/main/factories/decorators'
import { LoadSurveyResultController } from '@/presentation/controllers'
import { type Controller } from '@/presentation/protocols'

export const makeLoadSurveyResultController = (): Controller => {
  const controller = new LoadSurveyResultController(
    makeDbCheckSurveyById(),
    makeDbLoadSurveyResult()
  )
  return makeLogControllerDecorator(controller)
}
