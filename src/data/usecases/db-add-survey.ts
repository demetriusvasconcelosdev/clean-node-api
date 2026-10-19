import { type AddSurvey } from '@/domain/usecases'
import { type AddSurveyRepository } from '@/data/protocols'

export class DbAddSurvey implements AddSurvey {
  constructor(private readonly addSurveyRepository: AddSurveyRepository) {}

  async add(data: AddSurvey.Params): Promise<void> {
    await this.addSurveyRepository.add(data)
  }
}
