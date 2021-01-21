import html from './dom.js';


export default function quizPage(quiz) {
    const input = {
        questions: html`
        <div>
            ${quiz.questions.map(quizQuestion)}
        </div>`,
        button: html`<button className="validate-btn" onClick=${validate}>Изпрати отговори</button>`
    };

    return html`
    <div>
        <h1>${quiz.name}</h1>
        ${input.questions}
        ${input.button}
    </div>`;

    function validate() {
        const result = [...input.questions.children].map(c => c.validate());
        const correct = result.filter(e => e);
        input.button.textContent = `${correct.length} / ${result.length} верни отговора`;
    }
}

function quizQuestion(question, index) {
    const input = {
        answers: html`
        <div>
            ${question.answers.map(a => ({a, o: Math.random()})).sort(({o: a}, {o: b}) => a - b).map((a, i) => quizAnswer(a.a, i, index))}
        </div>`
    };

    const e = html`
        <div className="question">
            <h3>${parseToElement(question.text)}</h3>
            ${input.answers}
        </div>
        `;
    e.validate = validate;

    return e;

    function validate() {
        const correct = [...input.answers.children].map(c => c.validate()).reduce((a, c) => a && c, true);

        if (correct) {
            e.classList.add('correct');
            return true;
        } else {
            e.classList.add('wrong');
            return false;
        }
    }
}

function quizAnswer(answer, index, questionIndex) {
    const e = html`
        <label className="answer">
            <input name=${'question' + questionIndex} type="radio" value=${index} />
            ${parseToElement(answer.text)}
        </label>`;
    e.validate = validate;

    return e;

    function validate() {
        if (answer.correct) {
            e.classList.add('correct');
            if (e.children[0].checked) {
                e.classList.add('selected-correct');
                return true;
            } else {
                e.classList.remove('selected-correct');
                return false;
            }
        } else {
            if (e.children[0].checked) {
                e.classList.add('selected-wrong');
                return false;
            } else {
                e.classList.remove('selected-wrong');
                return true;
            }
        }
    }
}

function parseToElement(text) {
    const tokens = text.split('`');

    if (tokens.length > 1) {
        const result = [];

        let open = false;
        for (let token of tokens) {
            if (!open) {
                result.push(token);
                open = true;
            } else {
                result.push(html`<span className="code">${token}</span>`);
                open = false;
            }
        }

        return html`<span className="answer-text">${result}</span>`;
    }

    return text;
}