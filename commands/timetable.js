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

        const weekDays = ["","poniedziałek", "wtorek", "środa", "czwartek", "piątek", "sobota", "niedziela"]
        function getWeekDay(arg, json) {
            if (weekDays.indexOf(arg) != -1) {
                return weekDays.indexOf(arg)
            } else if (parseInt(arg) >= 1 && parseInt(arg) <= 5) {
                return parseInt(arg)
            } else if (/^[0-9]{2}\.[0-1][0-9]\.20[0-9]{2}$/.test(args[0])) {
                let day = new Date()
                day.setFullYear(Number(args[0].split('.')[2]), Number(args[0].split('.')[1])-1, Number(args[0].split('.')[0]))
                return day.getDay();
            } else {
                let day = new Date()
                let last
                for (let lesson of json.reverse()) {
                    if (lesson[day.getDay()]) {
                        last = parseFloat(lesson[0].split('<br />')[2].split(':').join('.'))
                        break
                    }
                }
                json.reverse()
                return day.getDay() == 0 || day.getDay() == 6 ? 1 : day.getDay() + Number(day.getHours() + day.getMinutes()/100 >= last)
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
                let day = getWeekDay(args[0], json)
                loginProgressMessage.edit("Plan na dzień: "+weekDays[day]+"\n"+getTimetableFormattedText(json, day))
            })
        } else {
            await loginProgressMessage.edit("Aby użyć tej komendy najpierw musisz się zalogować w wiadomości **prywatnej** do mnie. Po więcej informacji użyj komendy `help`")
            await utils.removeFromDatabase(message.author.id)
        }
    }
}
