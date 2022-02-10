import { getQuiz } from '../data.js';
import { createQuestion } from '../data/question.js';
import { createQuiz, getCategories } from '../data/quiz.js';
import html from '../dom.js';
import { createSubmitHandler } from '../util.js';


const pageTemplate = (categories, name, questions, onSubmit) => html`<div>
    <h1>Import Quiz</h1>
    <div className="question">
        <h3>${name}</h3>
        <p>${questions} questions</p>
        <form onSubmit=${onSubmit} className="input-form">
            <label className="form-field"><span>Order</span><input type="number" name="order" /></label>
            <label className="form-field"><span>Category</span>
                <select name="category">
                    ${categories.map(c => html`<option value=${c.objectId}>${c.name}</option>`)}
                </select>
            </label>
            <div className="form-row">
                <button className="form-action" type="submit">Confirm</button>
            </div>
        </form>
        <div id="output"></div>
    </div>
</div>`;

export async function importerPage(ctx) {
    const [categories, quizData] = await Promise.all([
        getCategories(),
        getQuiz(ctx.params.id)
    ]);
    console.log(categories, quizData);

    return pageTemplate(categories, quizData.name, quizData.questions.length, createSubmitHandler(onSubmit, 'order', 'category'));

    async function onSubmit(data) {
        const output = document.getElementById('output');
        const result = html`<p>Working ...</p>`;
        output.appendChild(result);

        let quizId;

        try {
            const quiz = await createQuiz({
                name: quizData.name,
                order: Number(data.order),
                category: data.category
            });
            quizId = quiz.objectId;

            output.appendChild(html`<p>Quiz created</p>`);
        } catch (err) {
            result.textContent = 'Error creating quiz';
            console.error(err);
            return;
        }

        for (let i = 0; i < quizData.questions.length; i++) {
            const questionData = quizData.questions[i];
            const result = html`<p>Question ${i + 1} ...</p>`;
            output.appendChild(result);

            try {
                await createQuestion({
                    text: questionData.text,
                    dontRandomize: questionData.dontRandomize || false,
                    order: (i + 1) * 10,
                    quiz: quizId,
                    answers: questionData.answers
                });
                result.textContent = `Question ${i + 1} OK`;
            } catch (err) {
                result.textContent = err.message;
                console.error(err);
                break;
            }
        }

        result.textContent = 'Done';
    }
}