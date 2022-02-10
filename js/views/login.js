import html from '../dom.js';
import { login } from '../data/user.js';
import { notify } from '../lib/notify.js';
import { createSubmitHandler } from '../util.js';


const loginTemplate = (onSubmit) => html`<div>
    <h1>Login</h1>
    <div className="question">
        <form onSubmit=${onSubmit} className="input-form">
            <label className="form-field"><span>Username</span><input type="text" name="username" /></label>
            <label className="form-field"><span>Password</span><input type="password" name="password" /></label>
            <div className="form-row">
                <input className="form-action" type="submit" value="Login" />
            </div>
        </form>
    </div>
</div>`;

export async function loginPage(ctx) {
    return loginTemplate(createSubmitHandler(onSubmit, 'username', 'password'));

    async function onSubmit(data) {
        try {
            await login(data.username, data.password);
            ctx.updateSession();
            ctx.page.redirect('/');
        } catch (err) {
            notify(err.message);
        }
    }
}