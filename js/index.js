import page from './lib/page.mjs';

import addSession from './middlewares/session.js';
import notify from './middlewares/notify.js';

import { parseQuery } from './util.js';
import quizPage from './views/quizPage.js';
import quizMaker from './views/quizMaker.js';
import { getCategories } from './data/quiz.js';
import { catalog, catSelector } from './views/catalog.js';
import { loginPage } from './views/login.js';
import { registerPage } from './views/register.js';

import { importerPage } from './views/importer.js';
import { loader } from './views/common/loader.js';


window.onload = async () => {
    const categories = await getCategories();

    const main = document.querySelector('main');
    const spinner = loader();

    page(addSession());
    page(notify());

    page('/index.html', '/');
    page('/', render(catSelector));
    page('/preview', render(quizPage));
    page('/maker', render(quizMaker));
    page('/maker/:id', render(quizMaker));
    page('/category/:id', render(catalog));
    page('/category/:id/:catName', render(catalog));
    page('/quiz/:id', render(quizPage));
    page('/quiz/:id/:quizName', render(quizPage));

    page('/login', render(loginPage));
    page('/register', render(registerPage));
    page('/import/:id', render(importerPage));

    page('/:id', quizRedirect);

    page.start();

    function render(component) {
        return async (ctx) => {
            main.appendChild(spinner);
            ctx.categories = categories;
            ctx.query = parseQuery(ctx.querystring);
            try {
                const result = await component(ctx);
                main.replaceChildren(result);
            } catch (err) {
                spinner.remove();
                notify(err.message);
            }
        };
    }
};

function quizRedirect(ctx) {
    page.redirect('/quiz/' + ctx.params.id);
}