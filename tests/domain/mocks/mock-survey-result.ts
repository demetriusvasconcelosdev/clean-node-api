import { type SurveyResultModel } from '@/domain/models'
import { type SaveSurveyResult } from '@/domain/usecases'
import { faker } from '@faker-js/faker'

export const mockSaveSurveyResultParams = (): SaveSurveyResult.Params => ({
  accountId: faker.string.uuid(),
  surveyId: faker.string.uuid(),
  answer: faker.word.sample(),
  date: faker.date.recent()
})

export const mockSurveyResultModel = (): SurveyResultModel => ({
  surveyId: faker.string.uuid(),
  question: faker.lorem.words(),
  answers: [
    {
      answer: faker.word.sample(),
      count: faker.number.int({ min: 0, max: 1000 }),
      percent: faker.number.int({ min: 0, max: 100 }),
      isCurrentAccountAnswer: faker.datatype.boolean()
    },
    {
      answer: faker.word.sample(),
      image: faker.image.url(),
      count: faker.number.int({ min: 0, max: 1000 }),
      percent: faker.number.int({ min: 0, max: 100 }),
      isCurrentAccountAnswer: faker.datatype.boolean()
    }
  ],
  date: faker.date.recent()
})
