import { LogControllerDecorator } from './log-controller-decorator'
import { type LogErrorRepository } from '@/data/protocols'
import { type Controller, type HttpResponse } from '@/presentation/protocols'
import { ok, serverError } from '@/presentation/helpers'
import { faker } from '@faker-js/faker'

class ControllerSpy implements Controller {
  httpResponse: HttpResponse = ok(faker.string.uuid())
  request: any

  async handle(request: any): Promise<HttpResponse> {
    this.request = request
    return this.httpResponse
  }
}

class LogErrorRepositorySpy implements LogErrorRepository {
  stack!: string

  async logError(stack: string): Promise<void> {
    this.stack = stack
  }
}

interface SutTypes {
  sut: LogControllerDecorator
  controllerSpy: ControllerSpy
  logErrorRepositorySpy: LogErrorRepositorySpy
}

const makeSut = (): SutTypes => {
  const controllerSpy = new ControllerSpy()
  const logErrorRepositorySpy = new LogErrorRepositorySpy()
  const sut = new LogControllerDecorator(controllerSpy, logErrorRepositorySpy)
  return { sut, controllerSpy, logErrorRepositorySpy }
}

describe('LogController Decorator', () => {
  test('Should call the controller handle with the request', async () => {
    const { sut, controllerSpy } = makeSut()
    const request = { any: faker.lorem.word() }
    await sut.handle(request)
    expect(controllerSpy.request).toEqual(request)
  })

  test('Should return the same result as the controller', async () => {
    const { sut, controllerSpy } = makeSut()
    const httpResponse = await sut.handle({})
    expect(httpResponse).toEqual(controllerSpy.httpResponse)
  })

  test('Should call LogErrorRepository with the stack if the controller returns a server error', async () => {
    const { sut, controllerSpy, logErrorRepositorySpy } = makeSut()
    const fakeError = new Error()
    fakeError.stack = faker.lorem.sentence()
    controllerSpy.httpResponse = serverError(fakeError)
    await sut.handle({})
    expect(logErrorRepositorySpy.stack).toBe(fakeError.stack)
  })
})
