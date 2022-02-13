import { getUserData, getUserIdentifier } from '../util.js';
import { post } from './api.js';
import { createPointer, endpoints } from './data.js';


export  async function submitSolution(quizId, solution) {
    const userData = getUserData();
    if (userData && userData.roles.includes('Admin')) {
        // Fetch results
    } else {
        // Submit solution
        const identifier = getUserIdentifier();
        const submission = {
            quiz: createPointer('Quiz', quizId),
            identifier,
            answers: solution 
        };

        post(endpoints.solutions, submission);
    }
}