import html from '../../dom.js';
import { parseToElements } from '../../parser.js';
import { quizAnswer } from './answer.js';

export function quizQuestion(question, index) {
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
