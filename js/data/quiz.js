import * as api from './api.js';
import { createPointer, endpoints } from './data.js';


export async function getCategories() {
    const data = await api.get(endpoints.categories);
    return data.results;
}

export async function getQuizesByCategory(catId) {
    const data = await api.get(endpoints.quizesByCategory(catId));
    return data.results.map(quizViewModel);
}

export async function createQuiz(quiz) {
    return api.post(endpoints.quizes, quizModelToRecord(quiz));
}

export async function updateQuiz(id, quiz) {
    return api.put(endpoints.quizById(id), quizModelToRecord(quiz));
}

export async function deleteQuiz(id) {
    return api.del(endpoints.quizById(id));
}

function quizModelToRecord(quiz) {
    const result = Object.assign({}, quiz, {
        category: createPointer('Category', quiz.category)
    });
    delete result.createdAt;
    delete result.updatedAt;
    return result;
}

function quizViewModel(quiz) {
    return Object.assign({}, quiz, {
        category: quiz.category.objectId
    });
}

// VDH2JfspGQ