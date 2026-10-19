import { type LoadSurveyResult, type SaveSurveyResult } from '@/domain/usecases'
import { mockSurveyResultModel } from '@/tests/domain/mocks'

export class SaveSurveyResultSpy implements SaveSurveyResult {
  saveSurveyResultParams!: SaveSurveyResult.Params
  surveyResultModel = mockSurveyResultModel()

  async save(data: SaveSurveyResult.Params): Promise<SaveSurveyResult.Result> {
    this.saveSurveyResultParams = data
    return this.surveyResultModel
  }
}

export class LoadSurveyResultSpy implements LoadSurveyResult {
  surveyId!: string
  accountId!: string
  surveyResultModel = mockSurveyResultModel()

  async load(
    surveyId: string,
    accountId: string
  ): Promise<LoadSurveyResult.Result> {
    this.surveyId = surveyId
    this.accountId = accountId
    return this.surveyResultModel
  }
}
