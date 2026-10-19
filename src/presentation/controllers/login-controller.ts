import {
  type Controller,
  type HttpResponse,
  type Validation
} from '@/presentation/protocols'
import {
  badRequest,
  ok,
  serverError,
  unauthorized
} from '@/presentation/helpers'
import { type Authentication } from '@/domain/usecases'

export class LoginController implements Controller {
  constructor(
    private readonly authentication: Authentication,
    private readonly validation: Validation
  ) {}

  async handle(request: LoginController.Request): Promise<HttpResponse> {
    try {
      const error = this.validation.validate(request)
      if (error !== undefined) {
        return badRequest(error)
      }
      const authenticationModel = await this.authentication.auth(request)
      if (authenticationModel === null) {
        return unauthorized()
      }
      return ok(authenticationModel)
    } catch (error) {
      return serverError(error as Error)
    }
  }
}

export namespace LoginController {
  export interface Request {
    email: string
    password: string
  }
}
