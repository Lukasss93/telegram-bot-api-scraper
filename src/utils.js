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

module.exports = {
    isLowerCase,
    isUpperCase,
    getType,
    includesInArray,
    getFirstElementSibling
};