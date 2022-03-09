import html from '../../dom.js';
import { parseToElements } from '../../parser.js';
import { compareOpen, hashOpen } from '../../util.js';


export function quizAnswer(answer, index, questionIndex, type = 'closed', originalIndex) {
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
    e.collect = collect;
    e.showStats = showStats;

    return e;

    function validate() {
        if (answer.correct) {
            e.classList.add('correct');
            if ((type == 'open' && compareOpen(input.value, answer.text)) || e.children[0].checked) {
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
        return { [originalIndex.toString()]: type == 'open' ? input.value.trim() : e.children[0].checked };
    }

    function showStats(stats) {
        composeStats(type, stats, originalIndex, e);
    }
}

/**
 * 
 * @param {string} type 
 * @param {import('../quizPage').QuestionStats} stats 
 * @param {number} originalIndex 
 * @param {HTMLElement} element 
 */
 export function composeStats(type, stats, originalIndex, element) {
    if (type == 'open') {
        const given = new Map();
        stats[originalIndex.toString()].forEach(a => {
            const asString = hashOpen(a);
            if (given.has(asString) == false) {
                given.set(asString, 0);
            }
            given.set(asString, given.get(asString) + 1);
        });
        const output = [...given.entries()]
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
