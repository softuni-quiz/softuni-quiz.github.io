import page from '//unpkg.com/page/page.mjs';
import html from './dom.js';
import quizPage from './quizPage.js';
import quizMaker from './quizMaker.js';
import { getQuizes } from './quizes.js';


window.onload = async () => {
    const main = document.querySelector('main');

    const quizes = await getQuizes();

    page('/', render(quizPage(quizes[0])));
    page('/maker', render(quizMaker()));

    page.start();

    function render(component) {
        return () => {
            main.innerHTML = '';
            main.appendChild(component);
        };
    }
};
