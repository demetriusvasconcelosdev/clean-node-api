import { DbCheckSurveyById } from './db-check-survey-by-id'
import { CheckSurveyByIdRepositorySpy } from '@/tests/data/mocks'
import { throwError } from '@/tests/domain/mocks'
import { faker } from '@faker-js/faker'

interface SutTypes {
  sut: DbCheckSurveyById
  checkSurveyByIdRepositorySpy: CheckSurveyByIdRepositorySpy
}

const makeSut = (): SutTypes => {
  const checkSurveyByIdRepositorySpy = new CheckSurveyByIdRepositorySpy()
  const sut = new DbCheckSurveyById(checkSurveyByIdRepositorySpy)
  return { sut, checkSurveyByIdRepositorySpy }
}

describe('DbCheckSurveyById', () => {
  test('Should call CheckSurveyByIdRepository with the survey id', async () => {
    const { sut, checkSurveyByIdRepositorySpy } = makeSut()
    const id = faker.string.uuid()
    await sut.checkById(id)
    expect(checkSurveyByIdRepositorySpy.id).toBe(id)
  })

  test('Should return true if the survey exists', async () => {
    const { sut } = makeSut()
    expect(await sut.checkById(faker.string.uuid())).toBe(true)
  })

  test('Should return false if the survey does not exist', async () => {
    const { sut, checkSurveyByIdRepositorySpy } = makeSut()
    checkSurveyByIdRepositorySpy.result = false
    expect(await sut.checkById(faker.string.uuid())).toBe(false)
  })

  test('Should throw if CheckSurveyByIdRepository throws', async () => {
    const { sut, checkSurveyByIdRepositorySpy } = makeSut()
    jest
      .spyOn(checkSurveyByIdRepositorySpy, 'checkById')
      .mockImplementationOnce(throwError)
    await expect(sut.checkById(faker.string.uuid())).rejects.toThrow()
  })
})
