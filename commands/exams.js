/*
    json = shgiodfdj
    let examsText = ""
    json.forEach(tydzien => {
        tydzien["SprawdzianyGroupedByDayList"].forEach(day => {
            if (day["Sprawdziany"].length > 0) {
                examsText += `${day["Data"].split(' ')[0]}:\n`
                day["Sprawdziany"].forEach(sprawdzian => {
                    let rodzaj;
                    switch (sprawdzian["Rodzaj"]) {
                        case 1:
                            rodzaj = "Sprawdzian"
                            break
                        case 2:
                            rodzaj = "Kartkówka"
                            break
                        case 3:
                            rodzaj = "Praca klasowa"
                            break
                        default:
                            rodzaj = "inne"
                            break
                    }
                    if (sprawdzian["Opis"] === "") sprawdzian["Opis"] = "(brak opisu)"

                    let testString = examsText + `${sprawdzian["DisplayValue"]}\n` +
                        `${sprawdzian["PracownikModyfikujacyDisplay"]}\n` +
                        `${sprawdzian["Opis"]}\n` +
                        `${rodzaj}\n\n`
                    if (testString.length < 2000)
                        examsText += `${sprawdzian["DisplayValue"]}\n` +
                            `${sprawdzian["PracownikModyfikujacyDisplay"]}\n` +
                            `${sprawdzian["Opis"]}\n` +
                            `${rodzaj}\n\n`
                })
            }
        })
    })
    if (examsText === "") examsText = "Brak sprawdzianów"
    return examsText
}
*/

module.exports = {
    name: "exams",
    description: "Pokazuje sprawdziany na następne 4 tygodnie lub mniej jeżeli przekroczy limit 2000 znaków)",
    aliases: ['sprawdziany', 'tests', 'kartkowki'],
    usage: 'exams',
    category: 'vulcan',
    async execute(client, message) {
        const uonet = require('../uonet')
        const utils = require('../utils')

        const loginProgressMessage = await message.channel.send("Logowanie... 0%")

        let exams = []

        const loginMessage = await utils.getLoginMessageOrUndefined(message.author)
        if (loginMessage) {
            const day = new Date().getDate()
            await uonet.loginLogOn(loginMessage, loginProgressMessage).then((permcookiesymbolArray) => {
                return uonet.getXVHeaders(permcookiesymbolArray, loginProgressMessage)
            }).then(pcsaavArray => {
                return uonet.getExams(pcsaavArray, day, loginProgressMessage)
            }).then(json => {
                // ponieważ getExamsFormattedText jest wywoływane tylko w exams.js, to przeniosłem jego funkcjonalność do exams.js
                json.array.forEach(week => {
                    week["SprawdzianyGroupedByDayList"].forEach(day => {
                        day["Sprawdziany"].forEach(exam => {
                            console.log(day["Data"].split(' ')[0], exam)
                        })
                    })
                });
            })
        } else {
            await loginProgressMessage.edit("Aby użyć tej komendy najpierw musisz się zalogować w wiadomości **prywatnej** do mnie. Po więcej informacji użyj komendy `help`")
            await utils.removeFromDatabase(message.author.id)
        }
    }
}
