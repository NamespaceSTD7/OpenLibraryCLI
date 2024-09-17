const http = require('http')
const yargs = require('yargs/yargs')
const { hideBin } = require('yargs/helpers')
const fs = require('fs')
const createCsvWriter = require('csv-writer').createObjectCsvWriter

const argv = yargs(hideBin(process.argv))
    .command('openlibrary', 'Главная команда для OpenLibrary', (yargs) => {
        yargs.command('search <query>', 'Поиск в OpenLibrary', (yargs) => {
            yargs.option('json', {
                alias: "j",
                type: "boolean",
                default: false,
                description: "Вывод результата в формате JSON"
            })
            .option('csv', {
                alias: "c",
                type: "boolean",
                default: false,
                description: "Вывод результата в формате CSV"
            })
            .option('out', {
                type: "string",
                demandOption: true,
                description: "Имя выходного файла"
            })
            .option('fields', {
                alias: "f",
                type: "array",
                description: "Список полей, которые необходимо вывести"
            })
            /*.option('sort', {
                alias: "s",
                type: "string",
                description: "Поле для сортировки"
            })*/
            .option('all', {
                alias: "a",
                type: "boolean",
                description: "Вывод всех записей"
            })
            .option('page', {
                alias: "p",
                type: "number",
                description: "Номер страницы, с помощью --limit указывается количество записей на странице"
            })
            .option('offset', {
                alias: "o",
                type: "number",
                description: "Смещение, с помощью --limit указывается количество записей в выводе"
            })
            .option('limit', {
                alias: "l",
                type: "number",
                description: "Количество записей на странице/всего"
            })
            .check((argv) => {
                if (argv.json && argv.csv) {
                    console.error('Парметры --json и --csv являются взаимоисключающими. Укажите только один из них.');
                    process.exit(1);
                }
                if ((argv.page && argv.offset) || (argv.all && (argv.offset || argv.page))) {
                    console.error('Параметры --offset, --page и --all взаимоисключающие.  Укажите только один из них.');
                    process.exit(1);
                }
                if (argv.all && argv.limit) {
                    console.error('Параметр --all и --limit взаимоисключающие.  Укажите только один из них.');
                    process.exit(1);
                }
                return true;
            })
        })
    })
    .strictCommands()
    .argv

function getSearchUrl() {
    let url = 'http://openlibrary.org/search.json';

    url += `?q=${argv.query}`

    if (argv.fields) {
        url += `&fields=${argv.fields}`;
    }/* else {
        url += '&fields=*';
    }*/

    if (argv.offset) {
        url += `&offset=${argv.offset}`;
    } else if (argv.page) {
        url += `&page=${argv.page}`;
    }

    if (argv.limit && !argv.all) {
        url += `&limit=${argv.limit}`;
    }

    return url;
}

const searchUrl = getSearchUrl()

const fileName = argv.out + (argv.json ? '.json' : (argv.csv ? '.csv' : '.txt'))
fs.writeFile(fileName, '', (err) => {
    if (err) {
        console.error('Ошибка при очистке файла:', err);
        process.exit(1);
    }
});

const writeStr = fs.createWriteStream(fileName, { flags: 'a' })
writeStr.on('error', (err) => {
    console.error(err)
    process.exit(1)
})

const csvWriter = createCsvWriter({
    path: argv.out + '.csv',
    header: argv.fields !== undefined ? argv.fields.map(field => ({ id: field, title: field })) : [],
});

const saveToFile = (docs, offset) => {

    if (argv.csv) {
        csvWriter.writeRecords(docs)
        .catch((error) => {
            console.error('Произошла ошибка при создании CSV файла:', error);
            process.exit(1);
        });
    } else {
        const content = argv.json ? JSON.stringify(docs, null, 2) : docs.map((obj, index) => {
            let formattedObj = `${offset + index + 1}.\n`;
            for (const key in obj) {
                formattedObj += `${key}: ${JSON.stringify(obj[key])}\n`;
            }
            return formattedObj;
        }).join('\n\n');

        writeStr.write(content, 'utf-8')
    }
}

function searchDocs(url) {

    console.log(url);

    http.get(url, (res) => {
        const {statusCode} = res
        if (statusCode !== 200) {
            console.error(`Http error with code: ${statusCode}`)
            console.error(`Error: ${res.statusMessage}`)
            process.exit(1)
        }
    
        res.setEncoding('utf-8')
        let rowData = ''
        res.on('data', (chunk) => rowData += chunk)
        res.on('end', () => {
            const jsonRes = JSON.parse(rowData)
            saveToFile(jsonRes.docs, jsonRes.start)

            if (argv.all && jsonRes.start + 100 < jsonRes.numFound) {
                searchDocs(searchUrl + `&offset=${jsonRes.start + 100}`)
                return
            }
            writeStr.end()
            console.log(`Результаты поиска сохранены в файл ${fileName}`)
        })
    }).on('error', (err) => {
        console.error(err)
        process.exit(1)
    });
}

searchDocs(searchUrl)