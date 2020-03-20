const request = require('request');
const cheerio = require('cheerio');

const url = 'https://hexometer.com';

request(url, (error, response, body) => {
  if (response) {
    try {
      const $ = cheerio.load(body);
      const links = $('a');
      let link;

      links.each((i, el) => {
        link = $(el).attr('href');

        if (link.indexOf('http') !== -1)
          console.log(link);

        request(link, (error, response) => {
          if (response) {
            console.log(`STATUS: ${response.statusCode}`);
          }
        });
      })
    } catch (error) {
      console.log(error)
    }
  } else if (error) {
    console.log(`Error message: ${error}`);
  }
})


