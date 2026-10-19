import { type AddSurveyRepository } from '@/data/protocols'

export class AddSurveyRepositorySpy implements AddSurveyRepository {
  params!: AddSurveyRepository.Params

  async add(params: AddSurveyRepository.Params): Promise<void> {
    this.params = params
  }
}
