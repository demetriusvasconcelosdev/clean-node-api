import { DbLoadAnswersBySurvey } from './db-load-answers-by-survey'
import { LoadAnswersBySurveyRepositorySpy } from '@/tests/data/mocks'
import { throwError } from '@/tests/domain/mocks'
import { faker } from '@faker-js/faker'

interface SutTypes {
  sut: DbLoadAnswersBySurvey
  loadAnswersBySurveyRepositorySpy: LoadAnswersBySurveyRepositorySpy
}

const makeSut = (): SutTypes => {
  const loadAnswersBySurveyRepositorySpy =
    new LoadAnswersBySurveyRepositorySpy()
  const sut = new DbLoadAnswersBySurvey(loadAnswersBySurveyRepositorySpy)
  return { sut, loadAnswersBySurveyRepositorySpy }
}

describe('DbLoadAnswersBySurvey', () => {
  test('Should call LoadAnswersBySurveyRepository with the survey id', async () => {
    const { sut, loadAnswersBySurveyRepositorySpy } = makeSut()
    const id = faker.string.uuid()
    await sut.loadAnswers(id)
    expect(loadAnswersBySurveyRepositorySpy.id).toBe(id)
  })

  test('Should return the answers on success', async () => {
    const { sut, loadAnswersBySurveyRepositorySpy } = makeSut()
    const answers = await sut.loadAnswers(faker.string.uuid())
    expect(answers).toEqual(loadAnswersBySurveyRepositorySpy.result)
  })

  test('Should return an empty list if LoadAnswersBySurveyRepository returns an empty list', async () => {
    const { sut, loadAnswersBySurveyRepositorySpy } = makeSut()
    loadAnswersBySurveyRepositorySpy.result = []
    expect(await sut.loadAnswers(faker.string.uuid())).toEqual([])
  })

  test('Should throw if LoadAnswersBySurveyRepository throws', async () => {
    const { sut, loadAnswersBySurveyRepositorySpy } = makeSut()
    jest
      .spyOn(loadAnswersBySurveyRepositorySpy, 'loadAnswers')
      .mockImplementationOnce(throwError)
    await expect(sut.loadAnswers(faker.string.uuid())).rejects.toThrow()
  })
})
