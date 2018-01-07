import expect from 'expect'
import React from 'react'
import {render, unmountComponentAtNode} from 'react-dom'
import TestUtils from 'react-dom/test-utils'

import QuestionSet from '.'

// Pause long enough for React to re-render the DOM so that we can make fresh
// assertions against it. See https://stackoverflow.com/a/9084320/249801 for an
// explanation of why this works.
const awaitReRender = setTimeout

const QUESTIONS = {
  ask: "What's up?",
  set: "what",
  then: {
    ask: "When?",
    type: "DATE",
    set: "when",
    then: {
      ask: "Why?",
      choices: [
        {
          text: "All the reasons",
          set: { reasons: true },
        },
        {
          text: "No reason",
          set: { reasons: false },
        }
      ]
    }
  }
};

const WHAT = "away from a center of gravity"

const WHEN = "2018-01-07"

const TEMPLATE = {
  what: "{{what}}",
  when: "{{when}}",
  explanation: "{{#reasons}}All{{/reasons}}{{^reasons}}No{{/reasons}} reasons"
}

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
    it('displays the 1st & 2nd questions; not the 3rd', () => {
      render(<QuestionSet questions={QUESTIONS} template={TEMPLATE}/>, node, () => {
        const what = node.querySelector('input')
        what.value = WHAT
        TestUtils.Simulate.change(what);

        awaitReRender(() => {
          expect(node.innerHTML).toContain(QUESTIONS.ask)
          expect(node.innerHTML).toContain(QUESTIONS.then.ask)
          expect(node.innerHTML).toNotContain(QUESTIONS.then.then.ask)
        })
      })
    })
  })

  context('when the user has answered the 1st & 2nd questions', () => {
    it('displays the 1st, 2nd, & 3rd questions', () => {
      render(<QuestionSet questions={QUESTIONS} template={TEMPLATE}/>, node, () => {
        const what = node.querySelector('input')
        what.value = WHAT
        TestUtils.Simulate.change(what);

        awaitReRender(() => {
          const when = node.querySelectorAll('input')[1]
          when.value = WHEN
          TestUtils.Simulate.change(what);

          awaitReRender(() => {
            expect(node.innerHTML).toContain(QUESTIONS.ask)
            expect(node.innerHTML).toContain(QUESTIONS.then.ask)
            expect(node.innerHTML).toContain(QUESTIONS.then.then.ask)
          })
        })
      })
    })
  })
})
