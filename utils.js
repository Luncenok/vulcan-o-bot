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

module.exports.generateEmbed = (title, description, fields) => {
    /**
     * Generates embed for Vulcan'o'bot with color, author, timestamp and footer
     * 
     * @author Łukasz Szczyt
     * @param {string} title Title of generated embed
     * @param {string} description Description of generated embed
     * @param {Array} fields Fields of generated embed. Array of objects {{name: *name*}: {value: *value*}}
     */
    const Embed = {
        color: 0xd6d6d6,
        title: `${title}`,
        author: {
            name: "Vulcan'o'bot",
            icon_url: "https://s1.qwant.com/thumbr/0x380/0/5/5391fa8d72b7814188fd706773e8b335d12cb9505b3774e70eb952cd4a4a79/vector-volcano-eruption-illustration.jpg?u=https%3A%2F%2Fstatic.vecteezy.com%2Fsystem%2Fresources%2Fpreviews%2F000%2F216%2F030%2Foriginal%2Fvector-volcano-eruption-illustration.jpg&q=0&b=1&p=0&a=1"
        },
        description: `${description}`,
        fields: fields,
        timestamp: new Date(),
        footer: {
            text: "Vulcan'o'bot",
            icon_url: "https://s1.qwant.com/thumbr/0x380/0/5/5391fa8d72b7814188fd706773e8b335d12cb9505b3774e70eb952cd4a4a79/vector-volcano-eruption-illustration.jpg?u=https%3A%2F%2Fstatic.vecteezy.com%2Fsystem%2Fresources%2Fpreviews%2F000%2F216%2F030%2Foriginal%2Fvector-volcano-eruption-illustration.jpg&q=0&b=1&p=0&a=1"
        }
    }
    /**
     * @todo icon get from assets folder, not from url
     * @returns {Discord.MessageEmbed} Ready to send embed
     */
    return {embed: Embed}

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
