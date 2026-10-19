import { SaveSurveyResultController } from './save-survey-result-controller'
import { forbidden, ok, serverError } from '@/presentation/helpers'
import { InvalidParamError } from '@/presentation/errors'
import {
  LoadAnswersBySurveySpy,
  SaveSurveyResultSpy
} from '@/tests/presentation/mocks'
import { throwError } from '@/tests/domain/mocks'
import { faker } from '@faker-js/faker'

interface SutTypes {
  sut: SaveSurveyResultController
  loadAnswersBySurveySpy: LoadAnswersBySurveySpy
  saveSurveyResultSpy: SaveSurveyResultSpy
}

const makeSut = (): SutTypes => {
  const loadAnswersBySurveySpy = new LoadAnswersBySurveySpy()
  const saveSurveyResultSpy = new SaveSurveyResultSpy()
  const sut = new SaveSurveyResultController(
    loadAnswersBySurveySpy,
    saveSurveyResultSpy
  )
  return { sut, loadAnswersBySurveySpy, saveSurveyResultSpy }
}

const mockRequest = (answer: string): SaveSurveyResultController.Request => ({
  surveyId: faker.string.uuid(),
  accountId: faker.string.uuid(),
  answer
})

describe('SaveSurveyResult Controller', () => {
  beforeAll(() => {
    jest.useFakeTimers().setSystemTime(new Date())
  })

  afterAll(() => {
    jest.useRealTimers()
  })

  test('Should call LoadAnswersBySurvey with the survey id', async () => {
    const { sut, loadAnswersBySurveySpy } = makeSut()
    const request = mockRequest(loadAnswersBySurveySpy.result[0])
    await sut.handle(request)
    expect(loadAnswersBySurveySpy.id).toBe(request.surveyId)
  })

  test('Should return 403 if LoadAnswersBySurvey returns an empty list', async () => {
    const { sut, loadAnswersBySurveySpy } = makeSut()
    loadAnswersBySurveySpy.result = []
    const httpResponse = await sut.handle(mockRequest('any_answer'))
    expect(httpResponse).toEqual(forbidden(new InvalidParamError('surveyId')))
  })

  test('Should return 500 if LoadAnswersBySurvey throws', async () => {
    const { sut, loadAnswersBySurveySpy } = makeSut()
    jest
      .spyOn(loadAnswersBySurveySpy, 'loadAnswers')
      .mockImplementationOnce(throwError)
    const httpResponse = await sut.handle(mockRequest('any_answer'))
    expect(httpResponse).toEqual(serverError(new Error()))
  })

  test('Should return 403 if an invalid answer is provided', async () => {
    const { sut } = makeSut()
    const httpResponse = await sut.handle(mockRequest('invalid_answer'))
    expect(httpResponse).toEqual(forbidden(new InvalidParamError('answer')))
  })

  test('Should call SaveSurveyResult with correct values', async () => {
    const { sut, loadAnswersBySurveySpy, saveSurveyResultSpy } = makeSut()
    const request = mockRequest(loadAnswersBySurveySpy.result[0])
    await sut.handle(request)
    expect(saveSurveyResultSpy.saveSurveyResultParams).toEqual({
      surveyId: request.surveyId,
      accountId: request.accountId,
      date: new Date(),
      answer: request.answer
    })
  })

  test('Should return 500 if SaveSurveyResult throws', async () => {
    const { sut, loadAnswersBySurveySpy, saveSurveyResultSpy } = makeSut()
    jest.spyOn(saveSurveyResultSpy, 'save').mockImplementationOnce(throwError)
    const httpResponse = await sut.handle(
      mockRequest(loadAnswersBySurveySpy.result[0])
    )
    expect(httpResponse).toEqual(serverError(new Error()))
  })

  test('Should return 200 on success', async () => {
    const { sut, loadAnswersBySurveySpy, saveSurveyResultSpy } = makeSut()
    const httpResponse = await sut.handle(
      mockRequest(loadAnswersBySurveySpy.result[0])
    )
    expect(httpResponse).toEqual(ok(saveSurveyResultSpy.surveyResultModel))
  })
})
