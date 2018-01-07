import React, {Component} from 'react'
import {render} from 'react-dom'

import { QuestionSet } from '../../src'

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
}

const TEMPLATE = {
  what: "{{what}}",
  when: "{{when}}",
  explanation: "{{#reasons}}All{{/reasons}}{{^reasons}}No{{/reasons}} reasons"
}

class Demo extends Component {
  render() {
    return <div>
      <h1>react-quizzical QuestionSet Demo</h1>
      <QuestionSet
        template={TEMPLATE}
        questions={QUESTIONS}
      />
    </div>
  }
}

render(<Demo/>, document.querySelector('#demo'))
