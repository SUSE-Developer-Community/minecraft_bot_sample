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
        return bot.findBlock({
            point: bot.entity.position,
            matching: (block) => {
                if (block && (block.type == id)) {
                    const blockAbove = bot.blockAt(block.position.offset(0, 1, 0))
                    return !blockAbove || blockAbove.type === 0 //empty space above
                }
                return false
            },
            maxDistance: 3
        })
    },
    distance: (v1, v2) => {
        return Math.abs(v1.x - v2.x) + Math.abs(v1.y - v2.y) + Math.abs(v1.z - v2.z)
    }
})