module.exports = {
    name: "status",
    description: "Sprawdza czy vulcan działa czy może nie",
    aliases: ['dziala'],
    usage: 'status',
    category: 'vulcan',
    async execute(client, message) {
        const fetch = require('node-fetch')
        const checkmessage = await message.channel.send('Sprawdzanie...');
        fetch('https://cufs.vulcan.net.pl/Default/Account/LogOn?ReturnUrl=%2F')
            .then(res => checkmessage.edit(`Status: ${res.status}`))

    }
}
