module.exports = {
    name: "login",
    description: "Loguje się do platformy vulcan uonet+",
    aliases: ['zaloguj', 'loguj'],
    usage: 'login [email] [hasło] [symbol]',
    category: 'vulcan',
    async execute(client, message, args) {
        const uonet = require('../uonet')
        const loginProgressMessage = await message.channel.send("Logowanie... 0%")
        let symbol = args[2]
        uonet.loginLogOn(args[0], args[1], symbol, loginProgressMessage).then(([permissions, ciasteczka]) => {
            loginProgressMessage.edit(permissions);
            message.channel.send(ciasteczka.length)
        })
    }
}
