react-quizzical
===============

[![Travis][build-badge]][build]
[![npm package][npm-badge]][npm]
[![Coveralls][coveralls-badge]][coveralls]


  [build-badge]: https://img.shields.io/travis/chadoh/react-quizzical/master.png?style=flat-square
  [build]: https://travis-ci.org/chadoh/react-quizzical

  [npm-badge]: https://img.shields.io/npm/v/react-quizzical.png?style=flat-square
  [npm]: https://www.npmjs.org/package/react-quizzical

  [coveralls-badge]: https://img.shields.io/coveralls/chadoh/react-quizzical/master.png?style=flat-square
  [coveralls]: https://coveralls.io/github/chadoh/react-quizzical

A react component for asking a tree of questions. See [an interactive demo][demo].

  [demo]: http://chadoh.com/react-quizzical/

* [Overview][overview]
* [Getting Started][gettingStarted]
* [Basic Props][basicProps]
* [More about the `questions` object][questionsObject]
* [More about templating & variables][templateSystem]
* [Customizing the look & feel][customizing]

  [overview]: #overview
  [gettingStarted]: #getting-started
  [basicProps]: #basic-props
  [questionsObject]: #more-about-the-questions-object
  [templateSystem]: #more-about-templating--variables
  [customizing]: #customizing-the-look--feel


Overview
========

![A user answers a question, Do you love React?, by clicking No. A new question
appears, Do you love JavaScript? User goes back and clicks Yes on the first
question, and a different second question appears, What do you love about it?
This new question has a text field below.][screenshot]

  [screenshot]: /src/QuestionSet/QuestionSet-demo.gif

To accomplish the above, here's the code you could write:

    import { QuestionSet } from 'react-quizzical'

    <QuestionSet
      questions={{
        ask: "Do you love React?",
        choices: [
          {
            text: "Yes",
            then: {
              ask: "What do you love about it?",
            }
          },
          {
            text: "No",
            then: {
              ask: "Do you love JavaScript?",
              choices: [
                { text: "Yes" },
                { text: "No" }
              ]
            }
          }
        ]
      }}
    />

As you can see, how the user answers one question determines which question
will be shown next. Hence calling it a _tree_ of questions.


Getting Started
===============

Add `react-quizzical` to your project dependencies with `npm`

    npm install -S react-quizzical

or `yarn`

    yarn add react-quizzical

Then in the file where you want to use it, import a sub-component called `QuestionSet` using CommonJS syntax

    var QuestionSet = require('react-quizzical').QuestionSet;

Or ES6 module syntax:

    import { QuestionSet } from 'react-quizzical';

Note that `QuestionSet` is the _only_ thing exported from `react-quizzical` at this time.

Now you are ready to use it.


Basic Props
===========

`QuestionSet` requires at least two props, three to be useful.

* `questions`: **required**: A tree of questions, which contains instructions for setting some variables. Example:

      questions={{
        ask: "When's the last time you moved?",
        type: "DATE",
        set: "moveDate"
      }}

* `template`: **required**: A template to be filled-in with the variables specified by `questions`. Example:

      template={{
        title: "Moved",
        date: "{{moveDate}}"
      }}

* `onSave`: a function to call with the filled-in template once the user answers to the end of a tree branch. If the user fills in "2018-01-06" with the examples above, it will result in `onSave` being called with:

      onSave({
        title: "Moved",
        date: "2018-01-06"
      })


More about the `questions` object
=================================

Each specific question in the flow can either be a **free-form field** or a **multiple choice field**.


Free-form field
---------------

Basic example:

    {
      "ask": "When now brown cow?",
      "type": "DATE",
      "set": "when",
      "then": { ... }
    }

More about each attribute:

* `"ask"` - **required** - the question to ask
* `"set"` - **required** - every free-form field must set a single variable. When the user types in their answer to the question, their answer will be stored in this variable. It can then be used in follow-up question's `"ask"` field or in the `template`. Read more about the templating system below.
* `"type"` - Either leave this blank for a text field, or set it to `"DATE"` for a date field
* `"then"` - The next field to show. Can be omitted to end the questioning after the user answers this one. Can be another free-form field. Or it can be a multiple choice field.


