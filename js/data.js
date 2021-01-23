export async function getQuiz(id) {
    return await (await fetch(`/quizes/${id}.json`)).json();
}

export async function getQuizIndex() {
    return await (await fetch('/quizes/index.json')).json();
}