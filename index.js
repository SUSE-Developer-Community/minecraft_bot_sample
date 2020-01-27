var mineflayer = require('mineflayer');
const uuidv4 = require('uuid/v4');
const uuid = uuidv4().split('-')[0];
const username= `bot-${uuid}`;

//const server = process.env.VCAP_SERVICES['user-provided']

var bot = mineflayer.createBot({
  username,
  host: "minecraftserver.tcp.trial.cap.suse.dev", // optional
  port: 20003,       // optional
  version: false                 // false corresponds to auto version detection (that's the default), put for example "1.8.8" if you need a specific version
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