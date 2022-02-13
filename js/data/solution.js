import { getUserIdentifier } from '../util.js';
import { get, post } from './api.js';
import { createPointer, endpoints } from './data.js';


export async function submitSolution(quizId, config, solution) {
    const identifier = getUserIdentifier();
    const submission = {
        quiz: createPointer('Quiz', quizId),
        identifier,
        answers: solution
    };

    post(endpoints.solutions, submission);
}

export async function getQuizStats(quizId, config) {
    const ids = {};
    const submissions = await get(endpoints.recentSolutionsByQuiz(quizId, config));
    const answers = submissions.results
        .filter(r => {
            if (ids[r.identifier] != undefined) {
                ids[r.identifier]++;
                return false;
            } else {
                ids[r.identifier] = 1;
                return true;
            }
        })
        .map(r => r.answers)
        .reduce((a, c) => {
            c.forEach((q, i) => {
                a[i] = aggregateAnswers(a[i], q);
            });
            return a;
        }, []);

    return answers;
}

function aggregateAnswers(acc, question) {
    if (acc == undefined) {
        acc = {
            total: 0
        };
    }

    Object.entries(question).forEach(([index, value]) => {
        if (typeof value == 'boolean') {
            if (value) {
                acc[index] = (acc[index] || 0) + 1;
            }
        } else {
            if (acc[index] == undefined) {
                acc[index] = [];
            }
            acc[index].push(value);
        }
    });
    acc.total++;

    return acc;
}