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

export function getUserIdentifier() {
    let id;
    const cookies = document.cookie.split(';').reduce((a, c) => {
        const [key, value] = c.trim().split('=');
        a[key] = value;
        return a;
    }, {});

    if (cookies.appver != appver || !cookies.identifier) {
        id = uuid();
        const expiry = new Date();
        expiry.setMonth(expiry.getMonth() + 1);
        document.cookie = `appver=${appver}; expires=${expiry}; path=/`;
        document.cookie = `identifier=${id}; expires=${expiry}; path=/`;
    } else {
        id = cookies.identifier;
    }

    return id;
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

function uuid() {
    return 'xxxxxxxx-xxxx'.replace(/x/g, () => (Math.random() * 16 | 0).toString(16));
}

export function hashOpen(value) {
    const asNumber = Number(value);
    if (value != '' && Number.isNaN(asNumber) == false) {
        return asNumber.toFixed(2);
    } else {
        return value.trim().toLocaleLowerCase();
    }
}

export function compareOpen(value, expected) {
    const asNumber = Number(expected);
    if (Number.isNaN(asNumber) == false) {
        return Number(value).toFixed(1) == asNumber.toFixed(1);
    } else {
        return value.trim().toLocaleLowerCase() == expected.trim().toLocaleLowerCase();
    }
}