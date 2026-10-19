import { JwtAdapter } from './jwt-adapter'
import { throwError } from '@/tests/domain/mocks'
import jwt from 'jsonwebtoken'

jest.mock('jsonwebtoken', () => ({
  sign(): string {
    return 'any_token'
  },
  verify(): string {
    return 'any_value'
  }
}))

const makeSut = (): JwtAdapter => new JwtAdapter('secret')

describe('Jwt Adapter', () => {
  test('Should call sign with correct values', async () => {
    const sut = makeSut()
    const signSpy = jest.spyOn(jwt, 'sign')
    await sut.encrypt('any_id')
    expect(signSpy).toHaveBeenCalledWith({ id: 'any_id' }, 'secret')
  })

  test('Should return a token on sign success', async () => {
    const sut = makeSut()
    expect(await sut.encrypt('any_id')).toBe('any_token')
  })

  test('Should throw if sign throws', async () => {
    const sut = makeSut()
    jest.spyOn(jwt, 'sign').mockImplementationOnce(throwError)
    await expect(sut.encrypt('any_id')).rejects.toThrow()
  })

  test('Should call verify with correct values', async () => {
    const sut = makeSut()
    const verifySpy = jest.spyOn(jwt, 'verify')
    await sut.decrypt('any_token')
    expect(verifySpy).toHaveBeenCalledWith('any_token', 'secret')
  })

  test('Should return a value on verify success', async () => {
    const sut = makeSut()
    expect(await sut.decrypt('any_token')).toBe('any_value')
  })

  test('Should throw if verify throws', async () => {
    const sut = makeSut()
    jest.spyOn(jwt, 'verify').mockImplementationOnce(throwError)
    await expect(sut.decrypt('any_token')).rejects.toThrow()
  })
})
