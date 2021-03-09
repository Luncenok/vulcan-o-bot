module.exports = {
    name: "timetable",
    description: "Pokazuje plan lekcji wybranego dnia lub na cały tydzień (domyślnie dzisiejszy plan)",
    aliases: ['plan', 'planlekcji'],
    usage: 'timetable dzisiaj|jutro',
    category: 'vulcan',
    async execute(client, message, args) {
        const uonet = require('../uonet')
        const utils = require('../utils')

        const loginProgressMessage = await message.channel.send("Logowanie... 0%")

        const weekDays = ["poniedziałek", "wtorek", "środa", "czwartek", "piątek"]

        const loginMessage = await utils.getLoginMessageOrUndefined(message.author)
        if (loginMessage) {
            const day = utils.getDateFromText(args[0])
            console.log(day)
            await uonet.loginLogOn(loginMessage, loginProgressMessage).then((permcookiesymbolArray) => {
                return uonet.getXVHeaders(permcookiesymbolArray, loginProgressMessage)
            }).then(pcsaavArray => {
                return uonet.getTimetable(pcsaavArray, day, loginProgressMessage)
            }).then(text => {
                loginProgressMessage.edit(text)
            })
        } else {
            await loginProgressMessage.edit("Aby użyć tej komendy najpierw musisz się zalogować w wiadomości **prywatnej** do mnie. Po więcej informacji użyj komendy `help`")
            await utils.removeFromDatabase(message.author.id)
        }
    }
}
