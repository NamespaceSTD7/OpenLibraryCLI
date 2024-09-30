const http = require('http');
const querystring = require('querystring');

const baseUrl = 'http://openlibrary.org/search.json';
const successStatusCode = 200;
const pageSize = 100;

function getSearchUrl(argv) {

    const queryParams = {
        q: argv.query
    };

    if (argv.fields) {
        queryParams.fields = argv.fields.join(',');
    }

    if (argv.sort) {
        queryParams.sort = argv.sort;
    }

    if (argv.offset) {
        queryParams.offset = argv.offset;
    } else if (argv.page) {
        queryParams.page = argv.page;
    }

    if (argv.limit && !argv.all) {
        queryParams.limit = argv.limit;
    }
    return baseUrl + '?' + querystring.stringify(queryParams);
}

function search(url, isAll, saveResult) {

    http.get(url, (res) => {
        const {statusCode} = res
        if (statusCode !== successStatusCode) {
            console.error(`Http error with code: ${statusCode}`)
            console.error(`Error: ${res.statusMessage}`)
            process.exit(1)
        }
    
        res.setEncoding('utf-8')

        let rowData = ''
        res.on('data', (chunk) => rowData += chunk)
        res.on('end', () => {
            const jsonRes = JSON.parse(rowData)

            if (isAll) {
                const newOffset = jsonRes.start + pageSize

                if (newOffset < jsonRes.numFound) {
                    saveResult(jsonRes.docs, false)

                    if (url.includes("&offset=")) {
                        url = url.replace(/&offset=\d+/, `&offset=${newOffset}`)
                    } else {
                        url = url + `&offset=${newOffset}`
                    }
                    search(url, isAll, saveResult)
                    return
                }
            }

            saveResult(jsonRes.docs, true) //isEnd
        })
    }).on('error', (err) => {
        console.error(err)
        process.exit(1)
    });
}

module.exports = {
    'getSearchUrl': getSearchUrl,
    'search': search
}