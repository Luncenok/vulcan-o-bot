module.exports = {
    name: "ping",
    description: "Odpowiada: Pong!",
    aliases: ['pong'],
    usage: ['ping'],
    category: 'other',
    async execute(client, message) {
        message.channel.startTyping()
        let checkmessage
        await message.channel.send('Sprawdzanie...').then(cMessage => {
            checkmessage = cMessage
        })
        const args = message.content.slice(client.config.prefix.length).split(/ +/);
        const commandName = args.shift().toLowerCase();
        const ping = Math.round(checkmessage.createdTimestamp - message.createdTimestamp)
        message.channel.stopTyping()
        if (commandName === 'pong') await checkmessage.edit(`Ping? ${ping}ms`)
        else await checkmessage.edit(`Pong! ${ping}ms`)
    }
}
