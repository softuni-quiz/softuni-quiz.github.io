const tags = {
    '`': token => `<span className="code">${token}</span>`,
    '```': token => `<span className="codeBlock">${token}</span>`,
};
const tagIndex = Object.keys(tags);
const tagMax = tagIndex.reduce((max, c) => Math.max(max, c.length), 0);

const keywords = [
    'function',
    'let',
    'const',
    'var',
    'return',
    'new',
    'true',
    'false',
    'if',
    'else',
    'while',
    'do',
    'switch',
    'break',
    'for',
    'in',
    'of',
    '=>',
	'async',
	'await',
	'import',
	'export',
	'from'
];

function read(text) {
    let offset = 0;

    return {
        peek(n = 1) {
            validate(n);
            return text.substring(offset, offset + n);
        },
        next(n = 1) {
            validate(n);
            const result = text.substring(offset, offset + n);
            offset += n;
            return result;
        },
        eof() {
            return offset >= text.length - 1;
        }
    };

    function validate(n) {
        console.log(offset, n);
        if (Math.max(offset, n) > 1000) {
            throw new RangeError();
        }

        if (offset + n > text.length) {
            throw new RangeError();
        }
    }
}

const tagModes = {
    default: (string) => {
        if (tagIndex.filter(t => t.substring(0, 1) == string[string.length - 1]).length > 0) {
            // last symbol in string is start of tag, change mode
            return ['tag', false];
        } else {
            return ['default', true];
        }
    },
    tag: () => { }
};

function tokenize(text) {
    const reader = read(text);
    const tokens = [];

    let mode = 'default';
    while (reader.eof() != true) {
        let current = '';

        let n = 1;
        while (true) {
            try {
                // has full tag or reached beginning of another tag -> how to differentiate tags with same symbols?
                let consume = false;
                [mode, consume] = tagModes[mode](reader.peek(n));
                if (consume) {
                    current = reader.next(n);
                    n = 1;
                }
            } catch (err) {
                // end of file, consume remaining characters
                // TODO
                break;
            }
            n++;
        }
    }

    console.log(tokens);

    let offset = 0;

    return {
        peek(n = 1) {
            return text.slice(offset, offset + n);
        },
        next(n = 1) {
            const result = text.slice(offset, offset + n);
            offset += n;
            return result;
        }
    };
}

function parse(text) {
    const tokenizer = tokenize(text);

    // TODO
}

export function parseToElements(text) {
    return createTokens(text)
        .map(t => t.type == 'text' ? parseTextNode(t.token) : createBlock(t.token))
        .join('');
}

function parseTextNode(text) {
    return text
        .replace(/`([^`]+)`/gi, (match, token) => `<span class="code">${token}</span>`)
        .split('\n')
        .filter(t => t != '')
        .join('<br />');
}

function createTokens(text) {
    const result = [];

    const tokens = text.split('```');

    let open = false;
    for (let token of tokens) {
        if (!open) {
            result.push({
                type: 'text',
                token
            });
            open = true;
        } else {
            result.push({
                type: 'block',
                token
            });
            open = false;
        }
    }
    return result;
}

function createBlock(text) {
    text = text.trim().split('\n');

    const result = ['<ol class="code codeBlock">'];

    for (let token of text) {
        token = token
            .replace(/^ +/g, (match) => '&nbsp;'.repeat(match.length))
            .replace(/(?:\b)(\w+)(?:\b)/gm, (match, token) => keywords.includes(token) ? `<span class="keyword">${token}</span>` : token);
        result.push(`<li class="blockLine">${token}</li>`);
    }

    result.push('</ol>');

    return result.join('');
}

export function sanitize(match) {
    return {
        '<': '&lt;',
        '>': '&gt;',
        '&': '&amp;'
    }[match];
}