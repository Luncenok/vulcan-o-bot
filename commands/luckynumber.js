module.exports = {
    name: "luckynumber",
    description: "Pokazuje szczęśliwy numerek jeżeli dostępny",
    aliases: ['ln', 'numerek', 'szczesliwynumerek', 'szczesliwy', 'lucky', 'number', 'sn'],
    usage: 'luckynumber',
    category: 'vulcan',
    async execute(client, message) {
        const uonet = require('../uonet')
        const utils = require('../utils')

        const loginProgressMessage = await message.channel.send("Logowanie... 0%")

        const loginMessage = await utils.getLoginMessageOrUndefined(message.author)
        if (loginMessage) {
            await uonet.loginLogOn(loginMessage, loginProgressMessage).then((permcookiesymbolArray) => {
                return uonet.getLuckyNumber(permcookiesymbolArray, loginProgressMessage)
            }).then(luckyNumberText => {
                loginProgressMessage.edit(utils.generateEmbed(
                    "Szczęśliwy numerek",
                    luckyNumberText,
                    []
                ))
            })
        } else {
            await loginProgressMessage.edit("Aby użyć tej komendy najpierw musisz się zalogować w wiadomości **prywatnej** do mnie. Po więcej informacji użyj komendy `help`")
            await utils.removeFromDatabase(message.author.id)
        }
    }
}
