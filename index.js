var mineflayer = require('mineflayer');
const uuidv4 = require('uuid/v4');
const uuid = uuidv4().split('-')[0];
const username= `bot-${uuid}`;

const host = process.env.MINECRAFT_SERVER_HOST
const port = process.env.MINECRAFT_SERVER_PORT

var bot = mineflayer.createBot({
  username,//shost,
  port,
  version: false
})

bot.on('error', err => console.log(err))

bot.on('respawn',()=>{console.log('respawn')})

const func = require('./bot.js')
setInterval(()=>{
  func({
    bot,
    getPlayers: bot.findPlayers
  }, {}, {})
},1000)