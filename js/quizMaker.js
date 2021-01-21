import html from './dom.js';

export default function quizMaker() {
    const list = html`<div></div>`;
    return html`
    <div>
        <button onClick=${toJSON}>Export</button>
        ${list}
        <button onClick=${addQuestion}>Add question</button>
    </div>
    `;

    function addQuestion() {
        list.appendChild(questionForm());
    }

    function toJSON() {
        const data = [...list.children].map(c => c.read());
        console.log(JSON.stringify(data, null, 2));
    }
}



function questionForm() {
    const input = {
        text: html`<textarea />`,
        answers: html`<div></div>`
    };

    const e = html`
    <div className="question-form">
        <button onClick=${remove}>X</button>
        <label>
            Question
            ${input.text}
        </label>
        ${input.answers}
        <button onClick=${addAnswer}>Add answer</button>
    </div>
    `;
    e.read = read;

    return e;

    function remove() {
        e.remove();
    }

    function addAnswer() {
        input.answers.appendChild(answerForm());
    }

    function read() {
        return {
            text: input.text.value,
            answers: [...input.answers.children].map(c => c.read())
        };
    }
}

function answerForm() {
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
    </div>
    `;
    e.read = read;

    return e;

    function remove() {
        e.remove();
    }

    function read() {
        return { text: input.text.value, correct: input.check.checked };
    }
}