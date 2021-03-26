module.exports = {
    name: "luckynumber",
    description: "Pokazuje szczęśliwy numerek jeżeli dostępny",
    aliases: ['ln', 'numerek', 'szczesliwynumerek', 'szczesliwy', 'lucky', 'number', 'sn'],
    usage: ['luckynumber'],
    category: 'vulcan',
    async execute(client, message) {
        const uonet = require('../uonet')
        const utils = require('../utils')

        let loginProgressMessage;
        await message.channel.send("Logowanie... 0%").then(lpMessage => {
            loginProgressMessage = lpMessage
        })
        message.channel.startTyping()

        const loginMessage = await utils.getLoginMessageOrUndefined(message.author)
        if (loginMessage) {
            await uonet.loginLogOn(loginMessage, loginProgressMessage).then((permsCookiesSymbolUrl) => {
                return uonet.getLuckyNumber(permsCookiesSymbolUrl, loginProgressMessage)
            }).then(luckyNumberText => {
                message.channel.stopTyping(true)
                loginProgressMessage.edit(utils.generateEmbed(
                    "Szczęśliwy numerek",
                    luckyNumberText,
                    []
                ))
            })
        } else {
            message.channel.stopTyping(true)
            await loginProgressMessage.edit("Aby użyć tej komendy najpierw musisz się zalogować w wiadomości **prywatnej** do mnie. Po więcej informacji użyj komendy `help`")
            await utils.removeFromDatabase(message.author.id)
        }
    }
}
