import html from '../dom.js';
import { register } from '../data/user.js';
import { notify } from '../lib/notify.js';
import { createSubmitHandler } from '../util.js';


const registerTemplate = (onSubmit) => html`<div>
    <h1>Register</h1>
    <div className="question">
        <form onSubmit=${onSubmit} className="input-form">
            <label className="form-field"><span>Username</span><input type="text" name="username" /></label>
            <label className="form-field"><span>Password</span><input type="password" name="password" /></label>
            <label className="form-field"><span>Repeat</span><input type="password" name="repass" /></label>
            <div className="form-row">
                <button className="form-action" type="submit">Sign Up</button>
            </div>
        </form>
    </div>
</div>`;

export async function registerPage(ctx) {
    return registerTemplate(createSubmitHandler(onSubmit, 'username', 'password', 'repass'));

    async function onSubmit(data) {
        try {
            if (Object.values(data).some(v => v == '')) {
                throw new Error('All fields are required');
            }
            if (data.password != data.repass) {
                throw new Error('Passwords don\'t match');
            }

            await register(data.username, data.password);
            ctx.updateSession();
            ctx.page.redirect('/');
        } catch (err) {
            notify(err.message);
        }
    }
}