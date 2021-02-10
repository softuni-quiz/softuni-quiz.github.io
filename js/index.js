import page from '//unpkg.com/page/page.mjs';
import html from './dom.js';
import quizPage from './quizPage.js';
import quizMaker from './quizMaker.js';
import { getQuizIndex } from './data.js';


window.onload = async () => {
    const main = document.querySelector('main');

    page('/', render(catalog));
    page('/preview', render(quizPage));
    page('/maker', render(quizMaker));
    page('/maker/:id', render(quizMaker));
    page('/:id', render(quizPage));

    page.start();

    function render(component) {
        return async (ctx) => {
            const result = await component(ctx);
            main.innerHTML = '';
            main.appendChild(result);
        };
    }
};


async function catalog() {
    const list = await getQuizIndex();

    return html`
    <div>
        <h1>JS Advanced Quiz Catalog</h1>
        <div className="question">
            <p>Изберете лекция, за да отворите прилежащия тест:</p>
            <ul>
                ${list.map(i => html`<li><a className="nav list" href=${`/${i.id}`}>${i.name}</a></li>`)}
            </ul>
        </div>
    </div>`;
}