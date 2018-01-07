import React, {Component} from 'react';
import PropTypes from 'prop-types';

import * as DefaultComponents from './DefaultComponents';

const SECTION_PATTERN = new RegExp(/{{#(\w+)}}(.+?){{\/\1}}/g);
const INVERTED_SECTION_PATTERN = new RegExp(/{{\^(\w+)}}(.+?){{\/\1}}/g);
const SUBSTITUTION_PATTERN = new RegExp(/{{([^}]+)}}/g);

const insert_answers = answers => (_, answer) => answers[answer] || '';

const substitute = (template, values) =>
  template.replace(
    SUBSTITUTION_PATTERN,
    insert_answers({ '.': values, ...values })
  );

const keepIfTruthy = answers => (_, maybe, toKeep) =>
  answers[maybe] ? substitute(toKeep, answers[maybe]) : '';

const keepIfFalsey = answers => (_, maybe, toKeep) =>
  answers[maybe] ? '' : toKeep;

export default class Question extends Component {
  static propTypes = {
    questions: PropTypes.object.isRequired,
    template: PropTypes.object.isRequired,
    onSave: PropTypes.func,

    showSkipOnFirst: PropTypes.bool,
    skipLinkComponent: PropTypes.oneOfType([PropTypes.element, PropTypes.func]),
    saveButton: PropTypes.oneOfType([PropTypes.element, PropTypes.func]),

    dateInputComponent: PropTypes.oneOfType([PropTypes.element, PropTypes.func]),
    textInputComponent: PropTypes.oneOfType([PropTypes.element, PropTypes.func, PropTypes.string]),
    freeFormFieldComponent: PropTypes.oneOfType([PropTypes.element, PropTypes.func]),
    multipleChoiceFieldComponent: PropTypes.oneOfType([PropTypes.element, PropTypes.func]),
    choiceComponent: PropTypes.oneOfType([PropTypes.element, PropTypes.func]),
  }

  static defaultProps = {
    onSave: (...args) => console.log(...args),

    showSkipOnFirst: false,
    skipLinkComponent: DefaultComponents.SkipLink,
    saveButton: DefaultComponents.SaveButton,

    dateInputComponent: DefaultComponents.Date,
    textInputComponent: 'input',
    freeFormFieldComponent: DefaultComponents.FreeFormField,
    multipleChoiceFieldComponent: DefaultComponents.MultipleChoiceField,
    choiceComponent: DefaultComponents.Choice,
  }

  state = {
    answers: {}
  }

  save = e => {
    e.preventDefault();

    const { onSave, template } = this.props;
    const { answers } = this.state;
    const event = {};

    for (const key in template) {
      if (template.hasOwnProperty(key)) {
        event[key] = template[key]
          .replace(SECTION_PATTERN, keepIfTruthy(answers))
          .replace(INVERTED_SECTION_PATTERN, keepIfFalsey(answers))
          .replace(SUBSTITUTION_PATTERN, insert_answers(answers))
        ;
      }
    }

    onSave(event);
    this.setState({answers: {}});
  }

  resetAnswersTo = ({index}) => {
    const answers = {};
    for (let i = 0; i < index; i++) {
      answers[i] = this.state.answers[i];
    }
    return answers;
  }

  maybeResetAnswers = ({answers, index}) => {
    const largest = Math.max(
      ...Object.keys(answers).map(n => +n).filter(n => !isNaN(n))
    );
    if (index < largest) return this.resetAnswersTo({index});
    return answers;
  }

  answer = ({choice, set, index}) => {
    return e => {
      const value = e.target ? e.target.value : e;
      let answers = {...this.state.answers};
      answers = this.maybeResetAnswers({answers, index});

      answers[index] = choice || value;

      if (typeof set === 'string') answers[set] = value;
      else if (typeof set === 'object') answers = { ...answers, ...set };
      else if (typeof set !== 'undefined') {
        console.error(new Error(
          `Malformed Question: expected 'set' to be omitted, or to be defined either as a
          string (for text and date inputs) or an
          object (for multiple choice options)`
        ));
        console.error("got 'set' defined as:", set);
      }

      this.setState({answers});
    };
  }

  isAnswered = ({index}) => {
    return this.state.answers[index];
  }

  nextField = ({questions, index}) => {
    if (questions.choices) {
      return questions.choices[this.state.answers[index]].then;
    }
    return questions.then;
  }

  renderMultipleChoice = ({ask, choices, index}) => {
    return React.createElement(
      this.props.multipleChoiceFieldComponent,
      {
        key: index,
        label: ask,
      },
      choices.map((choice, choiceNumber) =>
        this.renderChoice({...choice, choiceNumber, index})
      )
    );
  }

  renderChoice = ({text, set, choiceNumber, index}) => {
    const {answers} = this.state;
    return React.createElement(
      this.props.choiceComponent,
      {
        key: `${index}.${choiceNumber}`,
        questionNumber: index,
        choiceNumber,
        onChange: this.answer({set, index}),
        checked: answers[index] === String(choiceNumber),
        text: substitute(text, answers),
      },
    );
  }

  renderFreeForm = ({ ask, type, set, index }) => {
    return React.createElement(
      this.props.freeFormFieldComponent,
      {
        key: `field${index}`,
        label: substitute(ask, this.state.answers),
        name: set,
      },
      React.createElement(
        type === 'DATE'
          ? this.props.dateInputComponent
          : this.props.textInputComponent,
        {
          type: type ? undefined : 'text',
          name: set,
          id: set,
          value: this.state.answers[set] || '',
          autoComplete: 'off',
          onChange: this.answer({set, index}),
        }
      )
    );
  }

  renderField = ({ask, choices, type, set, index}) => {
    if (!ask) {
      return React.createElement(
        this.props.saveButton,
        { key: 'save' }
      );
    }

    if (!set && !choices) {
      console.error(new Error(
        `Malformed Question, "${ask}": Each question in a set must either define
        'set' (for a text or date field) or
        'choices' (for multiple choice)`
      ));
    }

    if (choices) {
      return this.renderMultipleChoice({ ask, choices, index });
    }

    return this.renderFreeForm({ ask, type, set, index });
  }

  maybeAddSkipLink = (index, fields) => {
    if (
      this.props.showSkipOnFirst &&
      index === 0 &&
      fields.length < 2
    ) {
      fields.push(React.createElement(
        this.props.skipLinkComponent,
        { key: 'skip' }
      ));
    }
  }

  renderQuestions = (questions, index = 0) => {
    const fields = [];
    fields.push(this.renderField({...questions, index}));

    if (this.isAnswered({index})) {
      fields.push(
        ...this.renderQuestions(this.nextField({questions, index}), index + 1)
      );
    }

    this.maybeAddSkipLink(index, fields);
    return fields;
  }

  render() {
    return (
      <form role="form" onSubmit={this.save}>
        {this.renderQuestions(this.props.questions)}
      </form>
    );
  }
}
