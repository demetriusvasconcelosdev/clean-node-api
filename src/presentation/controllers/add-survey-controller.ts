import {
  type Controller,
  type HttpResponse,
  type Validation
} from '@/presentation/protocols'
import { badRequest, noContent, serverError } from '@/presentation/helpers'
import { type AddSurvey } from '@/domain/usecases'

export class AddSurveyController implements Controller {
  constructor(
    private readonly validation: Validation,
    private readonly addSurvey: AddSurvey
  ) {}

  async handle(request: AddSurveyController.Request): Promise<HttpResponse> {
    try {
      const error = this.validation.validate(request)
      if (error !== undefined) {
        return badRequest(error)
      }
      await this.addSurvey.add({ ...request, date: new Date() })
      return noContent()
    } catch (error) {
      return serverError(error as Error)
    }
  }
}

export namespace AddSurveyController {
  export interface Request {
    question: string
    answers: Answer[]
  }

  interface Answer {
    image?: string
    answer: string
  }
}
