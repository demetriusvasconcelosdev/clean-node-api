import type { HttpRequest, HttpResponse } from '../protocols/http'

export class SignUpController {
  handle(httpRequest: HttpRequest): HttpResponse {
    if (httpRequest.body?.name === undefined) {
      return {
        statusCode: 400,
        body: 'Missing param: name'
      }
    }

    if (httpRequest.body?.email === undefined) {
      return {
        statusCode: 400,
        body: 'Missing param: email'
      }
    }

    return {
      statusCode: 200,
      body: {}
    }
  }
}
