import React, {Component} from 'react'
import {render} from 'react-dom'

import Editor from './Editor'
import { QuestionSet } from '../../src'

class Demo extends Component {
  state = {
    questions: {
      ask: "Do you love React?",
      choices: [
        {
          text: "Yes",
          set: { lovesReact: true },
          then: {
            ask: "What do you love about it?",
            set: "reasonsToLoveReact",
            then: {
              ask: "When did you first love React?",
              type: "DATE",
              set: "when",
            }
          }
        },
        {
          text: "No",
          set: { lovesReact: false },
          then: {
            ask: "Do you love JavaScript?",
            choices: [
              {
                text: "Yes",
                then: {
                  ask: "When did you start loving JavaScript?",
                  type: "DATE",
                  set: "when",
                }
              },
              {
                text: "No",
                set: { reasons: "Doesn't even like JavaScript 😞" }
              }
            ]
          }
        }
      ]
    },
    template: {
      title: "{{#lovesReact}}<3 React{{/lovesReact}}{{^lovesReact}}no love for React{{/lovesReact}}",
      reasons: "{{#reasonsToLoveReact}}Why <3 React: {{.}}{{/reasonsToLoveReact}}{{reasons}}",
      when: "{{when}}",
    }
  }

  set = attr => val => {
    this.setState({[attr]: val})
  }

  render() {
    const {questions, template} = this.state
    return <div>
      <h1>react-quizzical demo</h1>
      <div className="Demo-columns">
        <div>
          <p>
            This is a demo of the <code>QuestionSet</code> component from <a
            href="https://github.com/chadoh/react-quizzical"><code>react-quizzical</code></a>.
          </p>
          <p>It uses the following setup:</p>
          <pre>{`<QuestionSet questions={...} template={...} />`}</pre>
          <h2>Given this <code>questions</code> prop</h2>
          <Editor
            onChange={this.set('questions')}
            value={questions}
            height="50vh"
          />
          <h2>And this <code>template</code> prop</h2>
          <p>
            Remember to keep your browser console open when you click "Save" so
            you can see the filled-in template.
          </p>
          <Editor
            onChange={this.set('template')}
            value={template}
            height="150px"
          />
        </div>
        <div>
          <h2>Here's what it'll look like</h2>
          <QuestionSet
            questions={questions}
            template={template}
          />
        </div>
      </div>
    </div>
  }
}

render(<Demo/>, document.querySelector('#demo'))
