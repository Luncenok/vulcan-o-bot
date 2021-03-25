module.exports = {
    name: "timetable",
    description: "Pokazuje plan lekcji wybranego dnia lub na cały tydzień (domyślnie dzisiejszy plan)",
    aliases: ['plan', 'planlekcji'],
    usage: ['timetable', 'timetable 12-01-2021', 'timetable 3.3.2020', 'timetable poniedziałek', 'timetable 4'],
    category: 'vulcan',
    async execute(client, message, args) {
        const uonet = require('../uonet')
        const utils = require('../utils')
        const cheerio = require("cheerio")
        message.channel.startTyping()

        const weekDays = ["", "poniedziałek", "wtorek", "środa", "czwartek", "piątek", "sobota", "niedziela"]
        const dateRegex = /(?:(?:31([\/\-.])(?:0?[13578]|1[02]))\1|(?:(?:29|30)([\/\-.])(?:0?[13-9]|1[0-2])\2))(?:(?:1[6-9]|[2-9]\d)?\d{2})$|^(?:29([\/\-.])0?2\3(?:(?:1[6-9]|[2-9]\d)?(?:0[48]|[2468][048]|[13579][26])|(?:(?:16|[2468][048]|[3579][26])00)))$|^(?:0?[1-9]|1\d|2[0-8])([\/\-.])(?:(?:0?[1-9])|(?:1[0-2]))\4(?:(?:1[6-9]|[2-9]\d)?\d{2})/
        let loginProgressMessage;
        await message.channel.send("Logowanie... 0%").then(lpMessage => {
            loginProgressMessage = lpMessage
        })
        let gotDate = false;
        const date = getDateFromFormat(args[0])

        const loginMessage = await utils.getLoginMessageOrUndefined(message.author)
        if (loginMessage) {
            await uonet.loginLogOn(loginMessage, loginProgressMessage).then((permsCookieSymbolUrl) => {
                return uonet.getXVHeaders(permsCookieSymbolUrl, loginProgressMessage)
            }).then(loginInfo => {
                return uonet.getTimetable(loginInfo, date, loginProgressMessage)
            }).then(json => {
                let dayText;
                let day = getWeekDay(args[0], json["Rows"])
                if (json["Headers"][day] !== undefined)
                    dayText = json["Headers"][1]["Text"].split("<br />").join(" ");
                else dayText = weekDays[day];
                message.channel.stopTyping()
                loginProgressMessage.edit("Plan na dzień: " + dayText + "\n" + getTimetableFormattedText(json, day))
            })
        } else {
            await loginProgressMessage.edit("Aby użyć tej komendy najpierw musisz się zalogować w wiadomości **prywatnej** do mnie. Po więcej informacji użyj komendy `help`")
            await utils.removeFromDatabase(message.author.id)
        }

        function getTimetableFormattedText(jsonMain, dayOfWeek) {
            let timetableText = ""
            let json = jsonMain["Rows"]

            let i = 0, j = 0
            json.forEach(lesson => {
                if (lesson[dayOfWeek] === "" || lesson[dayOfWeek] === undefined) i++
                j++
            })
            if (i === j) {
                timetableText = 'Brak lekcji tego dnia!'
                return `\`\`\`${timetableText}\`\`\``
            }
            json.forEach(lesson => {
                if (lesson[dayOfWeek] !== "" && lesson[dayOfWeek] !== undefined) {
                    let hoursString = lesson[0]
                    let hoursSplitted = hoursString.split("<br />")
                    let date = new Date()
                    let now = date.getHours() * 60 + date.getMinutes()
                    let start = parseInt(hoursSplitted[1].split(':')[0]) * 60 + parseInt(hoursSplitted[1].split(':')[1])
                    let end = parseInt(hoursSplitted[2].split(':')[0]) * 60 + parseInt(hoursSplitted[2].split(':')[1])
                    if (start <= now && now <= end && `${date.toISOString().split("T")[0]} 00:00:00` === jsonMain["Data"]) {
                        hoursString = hoursSplitted.join(" ~> ")
                        timetableText += `${hoursString} ~> `
                    } else {
                        hoursString = hoursSplitted.join("    ")
                        timetableText += `${hoursString}    `
                    }

                    let $ = cheerio.load(lesson[dayOfWeek], {xmlMode: false})
                    let przedmiotSalaTab = $.text().split("     ")
                    if (przedmiotSalaTab.length < 2)
                        przedmiotSalaTab = $.text().split("    ")
                    if (przedmiotSalaTab.length < 2)
                        przedmiotSalaTab = $.text().split("   ")
                    if (przedmiotSalaTab.length < 2)
                        przedmiotSalaTab = $.text().split("  ")
                    if (przedmiotSalaTab.length < 2) {
                        let tab, tab2 = [], tab3 = []
                        tab = $.text().split(" ")
                        for (let i = 0; i < tab.length - 1; i++) {
                            tab2.push(tab[i])
                        }
                        let x = tab2.join(" ")
                        tab3.push(x)
                        tab3.push(tab[tab.length - 1])
                        przedmiotSalaTab = tab3
                    }
                    let salaPrzedmiotTab = przedmiotSalaTab.reverse()
                    if (salaPrzedmiotTab.join("") !== '') {
                        let salaPrzedmiotFormattedText = salaPrzedmiotTab.join("\t")
                        timetableText += salaPrzedmiotFormattedText + '\n'
                    }
                }
            })
            return `\`\`\`${timetableText}\`\`\``
        }

        function getWeekDay(arg, json) {
            let day = date;
            if (weekDays.indexOf(arg) !== -1) {
                return weekDays.indexOf(arg)
            } else if (parseInt(arg) >= 1 && parseInt(arg) <= 5) {
                return parseInt(arg)
            } else if (gotDate) {
                return day.getDay()
            } else {
                let last
                for (let lesson of json.reverse()) {
                    if (lesson[day.getDay()]) {
                        last = parseFloat(lesson[0].split('<br />')[2].split(':').join('.'))
                        break
                    }
                }
                json.reverse()
                return (day.getDay() === 0 || day.getDay() === 6 ? 1 : day.getDay() + Number(day.getHours() + day.getMinutes() / 100 >= last))
            }
        }

        function getDateFromFormat(arg) {
            let day = new Date();
            if (dateRegex.test(arg)) {
                day.setFullYear(Number(args[0].split(/[.\-\/]/)[2]), Number(args[0].split(/[.\-\/]/)[1]) - 1, Number(args[0].split(/[.\-\/]/)[0]))
                gotDate = true
            }
            return day;
        }
    }
}
