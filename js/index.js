import page from './lib/page.mjs';
import html from './dom.js';
import quizPage from './quizPage.js';
import quizMaker from './quizMaker.js';
import { getCategories, getQuizIndex } from './data.js';


window.onload = async () => {
    const categories = await getCategories();

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
            ctx.categories = categories;
            ctx.query = query(ctx.querystring);
            const result = await component(ctx);
            main.innerHTML = '';
            main.appendChild(result);
        };
    }
};

function query(string) {
    return string
        .split('&')
        .filter(p => p != '')
        .map(p => p.split('='))
        .reduce((a, [k, v]) => Object.assign(a, { [k]: v }), {});
}

function quizRedirect(ctx) {
    page.redirect('/quiz/' + ctx.params.id);
}

async function catSelector(ctx) {
    return html`
    <div>
        <h1>SoftUni Quizes</h1>
        <div className="question">
            <h2>Категории</h2>
            <ul>
                ${ctx.categories.map(i => html`<li><a className="nav list" href=${`/category/${i.id}`}>${i.name} </a>
                        </li>`)} </ul> </div> </div>`;
}

async function catalog(ctx) {
    const catId = ctx.params.id;
    const list = (await getQuizIndex()).filter(q => q.category == catId);
    const catName = ctx.categories.find(c => c.id == catId).name;

    return html`
    <div>
        <h1>${catName}</h1>
        <a className="nav" href="/">Назад към категориите</a>
        <div className="question">
            <p>Изберете тема, за да отворите прилежащия тест:</p>
            <ul>
                ${list.map(i => html`<li><a className="nav list" href=${`/quiz/${i.id}`}>${i.name} </a> </li>`)} </ul>
                        </div> </div>`;
}