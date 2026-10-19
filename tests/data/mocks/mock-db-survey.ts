import {
  type AddSurveyRepository,
  type CheckSurveyByIdRepository,
  type LoadSurveysRepository
} from '@/data/protocols'
import { mockSurveyModels } from '@/tests/domain/mocks'

export class AddSurveyRepositorySpy implements AddSurveyRepository {
  params!: AddSurveyRepository.Params

  async add(params: AddSurveyRepository.Params): Promise<void> {
    this.params = params
  }
}

export class LoadSurveysRepositorySpy implements LoadSurveysRepository {
  accountId!: string
  result = mockSurveyModels()

  async loadAll(accountId: string): Promise<LoadSurveysRepository.Result> {
    this.accountId = accountId
    return this.result
  }
}

export class CheckSurveyByIdRepositorySpy implements CheckSurveyByIdRepository {
  id!: string
  result = true

  async checkById(id: string): Promise<CheckSurveyByIdRepository.Result> {
    this.id = id
    return this.result
  }
}
