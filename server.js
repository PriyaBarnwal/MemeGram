const express = require('express')
const got = require('got')
const cheerio = require("cheerio")

const app = express()
let url = "https://www.reddit.com/r/dankmemes/new"

app.all('*', (req, res, next) => {
  res.header("Access-Control-Allow-Origin", "http://localhost:8888");
  next()
})

app.get('/getMemes',  async(req, res) => {
  try {
  const response = await got(url)
  const dom = cheerio.load(response.body)
  console.log('yo')
  let nodeList = []
  dom('.media-element').map((i, elem)=> {
    nodeList.push(elem.attribs.src)
  })
  console.log(nodeList)
  res.send({
    message: 'success',
    data: nodeList.reverse()
  })
  } catch(err){
    res.status(500).send({
      message: 'failed',
      error: err
    })
    console.log(err)
  }
})
      

app.listen(5000, ()=> console.log(`server has started on port 5000`))