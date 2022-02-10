import { getQuiz, exportToJson } from '../data.js';
import html from '../dom.js';

export default async function quizMaker({ params: { id }, categories }) {
    const input = {
        list: html`<ol></ol>`,
        title: html`<input className="quiz-title" type="text" name="title" />`,
        category: catSelector(categories)
    };

    input.list.addEventListener('input', onInput);
    input.list.addEventListener('click', onInput);
    input.title.addEventListener('input', onInput);
    input.category.addEventListener('input', onInput);

    const e = html`
    <div className="quiz-maker">
        ${input.title}
        <label>Category: ${input.category}</label>
        <button onClick=${downloadQuiz}>Export</button>
        <button onClick=${reset}>New</button>
        <a href="/preview">Preview</a>
        ${input.list}
        <button onClick=${onAddClick}>Add question</button>
    </div>`;

    if (id != undefined) {
        const quiz = await getQuiz(id);

        input.title.value = quiz.name;
        input.category.value = quiz.category;
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
            category: input.category.value,
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


function catSelector(categories) {
    return html`<select name="category">
    ${categories.map(c => html`<option value=${c.id}>${c.name}</option>`)}
</select>`;
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
        <label className="order-setting">Keep order ${input.dontRandomize}</label><br />
        <label className="order-setting">Multiline <input onClick=${onMultiline} type="checkbox" /></label>
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

    function onMultiline({ target: { checked } }) {
        [...input.answers.children].map(c => c.setMulti(checked));
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
    const text = (answer && answer.text.includes('\n')) ? html`<textarea></textarea>` : html`<input type="text" />`;
    const input = {
        check: html`<input type="checkbox" />`,
        text
    };
    let e;
    e = html`
    <div>
        ${input.check}
        ${input.text}
        <button onClick=${remove}>X</button>
    </div>`;
    e.read = read;
    e.setMulti = setMulti;

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

    function setMulti(value) {
        const current = input.text.value;
        const newInput = value ? html`<textarea>${current}</textarea>` : html`<input type="text" value=${current} />`;
        input.text.replaceWith(newInput);
        input.text = newInput;
    }
}