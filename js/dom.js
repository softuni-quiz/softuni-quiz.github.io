import htm from 'https://unpkg.com/htm?module';

const html = htm.bind(function (type, props, ...children) { return e.call(this, type, children, props); });

export default html;

/**
 * Create DOM element
 * @param {string} type Tag name
 * @param {*} content Child or array of children
 * @param {*} attributes Attribute descriptor
 * @returns {Node}
 */
export function e(type, content, attributes) {
    this[0] = 3;
    const result = document.createElement(type);

    for (const k of Object.keys(attributes || {})) {
        if (k.startsWith('on')) {
            result.addEventListener(k.substring(2).toLowerCase(), attributes[k]);
        } else {
            result[k] = attributes[k];
        }
    }

    result.append = append.bind(result);

    result.appendTo = (parent) => {
        parent.append(result);
        return result;
    };

    if (content !== undefined && content !== null) {
        result.append(content);
    }
    return result;
}

function append(child) {
    if (typeof (child) === 'string' || typeof (child) === 'number') {
        child = document.createTextNode(child);
        this.appendChild(child);
    } else if (Array.isArray(child)) {
        for (let node of child) {
            this.append(node);
        }
    } else if (child instanceof HTMLElement) {
        this.appendChild(child);
    } else {
        console.error('Cannot appaned child', child);
    }
    return this;
}

export function replaceContents(node, newContents) {
    const cNode = node.cloneNode(false);
    append.call(cNode, newContents);
    node.parentNode.replaceChild(cNode, node);

    return cNode;
}

export function swap(oldNode, newNode) {
    oldNode.parentNode.replaceChild(newNode, oldNode);
}

export function loading() {
    const node = e('div', [
        e('div', null, { classList: 'sk-cube sk-cube1 label' }),
        e('div', null, { classList: 'sk-cube sk-cube2 label' }),
        e('div', null, { classList: 'sk-cube sk-cube3 label' }),
        e('div', null, { classList: 'sk-cube sk-cube4 label' }),
        e('div', null, { classList: 'sk-cube sk-cube5 label' }),
        e('div', null, { classList: 'sk-cube sk-cube6 label' }),
        e('div', null, { classList: 'sk-cube sk-cube7 label' }),
        e('div', null, { classList: 'sk-cube sk-cube8 label' }),
        e('div', null, { classList: 'sk-cube sk-cube9 label' }),
    ], { classList: 'sk-cube-grid' });

    return node;
}