import React from 'react'

export const SkipLink = () => {
  console.error(new Error(
    'You had showSkipLink={true} for a QuestionSet, but did not provide a' +
    'skipLink. Please provide a skipLinkComponent.'
  ));
  return <div>Next Question</div>;
}

export const SaveButton = () => (
  <input type="submit" value="Save" />
)

export const Date = props => (
  <input type="date" {...props} />
)

export const FreeFormField = ({name, label, children}) => (
  <p>
    <label htmlFor={name}>{label}</label>
    {children}
  </p>
)

export const MultipleChoiceField = ({label, children}) => (
  <div>
    <p>{label}</p>
    <p>{children}</p>
  </div>
)

export const Choice = ({questionNumber, choiceNumber, onChange, checked, text}) => (
  <label>
    <input
      type="radio"
      name={questionNumber}
      value={choiceNumber}
      onChange={onChange}
      checked={checked}
    />
    {text}
  </label>
)
