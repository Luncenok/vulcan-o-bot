const discord = require('discord.js')
const Keyv = require("keyv")
const keyv = new Keyv(process.env.PATH_TO_DATABASE)
const cheerio = require('cheerio')

module.exports.getArgs = async (message) => {
    let args = message.content.slice(process.env.PREFIX.length).split(/ +/);
    args.shift()
    return args
}

module.exports.getLoginMessageOrUndefined = async (author) => {
    let messageId = ""
    messageId = await keyv.get(author.id)
    let msg
    if (messageId)
        await author.createDM()
            .then(channel => channel.messages)
            .then(messages => messages.fetch(messageId))
            .then(message => {
                msg = message
            })
            .catch(error => {
                if (error instanceof discord.DiscordAPIError)
                    msg = undefined
                else console.log(error)
            })
    return msg
}

module.exports.removeFromDatabase = async (userId) => {
    await keyv.delete(userId)
}

module.exports.getDateFromText = (day) => {
    let dateDay = new Date().getDate()
    switch (day) {
        case "dzisiaj":
            return dateDay
        case "jutro":
            return dateDay + 1
        default:
            return dateDay
    }
}

module.exports.getTimetableFormattedText = (json, dayOfWeek) => {
    let timetableText = ""
    json.forEach(lesson => {
        if (lesson[dayOfWeek] !== "") {
            let hoursString = lesson[0]
            let hoursSplitted = hoursString.split("<br />")
            hoursString = hoursSplitted.join("\t")
            timetableText += hoursString + "\t"
        }
        let $ = cheerio.load(lesson[dayOfWeek], {xmlMode: false})
        console.log($.text())
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

module.exports.getExamsFormattedText = (json) => {
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
            } else {
                examsText = "Brak sprawdzianów!"
            }
        })
    })
    return examsText
}
