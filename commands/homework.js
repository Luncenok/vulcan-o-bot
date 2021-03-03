module.exports = {
    name: "homework",
    description: "Pokazuje zadania domowe na następny tydzień lub mniej jeżeli przekroczy limit 2000 znaków)",
    aliases: ['zadania', 'domowe', 'zadania-domowe', 'zaddom', 'zad'],
    usage: 'exams',
    category: 'vulcan',
    async execute(client, message) {
        const uonet = require('../uonet')
        const utils = require('../utils')

        const loginProgressMessage = await message.channel.send("Logowanie... 0%")

        const loginMessage = await utils.getLoginMessageOrUndefined(message.author)
        if (loginMessage) {
            const day = new Date().getDate()
            await uonet.loginLogOn(loginMessage, loginProgressMessage).then((permcookiesymbolArray) => {
                return uonet.getXVHeaders(permcookiesymbolArray, loginProgressMessage)
            }).then(pcsaavArray => {
                return uonet.getHomework(pcsaavArray, day, loginProgressMessage)
            }).then(text => {
                loginProgressMessage.edit(text)
            })
        } else {
            await loginProgressMessage.edit("Aby użyć tej komendy najpierw musisz się zalogować w wiadomości **prywatnej** do mnie. Po więcej informacji użyj komendy `help`")
            await utils.removeFromDatabase(message.author.id)
        }
    }
}
