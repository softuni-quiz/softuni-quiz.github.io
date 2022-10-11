import html from '../dom.js';
import { getQuizById } from '../data/quiz.js';
import { getQuestionsByQuiz } from '../data/question.js';
import { urlName } from '../util.js';
import { getQuizStats, submitSolution } from '../data/solution.js';
import { quizQuestion } from './common/question.js';


export default async function quizPage({ categories, params: { id }, query, isAdmin, isTA }) {
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
        button: html`<button className="validate-btn" onClick=${() => validate()}>Изпрати отговори</button>`
    };

    if (isAdmin || isTA) {
        window.displayStats = (hours) => validate(hours);
    }

    return html`
    <div>
        <h1>${quiz.name}</h1>
        <div>
            <a className="nav" href="/category/${quiz.category}/${urlName(catName)}">Назад към каталога</a>
            <a className="nav" href="javascript:void(0)" onClick=${createPartialQuiz}>Частичен тест</a>
        </div>
        ${createAdminPanel()}
        ${input.questions}
        ${input.button}
    </div>`;

    function validate(hours = 1) {
        const result = [...input.questions.children].map(c => c.validate());
        const correct = result.filter(e => e);
        input.button.textContent = `${correct.length} / ${result.length} верни отговора`;

        const config = `from=${from}&to=${to}`;
        if (isAdmin || isTA) {
            displayStats(id, config, [...input.questions.children], hours);
        } else {
            // Stat collection
            const solution = [...input.questions.children].map(c => c.collect());
            submitSolution(id, config, solution);
        }
    }

    function createAdminPanel() {
        if (isAdmin || isTA) {
            return html`
            <div>
                ${isAdmin ? html`<a className="nav" href="/maker/${id}">Редактор</a>` : ''}
                <a className="nav" onClick=${() => validate(6)} href="javascript:void(0)">Статистика 6h</a>
                <a className="nav" onClick=${() => validate(12)} href="javascript:void(0)">Статистика 12h</a>
                <a className="nav" onClick=${() => validate(24)} href="javascript:void(0)">Статистика 24h</a>
            </div>`;
        } else {
            return '';
        }
    }
}

async function displayStats(quizId, config, elements, hours) {
    /** @type {QuizStats} */
    const stats = await getQuizStats(quizId, config, hours);
    for (let i = 0; i < elements.length; i++) {
        const current = stats[i];
        if (current) {
            elements[i].showStats(current);
        }
    }
}

function createPartialQuiz() {
    const form = html`
    <form method="GET" onInput=${onInput}>
        <label className="form-field"><span>Начало</span><input type="number" value="1" name="from" /></label>
        <label className="form-field"><span>Край</span><input type="number" value="1" name="to" /></label>
        <div className="form-row">
            <button className="form-action" type="submit">Старт</button>
            <button className="form-action" onClick=${cancel}>Отказ</button>
        </div>
    </form>`;

    const dialog = html`
    <div className="dialog">
        ${form}
    </div>`;

    document.body.appendChild(dialog);

    function onInput(e) {
        const data = new FormData(form);
        const from = Number(data.get('from'));
        const to = Number(data.get('to'));

        if (Number.isInteger(from) && Number.isInteger(to) && from > 0 && to > 0 && from <= to) {
            highlight(from, to);
        }
    }

    function highlight(from, to) {
        console.log(from, to);
        [...document.querySelectorAll('div.question')].forEach((q, i) => {
            q.querySelector('div.partial-excluded')?.remove();
            const order = i + 1;
            if (order < from || order > to) {
                q.appendChild(html`<div className="partial-excluded"></div>`);
                q.classList.remove('partial-included');
            } else {
                q.classList.add('partial-included');
            }

            if (order == from) {
                q.classList.add('partial-from');
            } else {
                q.classList.remove('partial-from');
            }

            if (order == to) {
                q.classList.add('partial-to');
            } else {
                q.classList.remove('partial-to');
            }
        });
    }

    function cancel(e) {
        e.preventDefault();
        [...document.querySelectorAll('div.question')].forEach((q, i) => {
            q.querySelector('div.partial-excluded')?.remove();
            q.classList.remove('partial-included');
            q.classList.remove('partial-from');
            q.classList.remove('partial-to');
        });
        dialog.remove();
    }
}

/**
 * @typedef {Array<QuestionStats>} QuizStats
 */

/**
 * @typedef {Object} QuestionStats
 * @property {number} QuestionStats.total - Total submissions
 */