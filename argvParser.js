const yargs = require('yargs/yargs')
const { hideBin } = require('yargs/helpers')

module.exports = (argv) => yargs(hideBin(argv))
    .command('search [options] <query>', 'Поиск в OpenLibrary', (yargs) => {
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
            description: "Имя выходного файла"
        })
        .option('fields', {
            alias: "f",
            type: "array",
            default: ['title', 'author_name', 'first_publish_year'],
            description: "Список полей, которые необходимо вывести"
        })
        .option('sort', {
            alias: "s",
            type: "string",
            choices: ['new', 'old', 'rating', 'title', 'editions', 'key'],
            description: "Поле для сортировки"
        })
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
    .demandCommand(1, 'Необходимо указать команду search')
    .strictCommands()
    .argv
