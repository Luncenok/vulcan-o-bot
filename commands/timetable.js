module.exports = {
    name: "timetable",
    description: "Pokazuje plan lekcji wybranego dnia lub na cały tydzień (domyślnie dzisiejszy plan)",
    aliases: ['plan', 'planlekcji'],
    usage: 'timetable dzisiaj|jutro',
    category: 'vulcan',
    async execute(client, message, args) {
        const uonet = require('../uonet')
        const utils = require('../utils')
        const cheerio = require("cheerio")

        function getTimetableFormattedText(json, dayOfWeek) {
            let timetableText = ""
            json.forEach(lesson => {
                if (lesson[dayOfWeek] !== "") {
                    let hoursString = lesson[0]
                    let hoursSplitted = hoursString.split("<br />")
                    hoursString = hoursSplitted.join("\t")
                    timetableText += hoursString + "\t"
                }
        
                if (lesson[dayOfWeek] === undefined) {
                    timetableText = 'Brak lekcji tego dnia!'
                    return
                }
        
                let $ = cheerio.load(lesson[dayOfWeek], {xmlMode: false})
                let psalaSplitted = $.text().split("     ")
                if (psalaSplitted.length < 2)
                    psalaSplitted = $.text().split("    ")
                if (psalaSplitted.length < 2)
                    psalaSplitted = $.text().split("   ")
                if (psalaSplitted.length < 2)
                    psalaSplitted = $.text().split("  ")
                let psalaReversed = psalaSplitted.reverse()
                let salap = psalaReversed.join("\t")
                timetableText += salap + '\n'
            })
            return `\`\`\`${timetableText}\`\`\``
        }

        const weekDays = ["","poniedziałek", "wtorek", "środa", "czwartek", "piątek"]
        function getWeekDay(arg) {
            if (weekDays.indexOf(arg) != -1) {
                return weekDays.indexOf(arg)
            } else if (Number(arg) >= 1 && Number(arg) <= 5) {
                return Number(arg)
            }
        }

        const loginProgressMessage = await message.channel.send("Logowanie... 0%")

        const loginMessage = await utils.getLoginMessageOrUndefined(message.author)
        if (loginMessage) { 
            await uonet.loginLogOn(loginMessage, loginProgressMessage).then((permcookiesymbolArray) => {
                return uonet.getXVHeaders(permcookiesymbolArray, loginProgressMessage)
            }).then(pcsaavArray => {
                return uonet.getTimetable(pcsaavArray, new Date(), loginProgressMessage)
            }).then(json => {
                loginProgressMessage.edit(getTimetableFormattedText(json, getWeekDay(args[0])))
            })
        } else {
            await loginProgressMessage.edit("Aby użyć tej komendy najpierw musisz się zalogować w wiadomości **prywatnej** do mnie. Po więcej informacji użyj komendy `help`")
            await utils.removeFromDatabase(message.author.id)
        }
    }
}
