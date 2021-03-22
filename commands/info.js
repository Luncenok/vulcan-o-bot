module.exports = {
    name: "info",
    description: "Popokazuje informacje o bocie",
    aliases: ['informacje', 'stats'],
    usage: ['info'],
    category: 'other',
    async execute(client, message) {
        const utils = require('../utils');
        const version = require('../package.json').version;
        let totalSeconds = (client.uptime / 1000);
        let days = Math.floor(totalSeconds / 86400);
        totalSeconds %= 86400;
        let hours = Math.floor(totalSeconds / 3600);
        totalSeconds %= 3600;
        let minutes = Math.floor(totalSeconds / 60);
        let seconds = Math.floor(totalSeconds % 60);
        let uptime = `${days} days, ${hours} hours, ${minutes} minutes and ${seconds} seconds`
        await message.channel.send(utils.generateEmbed(
            "Informacje o bocie",
            "",
            [{
                name: 'Statystyki:',
                value: `Serwery: ${client.guilds.cache.size}\n` +
                    `Kanały: ${client.channels.cache.size}\n` +
                    `Użytkownicy: ${client.users.cache.size}`
            }, {
                name: 'Uptime',
                value: `${uptime}`
            }, {
                name: 'Github',
                value: `https://github.com/Luncenok/vulcan-o-bot`
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
    }
}
