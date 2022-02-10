const appver = 'quiz_1.0';


export function setUserData(userData) {
    localStorage.setItem('userData', JSON.stringify(Object.assign({}, userData, { __v: appver })));
}

export function getUserData() {
    const data = JSON.parse(localStorage.getItem('userData'));
    if (data && data.__v != appver) {
        localStorage.removeItem('userData');
        return null;
    } else {
        return data;
    }
}

export function clearUserData() {
    localStorage.removeItem('userData');
}

export function createSubmitHandler(callback, ...fields) {
    return async function (event) {
        event.preventDefault();
        const formData = new FormData(event.target);

        const elements = [...event.target.querySelectorAll('input, textarea, button')];
        elements.forEach(f => f.disabled = true);

        const submitBtn = event.target.querySelector('button[type="submit"]');
        let oldContent;
        if (submitBtn) {
            oldContent = submitBtn.innerHTML;
            submitBtn.innerHTML = 'Loading&hellip;';
        }

        const data = fields.reduce((a, c) => Object.assign(a, { [c]: formData.get(c).trim() }), {});

        try {
            await callback(data, event);
        } catch (err) {
            console.error(err);
        } finally {
            elements.forEach(f => f.disabled = false);
            if (submitBtn) {
                submitBtn.innerHTML = oldContent;
            }
        }
    };
}

export function parseQuery(querystring) {
    if (querystring == '') {
        return {};
    } else {
        return querystring.split('&').reduce((a, c) => {
            const [key, value] = c.split('=');
            a[key] = value;
            return a;
        }, {});
    }
}

export function urlName(name) {
    return name.toLocaleLowerCase().replace(/ |[^a-zA-Z0-9-]/g, (match) => {
        return match == ' ' ? '-' : '';
    });
}