import { type Controller, type HttpResponse } from '@/presentation/protocols'
import { noContent, ok, serverError } from '@/presentation/helpers'
import { type LoadSurveys } from '@/domain/usecases'

export class LoadSurveysController implements Controller {
  constructor(private readonly loadSurveys: LoadSurveys) {}

  async handle(request: LoadSurveysController.Request): Promise<HttpResponse> {
    try {
      const surveys = await this.loadSurveys.load(request.accountId)
      return surveys.length > 0 ? ok(surveys) : noContent()
    } catch (error) {
      return serverError(error as Error)
    }
  }
}

export namespace LoadSurveysController {
  export interface Request {
    accountId: string
  }
}
