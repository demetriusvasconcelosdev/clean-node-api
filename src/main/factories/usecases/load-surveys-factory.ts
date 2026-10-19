import { SurveyMongoRepository } from '@/infra/db'
import { type LoadSurveys } from '@/domain/usecases'
import { DbLoadSurveys } from '@/data/usecases'

export const makeDbLoadSurveys = (): LoadSurveys => {
  const surveyMongoRepository = new SurveyMongoRepository()
  return new DbLoadSurveys(surveyMongoRepository)
}
