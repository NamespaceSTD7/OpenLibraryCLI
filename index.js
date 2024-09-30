#!/usr/bin/env node

const argvParser = require('./argvParser');
const fileWriter = require('./fileWriter');
const { getSearchUrl, search } = require('./openlibraryApi');

const argv = argvParser(process.argv);
const fileName = argv.out;

fileWriter.init(fileName, argv.csv ? fileWriter.Formats.CSV : (argv.json ? fileWriter.Formats.JSON : null), argv.fields);

search(getSearchUrl(argv), argv.all, (docs, isEnd) => {
    if (isEnd) {
        fileWriter.saveToFile(docs, isEnd);
        fileWriter.end();
        if (fileName) {
            console.log(`Результаты поиска сохранены в файл ${fileName}`)
        }
    } else {
        fileWriter.saveToFile(docs);
    }
})

/*  "bin": {
    "openlibrary": "index.js"
  },*/

/*
ТЕСТИРОВАНИЕ:
1. Заполнить параметр fields каким нибудь мусором, либо оставить пустым и др. поля тоже
2. Исправить команду в scripts и bin
*/