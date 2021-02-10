module.exports = {
    name: "logout",
    description: "Wylogowuje z platformy vulcan uonet+",
    aliases: ['wyloguj', 'fuckoff'],
    usage: 'logout',
    category: 'vulcan',
    async execute(client, message, args) {

        const Keyv = require("keyv")
        const keyv = new Keyv(process.env.PATH_TO_DATABASE)

        await keyv.delete(message.author.id)
        await message.reply("Zostałeś wylogowany")
    }
}
