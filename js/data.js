export async function getQuiz(id) {
    return await (await fetch(`/quizes/${id}.json`)).json();
}

export async function getQuizIndex() {
    return await (await fetch('/quizes/index.json')).json();
}


export function exportToJson(data, name = 'Output') {
    const blob = new Blob([data], { type: 'application/json' });
    if (window.navigator.msSaveOrOpenBlob) {
        window.navigator.msSaveBlob(blob, name + '.json');
    } else {
        var elem = window.document.createElement('a');
        elem.href = window.URL.createObjectURL(blob);
        elem.download = name + '.json';
        document.body.appendChild(elem);
        elem.click();
        document.body.removeChild(elem);
    }
}