export async function getQuizes() {
    const quiz3 = await (await fetch('/quizes/03.json')).json();

    return [quiz3];
}