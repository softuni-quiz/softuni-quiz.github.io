import { getUserData } from '../util.js';


export const endpoints = {
    categories: '/classes/Category?order=order',
    quizes: '/classes/Quiz',
    quizesByCategory: (catId) => `/classes/Quiz?order=order&where=${createPointerQuery('category', 'Category', catId)}`,
    quizById: (id) => `/classes/Quiz/${id}`,
    questions: '/classes/Question',
    questionsByQuizId: (quizId) => `/classes/Question?order=order&where=${createPointerQuery('quiz', 'Quiz', quizId)}`,
    questionById: (id) => `/classes/Question/${id}`,
    solutions: '/classes/Solution',
    recentSolutionsByQuiz: (quizId, config, hours) => `/classes/Solution?where=${createQuery({
        quiz: createPointer('Quiz', quizId),
        createdAt: createTimeQuery(hours),
        config
    })}&order=createdAt`
};

function createTimeQuery(hours) {
    const limit = new Date();
    if (hours < 1) {
        const minutes = hours * 60;
        limit.setMinutes(limit.getMinutes() - minutes);
    } else {
        limit.setHours(limit.getHours() - hours);
    }

    return {
        $gte: {
            __type: 'Date',
            iso: limit.toISOString()
        }
    };
}

export function createPointerQuery(propName, className, objectId) {
    return createQuery({ [propName]: createPointer(className, objectId) });
}

export function createQuery(query) {
    return encodeURIComponent(JSON.stringify(query));
}

export function createPointer(className, objectId) {
    return {
        __type: 'Pointer',
        className,
        objectId
    };
}

export function addOwner(record) {
    const { id } = getUserData();
    record.owner = createPointer('_User', id);

    return record;
}