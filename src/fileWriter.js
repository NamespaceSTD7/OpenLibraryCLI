const csv = require('csv-writer');
const fs = require('fs');

const Formats = {
    CSV: 'csv',
    JSON: 'json',
};

let isInitialized = false;
let writeStream = null;
let csvStringifier = null;
let fileName = null;
let format = null;
let fields = null;

function saveToFile(docs, isEnd = false) {

    if (!writeStream) {
        if (fileName) {
            writeStream = fs.createWriteStream(fileName);
        } else {
            writeStream = process.stdout;
        }
        writeStream.on('error', (err) => {
            console.error(err);
            process.exit(1);
        })
        if (format === Formats.JSON) {
            writeStream.write('[\n');
        }
    }

    switch(format) {
        case Formats.CSV: {
            if (!csvStringifier) {
                csvStringifier = csv.createObjectCsvStringifier({
                    header: fields.map(field => ({ id: field, title: field })),
                });
                writeStream.write(csvStringifier.getHeaderString())
            }
            
            writeStream.write(csvStringifier.stringifyRecords(docs));
            break;
        }
        case Formats.JSON: {
            const content = JSON.stringify(docs, null, 2).slice(2, -2)
            writeStream.write(content, 'utf-8')

            if (isEnd) {
                writeStream.write('\n]');
            } else {
                writeStream.write(',\n');
            }

            break;
        }
        default: {
            const content = docs.map((obj, index) => {
                let formattedObj = '- книга ';
                if (obj.title) {
                    formattedObj += `${obj.title} `;
                }
                if (obj.author_name) {
                    formattedObj += `автора ${obj.author_name.slice(0, 3).join(', ')} `;
                }
                if (obj.first_publish_year) {
                    formattedObj += `издана в ${obj.first_publish_year} году`;
                }
                return formattedObj;
            }).join('\n') + '\n';

            writeStream.write(content);
        }
    }
}

module.exports = {
    init: (_fileName, _format, _fields) => {
        if (isInitialized) {
            this.end();
        }
        isInitialized = true;
        fileName = _fileName;
        format = _format;
        fields = _fields;
    },
    saveToFile: saveToFile,
    end: () => {
        if (writeStream) {
            writeStream.end();
        }
        isInitialized = false;
        writeStream = null;
        csvStringifier = null;
        fileName = null;
        format = null;
        fields = null;
    },
    Formats: Formats
}