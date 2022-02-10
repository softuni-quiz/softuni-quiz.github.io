import { getQuizIndex } from '../data.js';
import html from '../dom.js';


export async function catSelector(ctx) {
    return html`
    <div>
        <h1>SoftUni Quizes</h1>
        ${ctx.isAdmin ? html`<a className="nav" href="/maker">Редактор</a>` : ''}
        <div className="question">
            <h2>Категории</h2>
            <ul>
                ${ctx.categories.map(i => html`<li><a className="nav list" href=${`/category/${i.id}`}>${i.name} </a>
                        </li>`)} </ul> </div> </div>`;
}

export async function catalog(ctx) {
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