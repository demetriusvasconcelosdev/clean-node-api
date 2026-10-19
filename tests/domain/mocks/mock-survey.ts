import { type SurveyModel } from '@/domain/models'
import { type AddSurvey } from '@/domain/usecases'
import { faker } from '@faker-js/faker'

export const mockSurveyModel = (): SurveyModel => ({
  id: faker.string.uuid(),
  question: faker.lorem.words(),
  answers: [
    { answer: faker.word.sample() },
    { answer: faker.word.sample(), image: faker.image.url() }
  ],
  date: faker.date.recent()
})

export const mockSurveyModels = (): SurveyModel[] => [
  mockSurveyModel(),
  mockSurveyModel()
]

export const mockAddSurveyParams = (): AddSurvey.Params => ({
  question: faker.lorem.words(),
  answers: [
    { image: faker.image.url(), answer: faker.word.sample() },
    { answer: faker.word.sample() }
  ],
  date: faker.date.recent()
})
