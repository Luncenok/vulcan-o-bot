module.exports = {
    name: "info",
    description: "Popokazuje informacje o bocie",
    aliases: ['informacje', 'stats'],
    usage: ['info'],
    category: 'other',
    async execute(client, message) {
        const utils = require('../utils');
        const version = require('../package.json').version;
        message.channel.startTyping()
        await message.channel.send(utils.generateEmbed(
            "Informacje o bocie",
            "",
            [{
                name: 'Statystyki:',
                value: `Serwery: ${client.guilds.cache.size}\n` +
                    `Kanały: ${client.channels.cache.size}\n` +
                    `Użytkownicy: ${client.users.cache.size}`
            }, {
                name: 'Wersja',
                value: `${version}`
            }, {
                name: 'Tryb',
                value: `${process.env.NODE_ENV}`
            }, {
                name: "Hosting",
                value: `${process.env.HOST}`
            }
            ]))
        message.channel.stopTyping()
    }
}
