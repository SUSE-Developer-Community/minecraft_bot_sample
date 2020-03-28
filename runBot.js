
const mineflayer = require('mineflayer')
const uuidv4 = require('uuid').v4

const read_vcap = require('./vcap.js')
const {host, port} = read_vcap('user-provided','MinecraftServer')
const TEAM_PREFIX= 'Go team: '
const TEAM_SUFFIX= '!'


let mcData = require('minecraft-data')("1.12")

/* Test harness for running a bot script locally without CAP requirements */
const Vec3 = require('vec3')
// var blockFinderPlugin = require('mineflayer-blockfinder')(mineflayer)
const navigatePlugin = require('mineflayer-navigate')(mineflayer)

const uuid = uuidv4().split('-')[0]
let exit = false
let interval = 2000

username = `bot_${uuid}`.substr(0, 16) // trim to 16 characters, minecraft limit

let bot = mineflayer.createBot({
    username,
    host,
    port,
    version: "1.12.2"
})

navigatePlugin(bot);
const Player = require('./bot.js')
const wrapper = require('./wrapper.js')(bot, mcData)

console.log("Bot.majorVersion ================= " + bot.majorVersion)

bot.on('error', err => console.log(err))
bot.on('respawn', () => {
    console.log(bot.username + ' was killed :(');
    exit = true;
    bot.quit();
})

bot.on('blockUpdate', (oldBlock,newBlock) =>{
    // request an update to the current map tile if dirt, grass, 
    if(oldBlock && oldBlock.id == mcData.blocksByName.air){
        switch(newBlock.type){
            case mcData.blocksByName.dirt.id:
            case mcData.blocksByName.grass.id:
            case mcData.blocksByName.sappling.id:
                wrapper.sendChat("/dynmap render")
                break
            case mcData.blocksByName.log.id:
            case mcData.blocksByName.leaves.id:
              wrapper.sendChat(`/dynmap radiusrender world ${newBlock.position.x} ${newBlock.position.z} 10`)
                break
            default:
                // ignore other block changes
        }
    }
})

// Announce Team to Geeko Bot (Geeko sets teams and provides starting inventory.)
bot.once('login', function () {
    console.log(bot.username + "| Login")
    const playerBot = new Player({bot, mcData, Vec3, ...wrapper})

    console.log(bot.username + `| ${TEAM_PREFIX}${playerBot.team}${TEAM_SUFFIX}`)

    wrapper.sendChat(`${TEAM_PREFIX}${playerBot.team}${TEAM_SUFFIX}`)
    

    let refreshId = setInterval(() => {
      playerBot.loop({bot, mcData, Vec3, ...wrapper})
    }, interval)

    if(exit){
      console.log(`${bot.username}|Clearing Interval - Quitting`)
      clearInterval(refreshId);
    }
    
})
