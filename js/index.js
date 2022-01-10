import page from '//unpkg.com/page/page.mjs';
import html from './dom.js';
import quizPage from './quizPage.js';
import quizMaker from './quizMaker.js';
import { getCategories, getQuizIndex } from './data.js';


window.onload = async () => {
    const main = document.querySelector('main');

    page('/index.html', '/');
    page('/', render(catSelector));
    page('/preview', render(quizPage));
    page('/maker', render(quizMaker));
    page('/maker/:id', render(quizMaker));
    page('/category/:id', render(catalog));
    page('/quiz/:id', render(quizPage));
    page('/:id', quizRedirect);

    page.start();

    function render(component) {
        return async (ctx) => {
            const result = await component(ctx);
            main.innerHTML = '';
            main.appendChild(result);
        };
    }
};

function quizRedirect(ctx) {
    page.redirect('/quiz/' + ctx.params.id);
}

async function catSelector() {
    const categories = await getCategories();

    return html`
    <div>
        <h1>SoftUni Quizes</h1>
        <div className="question">
            <h2>Категории</h2>
            <ul>
                ${categories.map(i => html`<li><a className="nav list" href=${`/category/${i.id}`}>${i.name}</a></li>`)}
            </ul>
        </div>
    </div>`;
}

async function catalog(ctx) {
    const catId = ctx.params.id;
    const list = (await getQuizIndex()).filter(q => q.category == catId);

    return html`
    <div>
        <h1>JS Advanced Quiz Catalog</h1>
        <div className="question">
            <p>Изберете лекция, за да отворите прилежащия тест:</p>
            <ul>
                ${list.map(i => html`<li><a className="nav list" href=${`/quiz/${i.id}`}>${i.name}</a></li>`)}
            </ul>
        </div>
    </div>`;
}