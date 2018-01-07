import expect from 'expect'
import React from 'react'
import {render, unmountComponentAtNode} from 'react-dom'
import {Simulate} from 'react-dom/test-utils'

import QuestionSet from '.'

// Pause long enough for React to re-render the DOM so that we can make fresh
// assertions against it. See https://stackoverflow.com/a/9084320/249801 for an
// explanation of why this works.
const awaitReRender = setTimeout

const WHAT = "away from a center of gravity"

const WHEN = "2018-01-07"

const REASONS = ['magic', 'science', 'God', 'the system']

const QUESTIONS = {
  ask: "What's up?",
  set: "what",
  then: {
    ask: "When is {{what}}?",
    type: "DATE",
    set: "when",
    then: {
      ask: "Why?",
      choices: [
        {
          text: "All the reasons",
          set: { reasons: REASONS.join(', ') },
        },
        {
          text: "No reason",
          set: { reasons: false },
        }
      ]
    }
  }
};

const TEMPLATE = {
  what: "{{what}}",
  when: "{{when}}",
  explanation: "Reasons: " +
    "{{#reasons}}All of these: {{.}}{{/reasons}}" +
    "{{^reasons}}None{{/reasons}}"
}

const RADIO_OPTIONS = [
  {
    radioOption: 0,
    expectExplanation: explanation => {
      expect(explanation).toEqual(
        `Reasons: All of these: ${REASONS.join(', ')}`
      )
    }
  },
  {
    radioOption: 1,
    expectExplanation: explanation => {
      expect(explanation).toEqual(
        `Reasons: None`
      )
    }
  }
]

describe('QuestionSet', () => {
  let node

  beforeEach(() => {
    node = document.createElement('div')
  })

  afterEach(() => {
    unmountComponentAtNode(node)
  })

  it('displays only the first question prior to user interaction', () => {
    render(<QuestionSet questions={QUESTIONS} template={TEMPLATE}/>, node, () => {
      expect(node.innerHTML).toContain(QUESTIONS.ask)
      expect(node.innerHTML).toNotContain(QUESTIONS.then.ask)
    })
  })

  context('when the user has answered the 1st question', () => {
    it('displays the 1st & 2nd questions; not the 3rd', done => {
      render(<QuestionSet questions={QUESTIONS} template={TEMPLATE}/>, node, () => {
        const what = node.querySelector('input')
        what.value = WHAT
        Simulate.change(what);

        awaitReRender(() => {
          expect(node.innerHTML).toContain("What's up?")
          expect(node.innerHTML).toContain(`When is ${WHAT}?`)
          expect(node.innerHTML).toNotContain("Why?")
          done()
        })
      })
    })
  })

  context('when the user has answered the 1st & 2nd questions', () => {
    it('displays the 1st, 2nd, & 3rd questions', done => {
      render(<QuestionSet questions={QUESTIONS} template={TEMPLATE}/>, node, () => {
        const what = node.querySelector('input')
        what.value = WHAT
        Simulate.change(what);

        awaitReRender(() => {
          const when = node.querySelectorAll('input')[1]
          when.value = WHEN
          Simulate.change(when);

          awaitReRender(() => {
            expect(node.innerHTML).toContain("What's up?")
            expect(node.innerHTML).toContain(`When is ${WHAT}?`)
            expect(node.innerHTML).toContain("Why?")
            done()
          })
        })
      })
    })
  })

  context('when the user has answered all 3 questions', () => {
    it('displays the save button', done => {
      render(<QuestionSet questions={QUESTIONS} template={TEMPLATE}/>, node, () => {
        const what = node.querySelector('input')
        what.value = WHAT
        Simulate.change(what);

        awaitReRender(() => {
          const when = node.querySelectorAll('input')[1]
          when.value = WHEN
          Simulate.change(when);

          awaitReRender(() => {
            const yes = node.querySelector('input[type="radio"]')
            yes.click()
            Simulate.change(yes)

            awaitReRender(() => {
              expect(node.innerHTML).toContain('Save')
              done()
            })
          })
        })
      })
    })
  })

  RADIO_OPTIONS.forEach(({radioOption, expectExplanation}) => {
    it(`passes a correctly-filled template to onSave, option ${radioOption}`, done => {
      let filledTemplate

      const saveSpy = args => {
        filledTemplate = args
      }

      render(
        <QuestionSet
          questions={QUESTIONS}
          template={TEMPLATE}
          onSave={saveSpy}
        />,
        node,
        () => {
          const what = node.querySelector('input')
          what.value = WHAT
          Simulate.change(what);

          awaitReRender(() => {
            const when = node.querySelectorAll('input')[1]
            when.value = WHEN
            Simulate.change(when);

            awaitReRender(() => {
              const option = node.querySelectorAll('input[type="radio"]')[radioOption]
              option.click()
              Simulate.change(option)

              awaitReRender(() => {
                const save = node.querySelector('input[type="submit"]')
                save.click()
                expect(filledTemplate.what).toEqual(WHAT)
                expect(filledTemplate.when).toEqual(WHEN)
                expectExplanation(filledTemplate.explanation)

                done()
              })
            })
          })
        }
      )
    })
  })
})
