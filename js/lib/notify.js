const container = document.createElement('div');
container.id = 'notification';
const list = document.createElement('ul');
list.addEventListener('click', onClick);
container.appendChild(list);


document.body.appendChild(container);

export function notify(message) {
    const liItem = document.createElement('li');
    liItem.className = 'notification';
    liItem.textContent = message + ' \u2716';
    list.appendChild(liItem);

    setTimeout(() => liItem.remove(), 3000);
}

function onClick(event) {
    if (event.target.tagName == 'LI') {
        event.target.remove();
    }
}