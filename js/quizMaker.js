import { getQuiz, exportToJson } from './data.js';
import html from './dom.js';

export default async function quizMaker({ params: { id } }) {
    const input = {
        list: html`<ol></ol>`,
        title: html`<input className="quiz-title" type="text" />`
    };

    input.list.addEventListener('input', onInput);
    input.list.addEventListener('click', onInput);
    input.title.addEventListener('input', onInput);

    const e = html`
    <div>
        ${input.title}
        <button onClick=${downloadQuiz}>Export</button>
        <button onClick=${reset}>New</button>
        <a href="/preview">Preview</a>
        ${input.list}
        <button onClick=${onAddClick}>Add question</button>
    </div>`;

    if (id != undefined) {
        const quiz = await getQuiz(id);

        input.title.value = quiz.name;
        for (let question of quiz.questions) {
            addQuestion(question);
        }
    } else if (localStorage.getItem('recentQuiz') != null) {
        const quiz = JSON.parse(localStorage.getItem('recentQuiz'));

        input.title.value = quiz.name;
        for (let question of quiz.questions) {
            addQuestion(question);
        }
    }

    let timer = null;

    return e;

    function onAddClick() {
        input.list.appendChild(questionForm());
    }

    function addQuestion(question) {
        input.list.appendChild(questionForm(question));
    }

    function toJSON() {
        const data = {
            name: input.title.value,
            questions: [...input.list.children].map(c => c.read())
        };
        return JSON.stringify(data, null, 2);
    }

    function downloadQuiz() {
        exportToJson(toJSON());
    }

    function reset() {
        if (confirm('Please confirm')) {
            localStorage.removeItem('recentQuiz');
            input.list.html = '';
        }
    }

    function onInput() {
        let cb = null;
        
        if (timer == null) {
            store();

            cb = () => {
                clearTimeout(timer);
                timer = null;
            };

            timer = setTimeout(cb, 1500);
        } else {
            cb = () => {
                store();
                clearTimeout(timer);
                timer = null;
            };
        }

        function store() {
            localStorage.setItem('recentQuiz', toJSON());
        }
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
        <button onClick=${moveUp}>Up</button>
        <button onClick=${moveDown}>Down</button>
        <label className="order-setting">Keep order ${input.dontRandomize}</label>
        <label>
            <li className="form-label">Question:</li>
            ${input.text}
        </label>
        ${input.answers}
        <button onClick=${onAddClick}>Add answer</button>
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

    function onAddClick() {
        input.answers.appendChild(answerForm());
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

    function moveUp() {
        e.parentNode.insertBefore(e, e.previousSibling);
    }

    function moveDown() {
        e.parentNode.insertBefore(e.nextSibling, e);
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