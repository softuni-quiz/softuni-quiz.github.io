import { getQuiz } from './data.js';
import html from './dom.js';

export default async function quizMaker({ params: { id } }) {
    const input = {
        list: html`<ol></ol>`,
        title: html`<input className="quiz-title" type="text" />`
    };

const e = html`
    <div>
        ${input.title}
        <button onClick=${toJSON}>Export</button>
        ${input.list}
        <button onClick=${addQuestion}>Add question</button>
    </div>`;

    if (id != undefined) {
        const quiz = await getQuiz(id);

        input.title.value = quiz.name;
        for (let question of quiz.questions) {
            addQuestion(question);
        }
    }

    return e;

    function addQuestion(question) {
        input.list.appendChild(questionForm(question));
    }

    function toJSON() {
        const data = {
            name: input.title.value,
            questions: [...input.list.children].map(c => c.read())
        };
        console.log(JSON.stringify(data, null, 2));
    }
}



function questionForm(question) {
    const input = {
        text: html`<textarea />`,
        answers: html`<div></div>`,
        dontRandomize: html`<input type="checkbox" />`
    };

    const e = html`
    <div className="question-form">
        <button onClick=${remove}>X</button>
        <label className="order-setting">Keep order ${input.dontRandomize}</label>
        <label>
            <li className="form-label">Question:</li>
            ${input.text}
        </label>
        ${input.answers}
        <button onClick=${addAnswer}>Add answer</button>
    </div>`;
    e.read = read;

    if (question != undefined) {
        input.text.value = question.text;
        input.dontRandomize.checked = question.dontRandomize;
        for (let answer of question.answers) {
            addAnswer(answer);
        }
    }

    return e;

    function remove() {
        e.remove();
    }

    function addAnswer(answer) {
        input.answers.appendChild(answerForm(answer));
    }

    function read() {
        return {
            text: input.text.value,
            answers: [...input.answers.children].map(c => c.read()),
            dontRandomize: input.dontRandomize.checked
        };
    }
}

function answerForm(answer) {
    const input = {
        check: html`<input type="checkbox" />`,
        text: html`<input type="text" />`
    };
    let e;
    e = html`
    <div>
        ${input.check}
        ${input.text}
        <button onClick=${remove}>X</button>
    </div>`;
    e.read = read;

    if (answer != undefined) {
        input.text.value = answer.text;
        input.check.checked = answer.correct;
    }

    return e;

    function remove() {
        e.remove();
    }

    function read() {
        return { text: input.text.value, correct: input.check.checked };
    }
}