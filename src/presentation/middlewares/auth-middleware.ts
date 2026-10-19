import { type HttpResponse, type Middleware } from '@/presentation/protocols'
import { forbidden, ok, serverError } from '@/presentation/helpers'
import { AccessDeniedError } from '@/presentation/errors'
import { type LoadAccountByToken } from '@/domain/usecases'

export class AuthMiddleware implements Middleware {
  constructor(
    private readonly loadAccountByToken: LoadAccountByToken,
    private readonly role?: string
  ) {}

  async handle(request: AuthMiddleware.Request): Promise<HttpResponse> {
    try {
      const { accessToken } = request
      if (accessToken !== undefined) {
        const account = await this.loadAccountByToken.load(
          accessToken,
          this.role
        )
        if (account !== null) {
          return ok({ accountId: account.id })
        }
      }
      return forbidden(new AccessDeniedError())
    } catch (error) {
      return serverError(error as Error)
    }
  }
}

export namespace AuthMiddleware {
  export interface Request {
    accessToken?: string
  }
}
