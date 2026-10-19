import {
  type AddSurvey,
  type CheckSurveyById,
  type LoadAnswersBySurvey,
  type LoadSurveys
} from '@/domain/usecases'
import { mockSurveyModels } from '@/tests/domain/mocks'
import { faker } from '@faker-js/faker'

export class AddSurveySpy implements AddSurvey {
  addSurveyParams!: AddSurvey.Params

  async add(params: AddSurvey.Params): Promise<void> {
    this.addSurveyParams = params
  }
}

export class LoadSurveysSpy implements LoadSurveys {
  accountId!: string
  surveyModels = mockSurveyModels()

  async load(accountId: string): Promise<LoadSurveys.Result> {
    this.accountId = accountId
    return this.surveyModels
  }
}

export class LoadAnswersBySurveySpy implements LoadAnswersBySurvey {
  result = [faker.word.sample(), faker.word.sample()]
  id!: string

  async loadAnswers(id: string): Promise<LoadAnswersBySurvey.Result> {
    this.id = id
    return this.result
  }
}

export class CheckSurveyByIdSpy implements CheckSurveyById {
  result = true
  id!: string

  async checkById(id: string): Promise<CheckSurveyById.Result> {
    this.id = id
    return this.result
  }
}
