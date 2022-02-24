import html from '../dom.js';
import { exportToJson } from '../data.js';
import { createQuestion, deleteQuestion, getQuestionsByQuiz, updateQuestion } from '../data/question.js';
import { createQuiz, getQuizById, updateQuiz } from '../data/quiz.js';
import { notify } from '../lib/notify.js';
import { overlayElement } from './common/loader.js';

export default async function quizMaker({ params: { id }, categories, page }) {
    const input = {
        list: html`<ol></ol>`,
        name: html`<input id="quiz-name" className="quiz-name" type="text" name="name" />`,
        category: catSelector(categories),
        order: html`<input type="number" name="order" />`,
        visible: html`<input type="checkbox" name="visible" />`,
    };

    const titleSection = html`
    <section className="maker-title">
        <label htmlFor="quiz-name">Quiz name:</label>
        ${input.name}
        <label className="maker-input-row"><span>Category:</span>${input.category}</label>
        <label className="maker-input-row"><span>Order:</span>${input.order}</label>
        <label className="maker-input-row"><span>Visible:</span>${input.visible}</label>
        <button onClick=${onSave}>Save Changes</button>
        ${id != undefined ? html`
        <button onClick=${downloadQuiz}>Export</button>
        <a target="_blank" href="/quiz/${id}">Quiz page</a>` : ''}
    </section>`;

    const questionSection = html`
    <section>
        ${input.list}
        <div className="question-form">
            <button onClick=${onAddClick}>&#10010; Add question</button>
        </div>
    </section>`;

    const e = html`
    <div className="quiz-maker">
        <h1>Quiz Editor</h1>
        ${titleSection}
        ${id != undefined ? questionSection : ''}
    </div>`;

    if (id != undefined) {
        const data = await Promise.all([
            getQuizById(id),
            getQuestionsByQuiz(id)
        ]);
        const quiz = data[0];
        quiz.questions = data[1];

        input.name.value = quiz.name;
        input.category.value = quiz.category;
        input.order.value = quiz.order;
        input.visible.checked = quiz.visible;

        for (let question of quiz.questions) {
            addQuestion(question);
        }
    }

    return e;

    function onAddClick() {
        input.list.appendChild(questionForm({
            order: 0,
            text: '',
            answers: [],
            dontRandomize: false,
            quiz: id
        }));
    }

    function addQuestion(question) {
        input.list.appendChild(questionForm(question));
    }

    function toJSON() {
        const data = {
            name: input.name.value,
            category: input.category.value,
            questions: [...input.list.children].map(c => c.read())
        };
        return JSON.stringify(data, null, 2);
    }

    function downloadQuiz() {
        exportToJson(toJSON());
    }

    async function onSave() {
        const data = {
            name: input.name.value,
            category: input.category.value,
            order: Number(input.order.value),
            visible: input.visible.checked
        };

        const over = overlayElement(titleSection);

        try {
            if (id != undefined) {
                await updateQuiz(id, data);
            } else {
                const result = await createQuiz(data);
                page.redirect(`/maker/${result.objectId}`);
            }
        } catch (err) {
            notify(err.message);
        } finally {
            over.remove();
        }
    }
}


function catSelector(categories) {
    return html`<select name="category">
    ${categories.map(c => html`<option value=${c.objectId}>${c.name}</option>`)}
</select>`;
}

function questionForm(question) {
    const input = {
        order: html`<input type="number" name="order" />`,
        text: html`<textarea />`,
        answers: html`<div></div>`,
        dontRandomize: html`<input type="checkbox" />`
    };

    const e = html`
    <div className="question-form">
        <label className="maker-input-row">Order ${input.order}</label>
        <label className="maker-input-row">${input.dontRandomize} Keep answer order</label>
        <label className="maker-input-row"><input onClick=${onMultiline} type="checkbox" /> Multiline</label>
        <label>
            <li className="form-label">Question:</li>
            ${input.text}
        </label>
        <div className="question-answers">
            ${input.answers}
            <button onClick=${onAddClick}>Add answer</button>
        </div>
        <div className="question-control">
            <button>Preview</button>
            <button onClick=${onSave}>Save changes</button>
            <button onClick=${onDelete}>&#10006; Delete question</button>
        </div>
    </div>`;
    e.read = read;

    if (question != undefined) {
        input.order.value = question.order;
        input.text.value = question.text;
        input.dontRandomize.checked = question.dontRandomize;

        for (let answer of question.answers) {
            addAnswer(answer);
        }
    }

    return e;

    async function onSave() {
        const over = overlayElement(e);
        try {
            const data = read();
            if (question.objectId) {
                question = await updateQuestion(question.objectId, data);
            } else {
                question = await createQuestion(data);
            }
        } catch (err) {
            notify(err.message);
        } finally {
            over.remove();
        }
    }

    async function onDelete() {
        const choice = confirm('Please confirm deleting this question');
        if (choice) {
            const over = overlayElement(e);
            try {
                if (question.objectId) {
                    await deleteQuestion(question.objectId);
                }
                e.remove();
            } catch (err) {
                over.remove();
                notify(err.message);
            }
        }
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
            order: Number(input.order.value),
            text: input.text.value,
            answers: [...input.answers.children].map(c => c.read()),
            dontRandomize: input.dontRandomize.checked,
            quiz: question.quiz
        };
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