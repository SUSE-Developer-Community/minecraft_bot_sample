const vec3 = require('vec3')


module.exports = wrapper = (bot, mcData) => {

  // Creates a version of the function that returns a promise instead of using a callback
  // Useful for async/await syntax
  const promisifyMF = (fn)=>(
    (...args)=>(
      new Promise((res,rej)=>{
        fn(...args, (e)=>{
          e?rej(e):res()
        })
      })
    )
  )


  const requestSupplies = ()=>{ bot.chat('resupply') }

  const findNearestBlock = (id, random = true) => {
      // TODO pass in option for which face is empty.  Might be checking for a tree trunk.
      // TODO pass in max distance, might need to limit based on performance
      // TODO incorporate min pythagorean distance
      return findBlock((block) => {
          if (block && (block.type == id)) {
              const blockAbove = bot.blockAt(block.position.offset(0, 1, 0))
              return !blockAbove || (blockAbove.type === 0  && (!random || Math.random()>.5))//empty space above
          }
          return false
        }, {
          point: bot.entity.position,
          maxDistance: 32
      })
  }
  
  const findNearestGrass = ()=>(findNearestBlock(mcData.blocksByName.grass.id))
  const findNearestSandstone = ()=>(findNearestBlock(mcData.blocksByName.sandstone.id))
  const maxPlacementRange = 4

  const distance = (v1,v2)=> (Math.sqrt(['x','y','z'].reduce((a,c)=>(a + Math.pow(v1[c] - v2[c], 2)),0)))

  const findAllBlocks = (matcher,
    {
      point=bot.entity.position,
      maxDistance=16, 
      maxHeight=10
    }
  )=>{
    let ret = []

    loopBlocks((found)=>{
      if (matcher(found)) {
        ret.push(found)
      }
    },point, maxDistance, maxHeight)
    return ret
  }

  const findBlock = (matcher,
    {
      point=bot.entity.position,
      maxDistance=16, 
      maxHeight=10,
    }
  )=>{
    let nearestBlock = null
    let nearestDistance = Number.MAX_VALUE

    loopBlocks((found)=>{
      if (matcher(found)) {
        let blockDistance = distance(point, found.position)
        if (blockDistance < nearestDistance) {
          nearestBlock = found
          nearestDistance = blockDistance
          // console.log(`${bot.username}|Found closer block at: ${cursor} [${nearestDistance}]`)                    
        }
      }
    }, point, maxDistance, maxHeight)

    return nearestBlock
  }

  const loopBlocks = (func, center, distance, height)=>{
    for (let x = center.x - distance; x < center.x + distance; x++) {
      for (let y = center.y - height; y < center.y + height; y++) {
        for (let z = center.z - distance; z < center.z + distance; z++) {
          func(bot.blockAt(vec3(x,y,z)))
        }
      }
    }
  }


  const placeOnTopOfTargetBlock = async (itemName, targetBlock) => {
    const itemToPlace = bot.inventory.items().find((item) => (item.name === itemName))

    const equipAsync = promisifyMF(bot.equip)
    const placeBlockAsync = promisifyMF(bot.placeBlock)

    try{
      await equipAsync(itemToPlace, 'hand')
      await placeBlockAsync(targetBlock, vec3(0, 1, 0))
      console.log(`${bot.username}|placed ${itemToPlace.name} at: ${targetBlock.position}`)
    } catch(e) {
      console.log(e)
      throw e
    }
    return
  }

  const printInventory= ()=> {
    console.log(`${bot.username}| Inventory:`)
    Object.keys(bot.inventory.items()).forEach(function (key) {
      // Grass Block|grass|2 0: 64
      const item = bot.inventory.items()[key];
      console.log(`${item.displayName}|${item.name}|${item.type} ${item.metadata}: ${item.count}`)
    })
  }


  const followSpeaker = (chatuser) => {
    // TODO: only follow if on the same team, or no team (admins)
    const target = bot.players[chatuser].entity
    if (target) {
      bot.navigate.to(target.position)
    }
    return target
  }

  const stop = () => {
    bot.navigate.stop();
  }

  return {
    loopBlocks,
    findAllBlocks,
    findBlock,
    findNearestBlock,
    findNearestGrass,
    findNearestSandstone,
    distance,
    requestSupplies,
    maxPlacementRange,


    sendChat: bot.chat,

    onPathNotFound: (fn)=>(bot.navigate.on('cannotFind',fn)),
    onPathFound: (fn)=>(bot.navigate.on('pathFound',fn)),
    onArrived: (fn)=>(bot.navigate.on('arrived',fn)),
    onInterrupted: (fn)=>(bot.navigate.on('interrupted',fn)),
    receiveChat: (fn)=>( bot.on('chat', (usr, msg)=>{if (!(usr === bot.username)) fn(usr, msg) })),
    equip: bot.equip,
    walk: bot.navigate.walk,

    promisifyMF,

    placeOnTopOfTargetBlock,
    printInventory,
    followSpeaker,
    stop
  
  }
}
