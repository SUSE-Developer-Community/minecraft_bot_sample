
function nearestEntity (bot, type) {
  let id
  let entity
  let dist
  let best = null
  let bestDistance = null
  for (id in bot.entities) {
    entity = bot.entities[id]
    if (type && entity.type !== type) continue
    if (entity === bot.entity) continue
    dist = bot.entity.position.distanceTo(entity.position)
    if (!best || dist < bestDistance) {
      best = entity
      bestDistance = dist
    }
  }
  return best
}

function distance(v1,v2){
  return Math.abs(v1.x-v2.x) + Math.abs(v1.y-v2.y) + Math.abs(v1.z-v2.z) 
}

function getSurroundings(bot) {
  

}

module.exports = ({bot}) => {
  const entity = nearestEntity(bot,'player')
  if (!entity || entity.type == 'object') return

  console.log(entity.position,bot.entity.position)

  const dist = distance(entity.position, bot.entity.position)
  console.log('distance to ', entity.type, dist)
  
  
  bot.lookAt(entity.position, true)
  if (bot.setControlState) bot.setControlState('forward', true)
  if (bot.setControlState) bot.setControlState('jump', true)
  bot.attack(entity, true)
}