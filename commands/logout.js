module.exports = {
    name: "logout",
    description: "Wylogowuje z platformy vulcan uonet+",
    aliases: ['wyloguj', 'fuckoff'],
    usage: ['logout'],
    category: 'vulcan',
    async execute(client, message) {
        const utils = require('../utils')
        await utils.removeFromDatabase(message.author.id)
        await message.reply("Zostałeś wylogowany")
    }
}
