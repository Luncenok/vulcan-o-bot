module.exports = {
    name: "attendance",
    description: "Pokazuje statystyki frekwencji od początku roku szkolnego",
    aliases: ['frekwencja', 'frek', 'obecności', 'nieobecności', 'spóźnienia'],
    usage: 'attendance',
    category: 'vulcan',
    async execute(client, message) {
        const uonet = require('../uonet')
        const utils = require('../utils')

        let loginProgressMessage;
        await message.channel.send("Logowanie... 0%").then(lpMessage => {
            loginProgressMessage = lpMessage
        })

        const loginMessage = await utils.getLoginMessageOrUndefined(message.author)
        if (loginMessage) {
            const day = new Date().getDate()
            await uonet.loginLogOn(loginMessage, loginProgressMessage).then(loginInfo => {
                return uonet.getAttendance(loginInfo, day, loginProgressMessage)
            }).then(json => {
                let frekwencjaCala = json["Podsumowanie"]
                let fields = []
                json["Statystyki"].forEach(typFrekwencji => {
                    let testField = {
                        name: `${typFrekwencji["NazwaTypuFrekwencji"]} - ${(typFrekwencji["Razem"] !== null) ? typFrekwencji["Razem"] : "0"}`,
                        value: `${(typFrekwencji["Styczen"] !== null) ? `Styczeń: ${typFrekwencji["Styczen"]}\n` : ""}` +
                            `${(typFrekwencji["Luty"] !== null) ? `Luty: ${typFrekwencji["Luty"]}\n` : ""}` +
                            `${(typFrekwencji["Marzec"] !== null) ? `Marzec: ${typFrekwencji["Marzec"]}\n` : ""}` +
                            `${(typFrekwencji["Kwiecien"] !== null) ? `Kwiecień: ${typFrekwencji["Kwiecien"]}\n` : ""}` +
                            `${(typFrekwencji["Maj"] !== null) ? `Maj: ${typFrekwencji["Maj"]}\n` : ""}` +
                            `${(typFrekwencji["Czerwiec"] !== null) ? `Czerwiec: ${typFrekwencji["Czerwiec"]}\n` : ""}` +
                            `${(typFrekwencji["Lipiec"] !== null) ? `Lipiec: ${typFrekwencji["Lipiec"]}\n` : ""}` +
                            `${(typFrekwencji["Sierpien"] !== null) ? `Sierpień: ${typFrekwencji["Sierpien"]}\n` : ""}` +
                            `${(typFrekwencji["Wrzesien"] !== null) ? `Wrzesień: ${typFrekwencji["Wrzesien"]}\n` : ""}` +
                            `${(typFrekwencji["Pazdziernik"] !== null) ? `Październik: ${typFrekwencji["Pazdziernik"]}\n` : ""}` +
                            `${(typFrekwencji["Listopad"] !== null) ? `Listopad: ${typFrekwencji["Listopad"]}\n` : ""}` +
                            `${(typFrekwencji["Grudzien"] !== null) ? `Grudzień: ${typFrekwencji["Grudzien"]}\n` : ""}`
                    }
                    if (testField.value === "") testField.value = "Brak"
                    fields.push(testField)
                })
                loginProgressMessage.edit(utils.generateEmbed(
                    "Frekwencja",
                    `Frekwencja na cały rok szkolny wynosi: ${frekwencjaCala}`,
                    fields
                ));
            })
        } else {
            
            await loginProgressMessage.edit("Aby użyć tej komendy najpierw musisz się zalogować w wiadomości **prywatnej** do mnie. Po więcej informacji użyj komendy `help`")
            await utils.removeFromDatabase(message.author.id)
        }
    }
}
