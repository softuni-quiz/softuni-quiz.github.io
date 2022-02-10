import * as api from './api.js';
import { createPointer, endpoints } from './data.js';


export async function getQuestionsByQuiz(quizId) {
    const data = await api.get(endpoints.questionsByQuizId(quizId));
    return data.results.map(questionViewMovel);
}

export async function createQuestion(question) {
    return api.post(endpoints.questions, questionModelToRecord(question));
}

export async function updateQuestion(id, question) {
    return api.put(endpoints.questionById(id), questionModelToRecord(question));
}

export async function deleteQuestion(id) {
    return api.del(endpoints.questionById(id));
}

function questionModelToRecord(question) {
    const result = Object.assign({}, question, {
        quiz: createPointer('Quiz', question.quiz)
    });
    delete result.createdAt;
    delete result.updatedAt;
    return result;
}

function questionViewMovel(question) {
    return Object.assign({}, question, {
        quiz: question.quiz.objectId
    });
}

// YahlbmOXiT