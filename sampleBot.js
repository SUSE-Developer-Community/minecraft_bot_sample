/*
equips grass
finds a place to lay grass
lays grass
equips a sapling
plants a sapling on grass
equips bonemeal
fertalizes sapling until growth (or out of bonemeal)
finds a place to plant until out of saplings
finds a place to lay grass until out of saplings or grass
Note: May send chat "resupply" to get more of everything from Geeko
 */
const PLACE_DIRT = 'Place Dirt';
const PLANT = 'Plant';
const FERTILIZE = 'Fertilize';
const DEFEND = 'Defend';
let moving = false;

let state = {
    target: null
}; // persistant state between loops

// Set Unique team name only A-Z and _  (no -'s)
// This is how your points will be counted
module.exports.team = 'ExampleTeam'

function followSpeaker(bot, chatuser) {
    // TODO: only follow if on the same team, or no team (admins)
    state.target = bot.players[chatuser].entity;
    if (state.target) {
        bot.navigate.to(state.target.position);
    }
}

function moveToPlaceBlock(bot, block, Vec3) {
    state.target = block;
    if (state.target) {
        // Offset to keep destination above ground
        moving = true;
        bot.navigate.to(state.target.position.offset(2, 1, 2));
    }
}

function stopMoving(bot) {
    moving = false;
    bot.navigate.stop();
}



// From here down is the user's code
// Executed Once
// Set event listeners here
module.exports.init = ({bot}, wrapper, {mcData}, {Vec3}) => {
    Vec3 = Vec3;
    // Log info to the console
    console.log(`Initializing bot: ${bot.username}`)
    // Send a message to the server and map chat
    bot.chat("Hello, World!")

    console.log('Registering Listeners...')
    bot.navigate.on('pathFound', function (path) {
        bot.chat("found path. I can get there in " + path.length + " moves.")
    });
    bot.navigate.on('cannotFind', function (closestPath) {
        moving = true;
        bot.chat("unable to find path. getting as close as possible")
        bot.navigate.walk(closestPath)
    });
    bot.navigate.on('arrived', function () {
        moving = false;
        bot.chat("I have arrived")
    });
    bot.navigate.on('interrupted', function () {
        moving = false;
        bot.chat("stopping")
    });

    // Respond to chat messages from other bots or players
    bot.on('chat', function (chatuser, message) {
        // Don't listen to yourself talking
        if (chatuser === bot.username) return;

        // navigate to another bot that asks
        if (message === 'come') {
            followSpeaker(bot, chatuser);
        } else if (message === 'stop') {
            stopMoving(bot);
        }
    });
}

// Executed repeatedly every few seconds
module.exports.loop = ({bot}, wrapper, {mcData}, {Vec3}) => {
    console.log('Start of Bot Loop')
    // Sample usage
    console.log(`${bot.username}|moving: ${moving}`)
    
    // if (targetBlock) {
    //    
    //     // console.log(bot.inventory.items())
    //     let grass = bot.inventory.items().find((item) => (item.name === 'grass'))
    //     // console.log(mcData.blocksByName.grass)
    //     // bot.equip(mcData.blocksByName.grass, 'hand', (e) => {
    //     bot.equip(grass, 'hand', (e) => {
    //         // const GRASS_ID = 0
    //         // bot.equip(GRASS_ID, 'hand', (e) => {
    //         console.log(`${bot.username}|Trying to place dirt...`)
    //         if (e) console.log(e)
    //         bot.lookAt(targetBlock.position, true, () => {
    //             bot.placeBlock(targetBlock, new Vec3(0, 1, 0), (e) => {
    //                 console.log(`${bot.username}|placed grass at: ${targetBlock.position}`)
    //                 if (e) {
    //                     console.error(e)
    //                 }
    //                 // setImmediate(loop)
    //             })
    //         });
    //     })
    // }
    if (!moving) {
        // far from target
        console.log(`${bot.username}|searching for place for dirt...`)
        let targetBlock = wrapper.findNearestBlock(mcData.blocksByName.sandstone.id)
        console.log("Target Block: ", targetBlock)
        moveToPlaceBlock(bot, targetBlock, Vec3); // TODO, do we need to stop on arrival
        console.log(`${bot.username}|target for dirt: ${targetBlock.position}`)
        // close to target
    } else if (moving) {
        console.log('Moving')
    }
}