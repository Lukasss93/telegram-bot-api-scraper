function isLowerCase(str) {
    return str === str.toLowerCase();
}

function isUpperCase(str) {
    return str === str.toUpperCase();
}

function getType(title, description) {
    description = description.toLowerCase();

    if (isUpperCase(title[0]) && includesInArray(description, ['object', 'contains', 'represents', 'describes', 'placeholder'])) {
        return 'object';
    }

    if (isLowerCase(title[0]) && includesInArray(description, ['method', 'informs'])) {
        return 'method';
    }

    return 'unknown';
}

function isIgnored(objectName) {
    return [
        'chatmember',
        'botcommandscope',
        'menubutton',
        'inputmedia',
        'inputfile',
        'inline-mode-objects',
        'inline-mode-methods',
        'passportelementerror'
    ].includes(objectName);
}

function includesInArray(value, find) {
    for (let item of find) {
        if (value.includes(item)) {
            return true;
        }
    }
}

function getFirstElementSibling(current, next, stop = null) {
    let sibling = current.nextElementSibling;

    while (sibling) {
        if (sibling.tagName.toLowerCase() === next.toLowerCase()) {
            return sibling;
        }
        if (stop !== null && sibling.tagName.toLowerCase() === stop.toLowerCase()) {
            return null;
        }
        sibling = sibling.nextElementSibling;
    }
}

function sanitizeType(type) {
    //corner case: array of x, x and x
    if (!!type.match(/Array of (.*)(, )?(.*) and (.*)/g)) {
        type = type.matchAll(/(Array of |, | and )*(\w+)/g);
        return Array.from(type, (m) => {
            return m[2]
                    .replace(/Float number/g, 'Float')
                    .replace(/(Integer|String|Boolean|Float|False|True)/g, match => match.toLowerCase())
                    .replace('integer', 'int')
                    .replace('false', 'bool')
                    .replace('true', 'bool')
                    .replace('boolean', 'bool') + "[]";
        }).join("|");
    }

    //replace "or" to "|"
    type = type.replace(/ or /g, '|');

    //replace scalar values to lowercase
    type = type
            .replace(/Float number/g, 'Float')
            .replace(/(Integer|String|Boolean|Float|False|True)/g, match => match.toLowerCase())
            .replace('integer', 'int')
            .replace('false', 'bool')
            .replace('true', 'bool')
            .replace('boolean', 'bool');

    //count "Array of"
    let arrays = type.match(/(Array of)/g)?.length ?? 0;

    //replace "Array of" to ""
    type = type.replace(/Array of /g, '');

    //add "[]" to the end of type
    type += '[]'.repeat(arrays);

    return type;
}

function getLinks(htmlNode) {

    const text = htmlNode.textContent;

    const results = [];

    const links = htmlNode.querySelectorAll('a');

    links.forEach(link => {
        const offset = text.indexOf(link.textContent);
        const length = link.textContent.length;
        let url = link.getAttribute('href');

        //if link starts with #, append the url
        if (url.startsWith('#')) {
            url = 'https://core.telegram.org/bots/api' + url;
        } else if (url.startsWith('/')) {
            url = 'https://core.telegram.org' + url;
        }

        results.push({
            offset,
            length,
            link: url
        });
    });

    return results;
}

module.exports = {
    isLowerCase,
    isUpperCase,
    getType,
    includesInArray,
    isIgnored,
    getFirstElementSibling,
    sanitizeType,
    getLinks
};