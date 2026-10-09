import test from 'node:test'
import assert from 'node:assert/strict'
import { validateStep, getReviewGroups, fieldNames } from '../src/features/application/model.js'

const answers = () => Object.fromEntries(fieldNames.map((name) => [name, '']))

test('required answers are checked on their corresponding steps', () => {
  assert.deepEqual(Object.keys(validateStep(answers(), 0)), ['fullName', 'role'])
  assert.deepEqual(Object.keys(validateStep(answers(), 1)), ['format', 'investment', 'region'])
  assert.deepEqual(validateStep(answers(), 2), {})
  assert.deepEqual(Object.keys(validateStep(answers(), 3)), ['contact'])
})

test('optional age accepts empty or whole values 1 to 120', () => {
  for (const age of ['', '1', '120']) assert.equal(validateStep({ ...answers(), age }, 0).age, undefined)
  for (const age of ['0', '121', '2.5', 'abc']) assert.ok(validateStep({ ...answers(), age }, 0).age)
})

test('review excludes empty optional groups and contact already shown above', () => {
  const groups = getReviewGroups({ ...answers(), fullName: ' Юсуп ', role: 'Инвестор', contact: '@contact' })
  assert.equal(groups.length, 1)
  assert.deepEqual(groups[0].items.map(({ name, value }) => [name, value]), [['fullName', 'Юсуп'], ['role', 'Инвестор']])
})

test('review includes every filled answer from the first three steps', () => {
  const groups = getReviewGroups(Object.fromEntries(fieldNames.map((name) => [name, `answer:${name}`])))
  assert.equal(groups.flatMap((group) => group.items).length, 10)
  assert.ok(groups[2].items.every((item) => item.wide))
})
