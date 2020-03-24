const Crawler = require('node-html-crawler');
const request = require('request');
const getUrls = require('get-urls');
const cheerio = require('cheerio');

const websitePagesData = [];
const websiteURL = 'www.hexometer.com';
const crawler = new Crawler({
    protocol: 'https:',         // default 'http:'
    domain: websiteURL,         // default 'example.com'
    limitForConnections: 15,    // number of simultaneous connections, default 10
    limitForRedirects: 5,       // possible number of redirects, default 3
    timeout: 1000                // number of milliseconds between pending connection, default 100
});
crawler.crawl();
crawler.on('data', data => {
    savePageAndStatus(data.result.statusCode, data.url);
});
crawler.on('error', error => {
    const pageURL = Array.from(getUrls(JSON.stringify(error.message)))[0];
    console.log('Failed to get data from page:', pageURL);
});
crawler.on('end', logPagesData);
function savePageAndStatus(httpStatus, pageURL) {
    const pageDataObject = {
        pageURL: pageURL,
        status: httpStatus
    };
    websitePagesData.push(pageDataObject);
}
function logPagesData() {
    for (let pageData of websitePagesData) {
        logPageData(pageData['pageURL'], pageData['status']);
    }
}
function logPageData(pageURL, status) {
    request(pageURL, (error, response, body) => {
        if (response) {
            try {
                const pageBody = cheerio.load(body);
                const elements = pageBody('*');
                elements.each((i, el) => {
                    const link = pageBody(el).attr('href') || pageBody(el).attr('src');
                    if (link && link.indexOf('http') !== -1) {
                        request(link, (error, response) => {
                            if (response) {
                                const urlData = {
                                    pageURL: pageURL,
                                    pageStatus: status,
                                    url: link,
                                    status: response.statusCode
                                };
                                console.log('URL data: ', urlData);
                            }
                        });
                    }
                });
            } catch (error) {
                console.log(error);
            }
        } else if (error) {
            console.log(`Error message: ${error}`);
        }
    });
}

