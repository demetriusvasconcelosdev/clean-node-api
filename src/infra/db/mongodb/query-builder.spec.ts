import { QueryBuilder } from './query-builder'

describe('QueryBuilder', () => {
  test('Should build the pipeline steps in the order they were added', () => {
    const query = new QueryBuilder()
      .match({ a: 1 })
      .group({ b: 2 })
      .sort({ c: -1 })
      .unwind({ path: '$d' })
      .lookup({ from: 'e' })
      .project({ f: 1 })
      .build()
    expect(query).toEqual([
      { $match: { a: 1 } },
      { $group: { b: 2 } },
      { $sort: { c: -1 } },
      { $unwind: { path: '$d' } },
      { $lookup: { from: 'e' } },
      { $project: { f: 1 } }
    ])
  })

  test('Should build an empty pipeline by default', () => {
    expect(new QueryBuilder().build()).toEqual([])
  })
})