Multiple-choice field
---------------------

Basic example:

    {
      "ask": "In your best life you are a:",
      "choices": [
        {
          "text": "Stunt double",
          "set": { "occupation": "Stunt double", "emoji": ":dash:" },
          "then": { ... }
        },
        {
          "text": "Bird",
          "set": { "occupation": "Bird", "emoji": ":bird:" },
          "then": { ... }
        }
      ]
    }

At the top level, both `"ask"` and `"choices"` are required.

For each individual choice, here's more about each attribute:

* `"text"` - **required** - the wording of the choice.
* `"set"` - Optional here! Note that it is a whole set of attributes, whereas a free-form field has only one attribute.
* `"then"` - The next field to show. Can be omitted to end the questioning after the user answers this one. Can be a free-form field. Can be another multiple choice!


More about templating & variables
=================================

In the Question Set (see above), you can set a variable like this:

    {
      "ask": "What's your favorite color?",
      "set": "color"
    }

This will display a text box, and when the user fills it in, their answer will be set to the variable `color`, which can then be used later in the `questions` or in the `template` like this:

    {
      "ask": "What do you think liking {{color}} says about you to other people?",
    }

You can also set a variable with a Multiple Choice field like this:

    {
      "ask": "Are you awesome?",
      "choices": [
        {
          "text": "Yes",
          "set": { "awesome": true }
        },
        {
          "text": "No",
          "set": { "awesome": false }
        }
      ]
    }

You can use these variables in the same way. However, for this particular example, showing the text "true" or "false" is probably not what you want to do. Instead, you probably want to change the whole wording of follow-up questions (or, likewise, change the whole wording of the filled-in `template` sent to the `onSave` function).

How to do that?


Template Sections
-----------------

You can include whole phrases based on the value of a variable like this:

    {{#awesome}}That's sick, yo. {{/awesome}}Are you happy?

Sticking with the example above, if the user says "Yes" to the question "Are you awesome?", the next question could start with "That's sick, yo." Otherwise, if they answer "No," it will just ask the next question without the interjection.

You can also use this to insert variables, depending on if they're defined or not.

    {{#name}}Hi, {{.}}! {{/name}}How are you today?

Here, if the variable "name" has been set to, for example, "Chad", the phrase will read "Hi, Chad! How are you today?" If the variable "name" has not been set, it will just read "How are you today?"


Template Inverse Sections
-------------------------

If you want a section to only appear if a variable isn't set, or is set to false, you can use an inverted section.

    {{^name}}Weird that you don't have a name. Well. {{/name}}How are you today?

This can pair well with regular sections:

    {{#awesome}}A bit conceited, are we?{{/awesome}}{{^awesome}}Aww, I'm sure you're cool!{{/awesome}}


Customizing the look & feel
===========================

In addition to the [basic props][basicProps] listed above listed above, you can
pass in any of the following:

prop | type | default | description
-----|------|---------|------------
`showSkipOnFirst` | boolean | `false` | You can optionally pass in a `skipLinkComponent` and set this to `true`, which will then display your `skipLinkComponent` at the end of the first question
`skipLinkComponent` | React Component | | See above
`saveButton` | React Component | [See defaults][componentDefaults] | The button to show at the end of the question flow
`dateInputComponent` | React Component | [See defaults][componentDefaults] | When a free-form field with `"type": "DATE"` is encountered, this is the date component that will be displayed.
`textInputComponent` | React Component | [See defaults][componentDefaults] | When a free-form field with no `"type"` attribute is encountered, this is the text component that will be displayed.
`freeFormFieldComponent` | React Component | [See defaults][componentDefaults] | When a free-form field is encountered, this component will be displayed. It will be passed a `name`, `label`, and `children` prop.
`multipleChoiceFieldComponent` | React Component | [See defaults][componentDefaults] | When a multiple choice field is encountered, this component will be displayed. It will be passed a `label`, and `children` prop.
`choiceComponent` | React Component | [See defaults][componentDefaults] | This is the component used to display each choice within a multiple choice field. Basically a radio input. It will be passed `questionNumber`, `choiceNumber`, `onChange`, `checked`, and `text` props.

  [componentDefaults]: /src/QuestionSet/DefaultComponents.js
