const axios = require('axios');
const jsdom = require("jsdom");
const {JSDOM} = jsdom;
const colors = require('colors');
const {
    isUpperCase,
    isLowerCase,
    getType,
    getFirstElementSibling,
    sanitizeType,
    isIgnored,
    getLinks, getReturnType
} = require("./utils");
const fs = require("fs");

const baseUrl = 'https://core.telegram.org/bots/api';

async function run() {
    let data = {};

    console.log('Fetching data...'.yellow);

    //get source code with axios
    const content = (await axios.get(baseUrl)).data;

    //initialize jsdom
    const dom = new JSDOM(content);

    //get all H4 tags
    const h4Tags = dom.window.document.querySelectorAll('h4');

    //loop through all H4 tags
    for (let tag of h4Tags) {
        const name = tag.textContent.trim();
        const description = tag.nextElementSibling.textContent ?? '-';
        const description_links = getLinks(tag.nextElementSibling);
        const type = getType(name, description);

        //check if the type is valid
        if (type === 'unknown') {
            continue;
        }

        //create array if not exists
        if (!data[type]) {
            data[type] = [];
        }

        //get url
        const url = baseUrl + tag.getElementsByClassName('anchor')[0].getAttribute('href');
        
        //get code
        const code = tag.getElementsByClassName('anchor')[0].getAttribute('name').trim();
        
        //check if the object is ignored
        if(type === 'object' && isIgnored(code)) {
            continue;
        }

        //create item
        let item = {
            name,
            description,
            description_links,
            url,
            type
        };

        //get object fields
        if (type === 'object') {
            let fields = [];

            //get table
            const table = getFirstElementSibling(tag, 'table', 'h4');

            if (table !== null) {
                //get rows
                const rows = table.querySelectorAll('tbody tr');

                //loop through all rows
                for (let row of rows) {
                    //get cells
                    const cells = row.querySelectorAll('td');

                    fields.push({
                        name: cells[0].textContent.trim(),
                        type: sanitizeType(cells[1].textContent.trim()),
                        required: !cells[2].textContent.trim().toLowerCase().includes('optional.'),
                        description: cells[2].textContent.trim(),
                        description_links: getLinks(cells[2]),
                    });
                }
            }

            item['fields'] = fields;
        }

        //get methods parameters
        if (type === 'method') {
            //add return type
            item['return'] = getReturnType(description);
            
            let parameters = [];

            //get table
            const table = getFirstElementSibling(tag, 'table', 'h4');

            if (table !== null) {
                //get rows
                const rows = table.querySelectorAll('tbody tr');

                //loop through all rows
                for (let row of rows) {
                    //get cells
                    const cells = row.querySelectorAll('td');

                    parameters.push({
                        name: cells[0].textContent.trim(),
                        type: sanitizeType(cells[1].textContent.trim()),
                        required: cells[2].textContent.trim().toLowerCase() === 'yes',
                        description: cells[3].textContent.trim(),
                        description_links: getLinks(cells[3]),
                    });
                }
            }

            item['parameters'] = parameters;
        }

        //add to array
        data[type].push(item);
    }

    //write objects to json file
    fs.writeFileSync('../build/objects.json', JSON.stringify(data['object'], null, 2));

    //write methods to json file
    fs.writeFileSync('../build/methods.json', JSON.stringify(data['method'], null, 2));

    console.log('Done!'.green);
}

run();