import { DbLoadSurveys } from './db-load-surveys'
import { LoadSurveysRepositorySpy } from '@/tests/data/mocks'
import { throwError } from '@/tests/domain/mocks'
import { faker } from '@faker-js/faker'

interface SutTypes {
  sut: DbLoadSurveys
  loadSurveysRepositorySpy: LoadSurveysRepositorySpy
}

const makeSut = (): SutTypes => {
  const loadSurveysRepositorySpy = new LoadSurveysRepositorySpy()
  const sut = new DbLoadSurveys(loadSurveysRepositorySpy)
  return { sut, loadSurveysRepositorySpy }
}

describe('DbLoadSurveys', () => {
  test('Should call LoadSurveysRepository with the account id', async () => {
    const { sut, loadSurveysRepositorySpy } = makeSut()
    const accountId = faker.string.uuid()
    await sut.load(accountId)
    expect(loadSurveysRepositorySpy.accountId).toBe(accountId)
  })

  test('Should return a list of Surveys on success', async () => {
    const { sut, loadSurveysRepositorySpy } = makeSut()
    const surveys = await sut.load(faker.string.uuid())
    expect(surveys).toEqual(loadSurveysRepositorySpy.result)
  })

  test('Should throw if LoadSurveysRepository throws', async () => {
    const { sut, loadSurveysRepositorySpy } = makeSut()
    jest
      .spyOn(loadSurveysRepositorySpy, 'loadAll')
      .mockImplementationOnce(throwError)
    const promise = sut.load(faker.string.uuid())
    await expect(promise).rejects.toThrow()
  })
})
