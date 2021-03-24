module.exports = {
    name: "classgrades",
    description: "Pokazuje ucznia na tle klasy",
    aliases: ['uczennatleklasy', 'klasa', 'ocenyklasy', ''],
    usage: ['classgrades', 'classgrades matematyka', 'classgrades język angielski'],
    category: 'vulcan',
    async execute(client, message, args) {
        const uonet = require('../uonet')
        const utils = require('../utils')

        let loginProgressMessage;
        await message.channel.send("Logowanie... 0%").then(lpMessage => {
            loginProgressMessage = lpMessage
        })

        const loginMessage = await utils.getLoginMessageOrUndefined(message.author)
        if (loginMessage) {
            const day = new Date().getDate()
            await uonet.loginLogOn(loginMessage, loginProgressMessage).then((permsCookieSymbolUrl) => {
                return uonet.getXVHeaders(permsCookieSymbolUrl, loginProgressMessage)
            }).then(loginInfo => {
                return uonet.getGradesStatistics(loginInfo, day, loginProgressMessage)
            }).then(json => {
                let nazwaPrzedmiotu = args.join(" ").toLowerCase()
                let wybranyPrzedmiot = ""
                let fields = []
                json.forEach((przedmiot) => {
                    if (przedmiot["Subject"].toLowerCase() === nazwaPrzedmiotu) wybranyPrzedmiot = przedmiot
                })
                if (wybranyPrzedmiot === "") {
                    json.forEach((przedmiot) => {
                        if (przedmiot["IsAverage"]) {
                            fields.push({
                                name: `${przedmiot["Subject"]}`,
                                value: `Średnia klasy: ${przedmiot["ClassSeries"]["Average"]}\nŚrednia ucznia: ${przedmiot["StudentSeries"]["Average"]}`
                            })
                        }
                    })
                } else {
                    if (wybranyPrzedmiot["IsAverage"]) {
                        fields.push({
                            name: `${wybranyPrzedmiot["Subject"]}`,
                            value: `Średnia klasy: ${wybranyPrzedmiot["ClassSeries"]["Average"]}\nŚrednia ucznia: ${wybranyPrzedmiot["StudentSeries"]["Average"]}`
                        })
                        const classTab = [], studentTab = []
                        wybranyPrzedmiot["ClassSeries"]["Items"].forEach(item => {
                            if (item["Value"] !== 0) {
                                classTab.push(item["Label"])
                            }
                        })
                        wybranyPrzedmiot["StudentSeries"]["Items"].forEach(item => {
                            if (item["Value"] !== 0) {
                                studentTab.push(item["Label"])
                            }
                        })
                        fields.push({
                            name: `Klasa`,
                            value: `${classTab.join("\n")}`
                        })
                        fields.push({
                            name: `Uczeń`,
                            value: `${studentTab.join("\n")}`
                        })
                    }
                }
                loginProgressMessage.edit(utils.generateEmbed(
                    "Uczeń na tle klasy",
                    "Informacje o ocenach ucznia w porównaniu do całej klasy.",
                    fields
                ));
            })
        } else {
            await loginProgressMessage.edit("Aby użyć tej komendy najpierw musisz się zalogować w wiadomości **prywatnej** do mnie. Po więcej informacji użyj komendy `help`")
            await utils.removeFromDatabase(message.author.id)
        }
    }
}
