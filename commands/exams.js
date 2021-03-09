module.exports = {
    name: "exams",
    description: "Pokazuje sprawdziany na następne 4 tygodnie",
    aliases: ['sprawdziany', 'tests', 'kartkowki'],
    usage: 'exams',
    category: 'vulcan',
    async execute(client, message) {
        const uonet = require('../uonet')
        const utils = require('../utils')

        const loginProgressMessage = await message.channel.send("Logowanie... 0%")

        let exams = [], examDataText, examSubjectText, examDescriptionText, examTeacherText, examTypeText
        const examTypes = [
            "Sprawdzian",
            "Kartkówka",
            "Praca klasowa"
        ]

        const loginMessage = await utils.getLoginMessageOrUndefined(message.author)
        if (loginMessage) {
            const day = new Date().getDate()
            await uonet.loginLogOn(loginMessage, loginProgressMessage).then((permcookiesymbolArray) => {
                return uonet.getXVHeaders(permcookiesymbolArray, loginProgressMessage)
            }).then(pcsaavArray => {
                return uonet.getExams(pcsaavArray, day, loginProgressMessage)
            }).then(json => {
                // ponieważ getExamsFormattedText jest wywoływane tylko w exams.js, to przeniosłem jego funkcjonalność do exams.js
                for (var week of json) {
                    week["SprawdzianyGroupedByDayList"].forEach(day => {
                        day["Sprawdziany"].forEach(exam => {
                            examDataText = `Dzień: ${day["Data"].split(' ')[0]}`;
                            examSubjectText = exam["DisplayValue"]
                            examDescriptionText = exam["Opis"] ? ` - ${exam["Opis"]}` : ""
                            examTeacherText = `Nauczyciel: ${exam["PracownikModyfikujacyDisplay"]}`
                            examTypeText = examTypes[exam["Rodzaj"]-1] ? `Rodzaj: ${examTypes[exam["Rodzaj"]-1]}` : "*Nieznany rodzaj lub błąd rodzaju*"
                            exams.push({
                                name: examSubjectText+examDescriptionText,
                                value: `${examDataText}\n${examTeacherText}\n${examTypeText}`
                                // name: `${examDataText}`,
                                // value: `${examSubjectText}${examDescriptionText}\n${examTeacherText}\n${examTypeText}`
                            })
                        })
                    })
                };
                loginProgressMessage.edit(utils.generateEmbed(
                    "Sprawdziany",
                    "Sprawdziany, kartkówki i prace klasowe na najbliższe 4 tygodnie",
                    exams
                ));
            })
        } else {
            await loginProgressMessage.edit("Aby użyć tej komendy najpierw musisz się zalogować w wiadomości **prywatnej** do mnie. Po więcej informacji użyj komendy `help`")
            await utils.removeFromDatabase(message.author.id)
        }
    }
}
