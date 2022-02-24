import html from '../dom.js';
import { getQuizesByCategory } from '../data/quiz.js';
import { urlName } from '../util.js';


export async function catSelector(ctx) {
    return html`
    <div>
        <h1>SoftUni Quizes</h1>
        ${ctx.isAdmin ? html`<a className="nav" href="/maker">Редактор</a>` : ''}
        <div className="question">
            <h2>Категории</h2>
            <ul>
                ${ctx.categories.map(i => html`<li><a className="nav list" href=${`/category/${i.objectId}/${urlName(i.name)}`}>${i.name} </a>
                        </li>`)} </ul> </div> </div>`;
}

export async function catalog(ctx) {
    const catId = ctx.params.id;
    const list = await getQuizesByCategory(catId);
    const catName = ctx.categories.find(c => c.objectId == catId).name;

    return html`
    <div>
        <h1>${catName}</h1>
        <a className="nav" href="/">Назад към категориите</a>
        <div className="question">
            <p>Изберете тема, за да отворите прилежащия тест:</p>
            <ul>
                ${list.filter(q => q.visible).map(i => html`<li><a className="nav list" href=${`/quiz/${i.objectId}/${urlName(i.name)}`}>${i.name} </a> </li>`)} </ul>
                        </div> </div>`;
}