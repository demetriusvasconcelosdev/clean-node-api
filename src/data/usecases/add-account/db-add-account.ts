import { type AccountModel } from '../../../domain/models/account'
import {
  type AddAccount,
  type AddAccountModel
} from '../../../domain/usecases/add-account'

export class DbAddAccount implements AddAccount {
  async add(account: AddAccountModel): Promise<AccountModel> {}
}
