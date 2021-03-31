module.exports = {
    name: "homework",
    description: "Pokazuje zadania domowe na następny tydzień",
    aliases: ['zadania', 'domowe', 'zadania-domowe', 'zaddom', 'zad'],
    usage: ['homework'],
    category: 'vulcan',
    async execute(client, message) {
        const uonet = require('../uonet')
        const utils = require('../utils')

        let loginProgressMessage;
        await message.channel.send("Logowanie... 0%").then(lpMessage => {
            loginProgressMessage = lpMessage
        })
        message.channel.startTyping()

        let homework = [], workDataText, workSubjectText, workDescriptionText, workTeacherText

        const loginMessage = await utils.getLoginMessageOrUndefined(message.author)
        if (loginMessage) {
            const day = new Date().getDate()
            await uonet.loginLogOn(loginMessage, loginProgressMessage).then(loginInfo => {
                return uonet.getHomework(loginInfo, day, loginProgressMessage)
            }).then(json => {
                json.forEach(day => {
                    day["Homework"].forEach(work => { // ale to jest rzyg. Jak poprosisz vulcana o json sprawdzianów, to obiekt sprawdzianów nazywa się "Sprawdziany" a jak poprosisz vulcana o json zadań domowych, to obiekt zadań nazywa się "Homework"
                        workDataText = `Dzień: ${day["Date"].split(' ')[0]}`;
                        workSubjectText = work["Subject"]
                        workDescriptionText = work["Description"] ? ` - ${work["Description"]}` : "(brak opisu)"
                        workTeacherText = `Nauczyciel: ${work["Teacher"].split(',')[0]}`
                        homework.push({
                            name: workSubjectText + workDescriptionText,
                            value: `${workDataText}\n${workTeacherText}`
                        })
                    })
                })
                message.channel.stopTyping(true)
                let description = "Zadania domowe na najbliższy tydzień: "
                if (homework.length <= 0) description += "Brak!"
                loginProgressMessage.edit(utils.generateEmbed(
                    "Zadania domowe",
                    description,
                    homework
                ))
            })
        } else {
            message.channel.stopTyping(true)
            await loginProgressMessage.edit("Aby użyć tej komendy najpierw musisz się zalogować w wiadomości **prywatnej** do mnie. Po więcej informacji użyj komendy `help`")
            await utils.removeFromDatabase(message.author.id)
        }
    }
}
