
const cheerio = require('cheerio')

async function run() {
  const res = await fetch('https://ajuda.staycloud.com.br/docs/como-resetar-o-core-do-wordpress/')
  const html = await res.text()
  const $ = cheerio.load(html)
  
  console.log('Title:', $('.betterdocs-entry-title').text() || $('h1').first().text())
  console.log('Content HTML preview:', $('.betterdocs-entry-content').html()?.slice(0, 100))
  console.log('Other possible content classes:', $('.betterdocs-content-area').length, $('.betterdocs-article-content').length)
}
run()
