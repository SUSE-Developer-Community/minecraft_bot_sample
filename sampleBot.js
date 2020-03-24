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
let targetBlock = null;

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
        console.log(`${bot.username}|Arrived at: ${bot.entity.position}   Target block: ${targetBlock.position}`)

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
    console.log(`${bot.username}|Start of Bot Loop`)
    console.log(`${bot.username}|moving: ${moving}`)
    console.log(`${bot.username}|position: ${bot.entity.position}`)
    // Sample usage
    // printInventory(bot);

    // Tree planting algo
    // find sandstone
    // findSandstone()
    // if not found, move in a random direction and try again
    
    if (targetBlock) {
        // TODO: Test if target block is within placement distance.
        // if target is out of reach, move closer
        // if target is too close, back up
        let distanceToTarget = wrapper.distance(bot.entity.position, targetBlock.position)
        console.log(`${bot.username}|distanceToTarget: ${distanceToTarget}`)
        if (!moving && (distanceToTarget > wrapper.placementRange || distanceToTarget < 1.5)) {
            if(distanceToTarget < 1) console.log(`${bot.username}|Need to back up. Dist: ${distanceToTarget}`)
            bot.navigate.to(targetBlock.position.offset(1, 1, 2));
            console.log(`${bot.username}|Moving closer to target block: ${targetBlock.position}`)
            moving = true;
        }

        if (!moving) { // place block at target
            let grass = bot.inventory.items().find((item) => (item.name === 'grass'))
            bot.equip(grass, 'hand', (e) => {
                if (e) {
                    console.log(e)
                } else {
                    let target = targetBlock
                    bot.placeBlock(target, new Vec3(0, 1, 0), (e) => {
                        if (e) {
                            console.log(e)
                        } else {
                            console.log(`${bot.username}|placed grass at: ${target.position}`)
                        }
                    })
                    targetBlock = null;
                }
            })
        }
    }

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
    if (!moving && !targetBlock) {
        // far from target
        console.log(`${bot.username}|searching for place for dirt...`)
        targetBlock = wrapper.findNearestBlock(mcData.blocksByName.sandstone.id)
        if (targetBlock) {
            console.log(`${bot.username}|Found new Target Block: ${targetBlock.displayName}@${targetBlock.position}`)
        }
        // moveToPlaceBlock(bot, targetBlock, Vec3); // TODO, do we need to stop on arrival
        // console.log(`${bot.username}|target for dirt: ${targetBlock.position}`)
        // close to target
    } else if (moving) {
        console.log(`${bot.username}|Moving to: ${targetBlock.position} from ${bot.entity.position}`)
    }

    function printInventory(bot) {
        console.log(`${bot.username}| Inventory:`)
        Object.keys(bot.inventory.items()).forEach(function (key) {
            // Grass Block|grass|2 0: 64
            let item = bot.inventory.items()[key];
            console.log(`${item.displayName}|${item.name}|${item.type} ${item.metadata}: ${item.count}`)
        })
    }
}