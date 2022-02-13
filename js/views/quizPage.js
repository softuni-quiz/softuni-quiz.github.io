import html from '../dom.js';
import { getQuizById } from '../data/quiz.js';
import { parseToElements } from '../parser.js';
import { getQuestionsByQuiz } from '../data/question.js';
import { urlName } from '../util.js';
import { getQuizStats, submitSolution } from '../data/solution.js';


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
        button: html`<button className="validate-btn" onClick=${()=> validate()}>Изпрати отговори</button>`
    };

    return html`
    <div>
        <h1>${quiz.name}</h1>
        <a className="nav" href="/category/${quiz.category}/${urlName(catName)}">Назад към каталога</a>
        ${createAdminPanel()}
        ${input.questions}
        ${input.button}
    </div>`;

    function validate(hours = 1) {
        const result = [...input.questions.children].map(c => c.validate());
        const correct = result.filter(e => e);
        input.button.textContent = `${correct.length} / ${result.length} верни отговора`;

        const config = `from=${from}&to=${to}`;
        if (isAdmin) {
            displayStats(id, config, [...input.questions.children], hours);
        } else {
            // Stat collection
            const solution = [...input.questions.children].map(c => c.collect());
            submitSolution(id, config, solution);
        }
    }

    function createAdminPanel() {
        if (isAdmin) {
            return html`
            <div>
                <a className="nav" href="/maker/${id}">Редактор</a>
                <a className="nav" onClick=${()=> validate(6)} href="javascript:void(0)">Статистика 6h</a>
                <a className="nav" onClick=${()=> validate(12)} href="javascript:void(0)">Статистика 12h</a>
                <a className="nav" onClick=${()=> validate(24)} href="javascript:void(0)">Статистика 24h</a>
            </div>`;
        } else {
            return '';
        }
    }
}

async function displayStats(quizId, config, elements, hours) {
    const stats = await getQuizStats(quizId, config, hours);
    for (let i = 0; i < elements.length; i++) {
        elements[i].showStats(stats[i]);
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

    question.answers = question.answers.map((a, i) => ({ a, o: Math.random(), originalIndex: i }));
    if (!question.dontRandomize) {
        question.answers.sort(({ o: a }, { o: b }) => a - b);
    }

    const input = {
        answers: html`
        <div>
            ${question.answers.map((a, i) => quizAnswer(a.a, i, index, type, a.originalIndex))}
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
    e.collect = collect;
    e.showStats = showStats;

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

    function collect() {
        return [...input.answers.children].map(c => c.collect()).reduce((a, c) => Object.assign(a, c), {});
    }

    function showStats(stats) {
        [...input.answers.children].forEach(a => a.showStats(stats));
    }
}

function quizAnswer(answer, index, questionIndex, type = 'closed', originalIndex) {
    const inputType = {
        'open': 'text',
        'multi': 'checkbox',
        'closed': 'radio'
    }[type];

    const input = html`<input name=${'question' + questionIndex} type=${inputType} value=${type !='open' ? index : '' } />`;
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
    e.collect = collect;
    e.showStats = showStats;

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

    function collect() {
        return { [originalIndex.toString()]: type == 'open' ? input.value : e.children[0].checked };
    }

    function showStats(stats) {
        composeStats(type, stats, originalIndex, e);
    }
}

function composeStats(type, stats, originalIndex, element) {
    if (type == 'open') {
        const given = {};
        stats[originalIndex.toString()].forEach(a => {
            const asString = a.toString().toLocaleLowerCase();
            if (given[asString] == undefined) {
                given[asString] = 0;
            }
            given[asString]++;
        });
        const output = Object.entries(given)
            .sort(([value1, count1], [value2, count2]) => count2 - count1)
            .map(([value, count]) => html`<p>${createStatBubble(count / stats.total)} ${value}</p>`);

        element.appendChild(html`<div>${output}</div>`);
    } else {
        const selected = stats[originalIndex.toString()] || 0;
        element.prepend(createStatBubble(selected / stats.total));
    }
}

function createStatBubble(value) {
    const percentage = Math.round(value * 100);
    const bubble = html`<span className="stats-percentage">${percentage}%</span>`;
    bubble.style.background = `linear-gradient(to right, #fff ${percentage}%, #ddd 0)`;

    return bubble;
}