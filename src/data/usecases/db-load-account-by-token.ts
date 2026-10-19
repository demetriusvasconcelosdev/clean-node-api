import { type LoadAccountByToken } from '@/domain/usecases'
import {
  type Decrypter,
  type LoadAccountByTokenRepository
} from '@/data/protocols'

export class DbLoadAccountByToken implements LoadAccountByToken {
  constructor(
    private readonly decrypter: Decrypter,
    private readonly loadAccountByTokenRepository: LoadAccountByTokenRepository
  ) {}

  async load(
    accessToken: string,
    role?: string
  ): Promise<LoadAccountByToken.Result | null> {
    let token: string | null
    try {
      token = await this.decrypter.decrypt(accessToken)
    } catch (error) {
      return null
    }
    if (token !== null) {
      const account = await this.loadAccountByTokenRepository.loadByToken(
        accessToken,
        role
      )
      if (account !== null) {
        return account
      }
    }
    return null
  }
}
