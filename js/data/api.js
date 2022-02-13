import { notify } from '../lib/notify.js';
import { clearUserData, getUserData, setUserData } from '../util.js';
import { createPointer, createPointerQuery, createQuery } from './data.js';


const hostname = 'https://parseapi.back4app.com';

async function request(url, options) {
    try {
        const response = await fetch(hostname + url, options);

        if (response.ok == false) {
            const error = await response.json();
            if (error.code == 209) {
                clearUserData();
            }
            throw {
                message: error.error || error.message,
                code: error.code
            };
        }

        return response.json();
    } catch (err) {
        // notify(err.message);
        throw err;
    }
}

function createOptions(method = 'get', data) {
    const options = {
        method,
        headers: {
            'X-Parse-Application-Id': 'ZdPbq6ApEUdeU0gaZBVWDqKAFp2mbYPbPhpfTDeB',
            'X-Parse-Javascript-Key': 'MRUHf6oOB1fleTX28HlGLjZsJmSayx1OPlQEv7qC'
        }
    };

    const userData = getUserData();
    if (userData) {
        options.headers['X-Parse-Session-Token'] = userData.token;
    }

    if (data) {
        options.headers['Content-Type'] = 'application/json';
        options.body = JSON.stringify(data);
    }

    return options;
}

export async function get(url) {
    return request(url, createOptions());
}

export async function post(url, data) {
    return request(url, createOptions('post', data));
}

export async function put(url, data) {
    return request(url, createOptions('put', data));
}

export async function del(url) {
    return request(url, createOptions('delete'));
}

async function info(userObject) {
    if (userObject) {
        const result = await get(`/roles?where=${createPointerQuery('users', '_User', userObject.objectId)}`);
        return result.results.map(r => r.name);
    } else {
        throw new Error('User is not logged in');
    }
}

export async function login(username, password) {
    const result = await post('/login', { username, password });
    const roles = await info(result);

    const userData = {
        username: result.username,
        id: result.objectId,
        roles,
        token: result.sessionToken
    };
    setUserData(userData);

    return result;
}

export async function register(username, password) {
    const result = await post('/users', { username, password });

    const userData = {
        username,
        id: result.objectId,
        token: result.sessionToken
    };
    setUserData(userData);

    return result;
}

export async function logout() {
    post('/logout');
    clearUserData();
}