/*
equips grass
finds a place to lay grass
lays grass
equips a sapling
plants a sapling on grass
equips bonemeal
fertalizes sapling until growth (or out of bonemeal) // TODO
finds a place to plant until out of saplings
finds a place to lay grass until out of saplings or grass
Note: May send chat "resupply" to get more of everything from Geeko
 */


const PLACE_DIRT = 'Place Dirt';
const PLANT = 'Plant';
const FERTILIZE = 'Fertilize';
const DEFEND = 'Defend';


module.exports = class MinecraftBot {
  
// Set Unique team name only A-Z and _  (no -'s)
// This is how your points will be counted

  constructor({bot, receiveChat, onPathFound, onArrived, onInterrupted, onPathNotFound, walk, sendChat, followSpeaker, stop}){
    
// Set Unique team name only A-Z and _  (no -'s)
// This is how your points will be counted
    this.team = 'ExampleTeam'
    // Log info to the console
    console.log(`Initializing bot: ${bot.username}`)
    // Send a message to the server and map chat
    sendChat("Hello, World!")

    console.log('Registering Listeners...')
    onPathFound((path) => {
      sendChat("found path. I will get there in " + path.length + " moves.")
    })

    onPathNotFound((closestPath) => {
      this.state.moving = false
      this.state.targetBlock = null
      sendChat("unable to find path. getting as close as possible")
      walk(closestPath)
    })

    onArrived(()=>{
      this.state.moving = false;
      sendChat("I have arrived")
      console.log(`${bot.username}|Arrived at: ${bot.entity.position}   Target block: ${this.state.targetBlock.position}`)
    })

    onInterrupted(() => {
      this.state.moving = false;
      sendChat("stopping")
    })

    // Respond to chat messages from other bots or players
    receiveChat((chatuser, message) => {
      console.error(chatuser, message)

        // navigate to another bot that asks
      if (message === 'come') {
        this.state.targetBlock = null;
        this.state.moving = false;
        sendChat("OMW")
        this.state.target = followSpeaker(chatuser);
      } else if (message === 'stop') {
        sendChat("Stopping")
        stop()
      } else if (message === 'reset') {
        sendChat("Resetting")
        this.state.targetBlock = null
        stop()
      }
    });

    
    this.state = {
      moving: false,
      targetBlock: null,
      target: null
    }
  }



  // Executed repeatedly every few seconds
  loop({bot, distance, maxPlacementRange, findNearestBlock, mcData, placeOnTopOfTargetBlock}) {
    console.log(`${bot.username}|Start of Bot Loop`)
    console.log(`${bot.username}|moving: ${this.state.moving}`)
    console.log(`${bot.username}|position: ${bot.entity.position}`)

    
    if (this.state.targetBlock) {
        // TODO: Test if target block is within placement distance.
        // if target is out of reach, move closer
        // if target is too close, back up
        let distanceToTarget = distance(bot.entity.position, this.state.targetBlock.position)
        console.log(`${bot.username}|distanceToTarget: ${distanceToTarget}`)
        if (!this.state.moving && (distanceToTarget > maxPlacementRange || distanceToTarget < 1.5)) {
            if(distanceToTarget < 1) console.log(`${bot.username}|Need to back up. Dist: ${distanceToTarget}`)
            console.log(`${bot.username}|Moving closer to target block: ${this.state.targetBlock.position}`)
            bot.navigate.to(this.state.targetBlock.position.offset(0, 1, 2));
            this.state.moving = true;
        }

        else if (!this.state.moving) { // place block at target
            // console.log(mcData.blocksByName.grass)
            let itemName
            
            switch(this.state.targetBlock.type){
                case mcData.blocksByName.sandstone.id:
                case mcData.blocksByName.sand.id:
                    itemName = mcData.blocksByName.grass.name;
                    break;
                case mcData.blocksByName.grass.id:
                    itemName = mcData.blocksByName.sapling.name;
                    break;
                case mcData.blocksByName.sapling.id:
                    itemName = mcData.itemsByName.dye.name; // TODO, need to equip variation 15
                    break;
                default:
                    console.log('Unhandled targetBlock: ', this.state.targetBlock.displayName)
            }
            if(itemName) {
                placeOnTopOfTargetBlock(itemName, this.state.targetBlock)
                .then(()=>{
                  this.state.targetBlock = null
                })
            }
        }
    }


    if (!this.state.moving && !this.state.targetBlock) {
        this.state.targetBlock = findNearestBlock(mcData.blocksByName.grass.id)
        if(!this.state.targetBlock){
            // far from target
            console.log(`${bot.username}|No dirt found, searching for place for dirt...`)
            this.state.targetBlock = findNearestBlock(mcData.blocksByName.sandstone.id)
        }
        if (this.state.targetBlock) {
            console.log(`${bot.username}|Found new Target Block: ${this.state.targetBlock.displayName}@${this.state.targetBlock.position}`)
        } else {
            // TODO move someplace random or search with a larger range
            console.error("cannot find block near to me")
        }

        // close to target
    } else if (this.state.moving) {
      if(this.state.targetBlock) console.log(`${bot.username}|Moving to: ${this.state.targetBlock.position.offset(0,1,2)} from ${bot.entity.position}`)
    }
}

}



//move to sense -> think -> act