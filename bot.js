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

  constructor(wrapper){
    
    const {bot, receiveChat, onPathFound, onArrived, onInterrupted, onPathNotFound, walk, sendChat, followSpeaker, stop} = wrapper
// Set Unique team name only A-Z and _  (no -'s)
// This is how your points will be counted
    this.team = 'ExampleTeam'

    this.mcData = wrapper.mcData
    this.bot = bot 
    this.wrapper = wrapper

    // Log info to the console
    console.log(`Initializing bot: ${bot.username}`)
    // Send a message to the server and map chat
    sendChat("Hello, World!")

    console.log('Registering Listeners...')
    onPathFound((path) => {
      sendChat("found path. I will get there in " + path.length + " moves.")
    })

    onPathNotFound((closestPath) => {
      sendChat("unable to find path. getting as close as possible")
      console.log("found path. getting as close as possible")
      walk(closestPath)
    })

    onArrived(()=>{
      sendChat("I have arrived")
      console.log(`${bot.username}|Arrived at: ${bot.entity.position}   Target block: ${this.state.targetBlock.position}`)
    })

    onInterrupted(() => {
      sendChat("stopping")
    })

    // Respond to chat messages from other bots or players
    receiveChat((chatuser, message) => {
      console.error(chatuser, message)

        // navigate to another bot that asks
      if (message === 'come') {
        this.state.targetBlock = null;
        sendChat("OMW")
        this.state.followingSpeaker = followSpeaker(chatuser);
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
      targetBlock: null,
      followingSpeaker: null,
      lastPosition: null
    }
  }


  // Executed repeatedly every few seconds
  loop({ distance, maxPlacementRange, placeOnTopOfTargetBlock}) {
    console.log(`${this.bot.username}|Start of Bot Loop`, JSON.stringify(this.state), this.bot.entity.position)


    if(this.state.followingSpeaker) {
      if (distance(this.bot.entity.position, this.state.followingSpeaker.position) < this.wrapper.maxPlacementRange) {
        this.state.followingSpeaker = null//done following
      }
      return 
    }


    if (!this.state.targetBlock) { // No target block, find one
      this.state.targetBlock = this.findNewTarget()


      if(this.state.targetBlock) { // found target block
        console.log(`${this.bot.username}|Found new Target Block: ${this.state.targetBlock.displayName}@${this.state.targetBlock.position}`)
        this.bot.navigate.to(this.state.targetBlock.position.offset(0, 1, 2), {tooFarThreshold: 10, timeout: 2000}); //need to find offset on side of bot
      } else { // couldn't find targetBlock
        this.wander()
      }
    } else { // Already in progress with target

      let distanceToTarget = distance(this.bot.entity.position, this.state.targetBlock.position)
      console.log("Distance: ", 1.5, ' < ', distanceToTarget, ' < ', maxPlacementRange)

      // if can place, then do
      const itemToPlace = this.getPlacementBlockForTarget(this.state.targetBlock)
      if( distanceToTarget < maxPlacementRange && distanceToTarget > 1.5 && itemToPlace ){
        placeOnTopOfTargetBlock(itemToPlace.name, this.state.targetBlock)
        .then(()=>{
          this.state.targetBlock = null
        }).catch((err)=>{
          this.state.targetBlock = null
          console.error("Error Placing", err)
        })
      } else {
        // make sure not stuck or block changed

        if(distance(this.state.lastPosition, this.bot.entity.position)<1){
          console.log("I am stuck :( wandering and trying again")
          this.wander()
        } else if(distanceToTarget <= 1.5) {
          this.bot.navigate.to(this.state.targetBlock.position.offset(0, 1, 2), {tooFarThreshold: 10, timeout: 2000}); //need to find offset on side of bot
        }
      }
    }

    this.state.lastPosition = JSON.parse(JSON.stringify(this.bot.entity.position)) // clone out position for comparisons
  }

  
  wander() {
    const getRandom = (spread)=>(Math.random*spread*2)

    const randomPlace = this.bot.entity.position.offset(getRandom(5), getRandom(5), 0)
    this.bot.navigate.to(randomPlace, {tooFarThreshold: 10, timeout: 2000});
  }

  getPlacementBlockForTarget(target) {
    const mcData = this.mcData
    switch(target.type){
      case mcData.blocksByName.sandstone.id:
      case mcData.blocksByName.sand.id:
        return mcData.blocksByName.grass;
      case mcData.blocksByName.grass.id:
        return mcData.blocksByName.sapling;
      case mcData.blocksByName.sapling.id:
        return mcData.itemsByName.dye; // TODO, need to equip variation 15
      default:
        console.log('Unhandled target: ', this.state.targetBlock.displayName)
        return null
    }
  }

  findNewTarget() {
    return this.wrapper.findNearestBlock(this.mcData.blocksByName.grass.id, true) || this.wrapper.findNearestBlock(this.mcData.blocksByName.sandstone.id, true) || null
  }

}



//move to sense -> think -> act