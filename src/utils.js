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
    if (!!type.match(/Array of (.*)(, )?(.*) and (.*)/gi)) {
        type = type.matchAll(/(Array of |, | and )*(\w+)/gi);
        return Array.from(type, (m) => {
            return m[2]
                    .replace(/Float number/g, 'Float')
                    .replace(/(Int|Integer|String|Boolean|Float|False|True)/gi, match => match.toLowerCase())
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
            .replace(/Float number/gi, 'Float')
            .replace(/(Int|Integer|String|Boolean|Float|False|True)/gi, match => match.toLowerCase())
            .replace('integer', 'int')
            .replace('false', 'bool')
            .replace('true', 'bool')
            .replace('boolean', 'bool');

    //count "Array of"
    let arrays = type.match(/(Array of)/gi)?.length ?? 0;

    //replace "Array of" to ""
    type = type.replace(/Array of /gi, '');

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

function getReturnType(description) {

    const list = [
        /On success, an (?<type>array of .*)s that were sent is returned/,
        /On success, if .*, the (.* )?(?<type>.*) is returned, otherwise (?<type2>.*) is returned\./,
        /On success, the sent (?<type>.*) is returned/,
        /On success, a (?<type>.*) object is returned\./,
        /On success, the .* (?<type>.*) is returned\./,
        /On success, returns a (?<type>.*) object\./,
        /On success, (?<type>.*) is returned\./,
        
        /Returns an (?<type>Array of .*) objects/,
        /Returns the .* as (?<type>.*) on success\./,
        /Returns the .* (?<type>.*) on success\./,
        /Returns the .* as (a )?(?<type>.*) object\./,
        /Returns a (?<type>.*) object\./,
        /Returns the (?<type>.*) of the sent message on success/,
        /Returns a (?<type>.*) object on success\./,
        /Returns .* a (?<type>.*) object/,
        /Returns (?<type>.*) on success/,
    ];

    let match = '';
    for (let item of list) {
        const matcher = description.match(item);

        if (matcher === null) {
            continue;
        }

        const type1 = matcher['groups']['type'] ?? null;
        const type2 = matcher['groups']?.['type2'] ?? null;
        
        match+=sanitizeType(type1);

        if (type2 !== null) {
            match += '|' + sanitizeType(type2);
        }
        break;
    }
    
    return match;
}

module.exports = {
    isLowerCase,
    isUpperCase,
    getType,
    includesInArray,
    isIgnored,
    getFirstElementSibling,
    sanitizeType,
    getLinks,
    getReturnType,
};