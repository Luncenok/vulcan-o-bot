/*
module.exports.getHomeworkFormattedText = (json) => {
    let homeworkText = ""
    json.forEach(day => {
        if (day["Homework"].length > 0) {
            homeworkText += `${day["Date"].split(' ')[0]}:\n`
            day["Homework"].forEach(homework => {
                if (homework["Description"] === "") homework["Description"] = "(brak opisu)"

                let testString = homeworkText + `${homework["Subject"]}\n` +
                    `${homework["Description"]}\n` +
                    `${homework["Teacher"]}\n\n`
                if (testString.length < 2000)
                    homeworkText += `${homework["Subject"]}\n` +
                        `${homework["Description"]}\n` +
                        `${homework["Teacher"]}\n\n`
            })
        }
    })
    if (homeworkText === "") homeworkText = "Brak zadań domowych"
    return homeworkText
}
*/

module.exports = {
    name: "homework",
    description: "Pokazuje zadania domowe na następny tydzień lub mniej jeżeli przekroczy limit 2000 znaków)",
    aliases: ['zadania', 'domowe', 'zadania-domowe', 'zaddom', 'zad'],
    usage: 'homework',
    category: 'vulcan',
    async execute(client, message) {
        const uonet = require('../uonet')
        const utils = require('../utils')

        const loginProgressMessage = await message.channel.send("Logowanie... 0%")

        let homework = [], workDataText, workSubjectText, workDescriptionText, workTeacherText, workTypeText

        const loginMessage = await utils.getLoginMessageOrUndefined(message.author)
        if (loginMessage) {
            const day = new Date().getDate()
            await uonet.loginLogOn(loginMessage, loginProgressMessage).then((permcookiesymbolArray) => {
                return uonet.getXVHeaders(permcookiesymbolArray, loginProgressMessage)
            }).then(pcsaavArray => {
                return uonet.getHomework(pcsaavArray, day, loginProgressMessage)
            }).then(json => {
                json.forEach(day => {
                    day["Homework"].forEach(work => {
                        workDataText = `Dzień: ${day["Date"].split(' ')[0]}`;
                        workSubjectText = work["Subject"]
                        workDescriptionText = work["Description"] ? ` - ${work["Description"]}` : ""
                        workTeacherText = `Nauczyciel: ${work["Teacher"].split(',')[0]}`
                        homework.push({
                            name: workSubjectText+workDescriptionText,
                            value: `${workDataText}\n${workTeacherText}`
                        })
                    })
                })
                loginProgressMessage.edit(utils.generateEmbed(
                    "Zadania domowe",
                    "Zadania domowe na najbliższy tydzień",
                    homework
                ))
            })
        } else {
            await loginProgressMessage.edit("Aby użyć tej komendy najpierw musisz się zalogować w wiadomości **prywatnej** do mnie. Po więcej informacji użyj komendy `help`")
            await utils.removeFromDatabase(message.author.id)
        }
    }
}
