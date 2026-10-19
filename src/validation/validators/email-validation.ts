import { type EmailValidator } from '@/validation/protocols'
import { type Validation } from '@/presentation/protocols'
import { InvalidParamError } from '@/presentation/errors'

export class EmailValidation implements Validation {
  constructor(
    private readonly fieldName: string,
    private readonly emailValidator: EmailValidator
  ) {}

  validate(input: any): Error | undefined {
    const isValid = this.emailValidator.isValid(input[this.fieldName] as string)
    if (!isValid) {
      return new InvalidParamError(this.fieldName)
    }
  }
}
