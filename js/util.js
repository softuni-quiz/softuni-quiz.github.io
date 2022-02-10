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
    return function (event) {
        event.preventDefault();
        const formData = new FormData(event.target);

        const data = fields.reduce((a, c) => Object.assign(a, { [c]: formData.get(c).trim() }), {});

        callback(data, event);
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