import { getUserData } from '../util.js';


export const endpoints = {
    categories: '/classes/Category?order=order',
    quizes: '/classes/Quiz',
    quizesByCategory: (catId) => `/classes/Quiz?order=order&where=${createPointerQuery('category', 'Category', catId)}`,
    quizById: (id) => `/classes/Quiz/${id}`,
    questions: '/classes/Question',
    questionsByQuizId: (quizId) => `/classes/Question?order=order&where=${createPointerQuery('quiz', 'Quiz', quizId)}`,
    questionById: (id) => `/classes/Quiz/${id}`,
    solutions: '/classes/Solution',
    recentSolutionsByQuiz: (quizId, config) => `/classes/Solution?where=${createQuery({
        quiz: createPointer('Quiz', quizId),
        createdAt: createTimeQuery(),
        config
    })}&order=createdAt`
};

function createTimeQuery() {
    const limit = new Date();
    limit.setHours(limit.getHours() - 10); // TODO reduce timespan

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