import {
  type AddAccount,
  type Authentication,
  type LoadAccountByToken
} from '@/domain/usecases'
import { faker } from '@faker-js/faker'

export class AddAccountSpy implements AddAccount {
  result = true
  addAccountParams!: AddAccount.Params

  async add(account: AddAccount.Params): Promise<AddAccount.Result> {
    this.addAccountParams = account
    return this.result
  }
}

export class AuthenticationSpy implements Authentication {
  authenticationParams!: Authentication.Params
  authenticationModel: Authentication.Result | null = {
    accessToken: faker.string.uuid(),
    name: faker.person.fullName()
  }

  async auth(
    authenticationParams: Authentication.Params
  ): Promise<Authentication.Result | null> {
    this.authenticationParams = authenticationParams
    return this.authenticationModel
  }
}

export class LoadAccountByTokenSpy implements LoadAccountByToken {
  accountModel: LoadAccountByToken.Result | null = { id: faker.string.uuid() }
  accessToken!: string
  role?: string

  async load(
    accessToken: string,
    role?: string
  ): Promise<LoadAccountByToken.Result | null> {
    this.accessToken = accessToken
    this.role = role
    return this.accountModel
  }
}
