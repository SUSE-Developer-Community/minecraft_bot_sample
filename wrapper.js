const vec3 = require('vec3')
module.exports = (bot) => ({
    TEAM_PREFIX: 'Go team: ',
    TEAM_SUFFIX: '!',
    RESUPPLY_MSG: 'resupply',
    colors: ["white", "black", "dark_blue", "dark_green", "dark_aqua", "dark_red", "dark_purple", "gold", "gray", "dark_gray", "blue", "green", "aqua", "red", "light_purple", "yellow"],
    findNearestGrass: () => {
        //TODO, find nearest Grass using bot
    },
    findNearestSapling: () => {
        //TODO, find nearest Grass using bot
    },
    findNearestBlock: (id) => {
        // TODO pass in option for which face is empty.  Might be checking for a tree trunk.
        // TODO pass in max distance, might need to limit based on performance
        // TODO incorporate min pythagorean distance
        return findBlock(bot, {
            point: bot.entity.position,
            matching: (block) => {
                if (block && (block.type == id)) {
                    const blockAbove = bot.blockAt(block.position.offset(0, 1, 0))
                    return !blockAbove || blockAbove.type === 0 //empty space above
                }
                return false
            },
            maxDistance: 32
        })
    },
    placementRange: 4,

    distance,

    
})

let distance = function(v1, v2){
    const xSquared = Math.pow(Math.abs(v1.x - v2.x), 2)
    const ySquared = Math.pow(Math.abs(v1.y - v2.y), 2)
    const zSquared = Math.pow(Math.abs(v1.z - v2.z), 2)
    return Math.sqrt(xSquared + ySquared + zSquared)
}

let findBlock = function(bot, options){
    let check
    let nearestBlock = null
    let nearestDistance = Number.MAX_VALUE
    if (typeof (options.matching) !== 'function') {
        if (!Array.isArray(options.matching)) {
            options.matching = [options.matching]
        }
        check = isMatchingType
    } else check = options.matching
    options.point = options.point || bot.entity.position
    options.maxDistance = options.maxDistance || 16
    const cursor = vec3()
    const point = options.point
    const max = options.maxDistance
    const maxHeight = 10;
    let found
    for (cursor.x = point.x - max; cursor.x < point.x + max; cursor.x++) {
        for (cursor.y = point.y - maxHeight; cursor.y < point.y + maxHeight; cursor.y++) {
            for (cursor.z = point.z - max; cursor.z < point.z + max; cursor.z++) {
                found = bot.blockAt(cursor)
                if (check(found)) {
                    let blockDistance = distance(point, found.position);
                    if (blockDistance < nearestDistance) {
                        nearestBlock = found;
                        nearestDistance = blockDistance;
                        // console.log(`${bot.username}|Found closer block at: ${cursor} [${nearestDistance}]`)                    
                    }
                }
            }
        }
    }
    return nearestBlock

    function isMatchingType(block) {
        return block === null ? false : options.matching.indexOf(block.type) >= 0
    }
}