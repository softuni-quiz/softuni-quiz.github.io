import html from '../dom.js';
import { getQuizById } from '../data/quiz.js';
import { parseToElements } from '../parser.js';
import { getQuestionsByQuiz } from '../data/question.js';
import { urlName } from '../util.js';


export default async function quizPage({ categories, params: { id }, query, isAdmin }) {
    let catName;
    let quiz;
    if (id != undefined) {
        const data = await Promise.all([
            getQuizById(id),
            getQuestionsByQuiz(id)
        ]);
        quiz = data[0];
        quiz.questions = data[1];
        catName = categories.find(c => c.objectId == quiz.category).name;
    } else if (localStorage.getItem('recentQuiz') != null) {
        quiz = JSON.parse(localStorage.getItem('recentQuiz'));
    } else {
        return html`<p>400 Missing quiz ID</p>`;
    }

    const from = Number(query.from) || 1;
    const to = Number(query.to) || quiz.questions.length;
    const questions = quiz.questions.slice(from - 1, to);

    const input = {
        questions: html`
        <ol start=${from}>
            ${questions.map(quizQuestion)}
        </ol>`,
        button: html`<button className="validate-btn" onClick=${validate}>Изпрати отговори</button>`
    };

    return html`
    <div>
        <h1>${quiz.name}</h1>
        <a className="nav" href="/category/${quiz.category}/${urlName(catName)}">Назад към каталога</a>
        ${isAdmin ? html`<a className="nav" href="/maker/${id}">Редактор</a>` : ''}
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
    const type = (() => {
        if (question.answers.length == 1) {
            return 'open';
        } else if (question.answers.filter(a => a.correct).length > 1) {
            return 'multi';
        } else {
            return 'closed';
        }
    })();

    question.answers = question.answers.map(a => ({ a, o: Math.random() }));
    if (!question.dontRandomize) {
        question.answers.sort(({ o: a }, { o: b }) => a - b);
    }

    const input = {
        answers: html`
        <div>
            ${question.answers.map((a, i) => quizAnswer(a.a, i, index, type))}
        </div>`
    };

    const container = html`<h3></h3>`;
    container.innerHTML = parseToElements(question.text);
    const e = html`
        <div className="question">
            <li>${container}</li>
            ${type == 'multi' ? html`<span className="subtle">(изберете всички подходящи отговори)</span>` : ''}
            ${type == 'open' ? html`<span className="subtle">(въведете верния отговор)</span>` : ''}
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

function quizAnswer(answer, index, questionIndex, type = 'closed') {
    const inputType = {
        'open': 'text',
        'multi': 'checkbox',
        'closed': 'radio'
    }[type];

    const input = html`<input name=${'question' + questionIndex} type=${inputType} value=${type != 'open' ? index : ''} />`;
    const container = html`<span></span>`;
    if (type != 'open') {
        container.innerHTML = parseToElements(answer.text.replace(/{{(n)}}/g, () => index + 1));
    }
    const e = html`
        <label className="answer">
            ${input}
            ${container}
        </label>`;
    e.validate = validate;

    return e;

    function validate() {
        if (answer.correct) {
            e.classList.add('correct');
            if ((type == 'open' && input.value == answer.text) || e.children[0].checked) {
                e.classList.add('selected-correct');
                return true;
            } else {
                e.classList.remove('selected-correct');
                if (type == 'open') {
                    container.innerHTML = `Правилен отговор: ${answer.text}`;
                }
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
