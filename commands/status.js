module.exports = {
    name: "status",
    description: "Sprawdza czy vulcan działa czy może nie",
    aliases: ['dziala'],
    usage: 'status',
    category: 'vulcan',
    async execute(client, message) {
        const fetch = require('node-fetch')
        const cheerio = require('cheerio')
        const utils = require('../utils')
        const checkMessage = await message.channel.send('Sprawdzanie...');

        let
            isCufsTitleCorrect = false,
            isCufsCodeCorrect = false,
            isCufsTextCorrect = false,
            isCufsPrzerwa = false,
            cufsError = undefined,
            isUczenTextCorrect = false,
            isUczenCodeCorrect = false,
            isUczenTitleCorrect = false,
            isUczenPrzerwa = false,
            uczenError = undefined

        await fetch('https://uonetplus.vulcan.net.pl/warszawa')
            .then(res => {
                let cufsCode = res.status
                if (cufsCode === 200) isCufsCodeCorrect = true
                return res.text()
            })
            .then(res => {
                let $ = cheerio.load(res)
                let cufsTitle = $('title').text()
                if (res.search('Zaloguj się') >= 0) isCufsTextCorrect = true
                if (cufsTitle === "Dziennik UONET+") isCufsTitleCorrect = true
                if (cufsTitle === "Przerwa techniczna") isCufsPrzerwa = true
            })
            .catch(error => {
                console.log(error)
                cufsError = error.message
            })

        await fetch('https://uonetplus-uczen.vulcan.net.pl/warszawa')
            .then(res => {
                let uczenCode = res.status
                if (uczenCode === 200) isUczenCodeCorrect = true
                return res.text()
            })
            .then(res => {
                let $ = cheerio.load(res)
                let uczenTitle = $('title').text()
                if (res.search('Zaloguj się') >= 0) isUczenTextCorrect = true
                if (uczenTitle === "Uczeń") isUczenTitleCorrect = true
                if (uczenTitle === "Przerwa techniczna") isUczenPrzerwa = true
            })
            .catch(error => {
                console.log(error)
                uczenError = error.message
            })

        const embed = utils.generateEmbed(
            "Status dzienniczka vulcan.net.pl",
            "Status dzienniczka vulcan.net.pl dla symbolu warszawa",
            [{
                name: (isCufsCodeCorrect && isCufsTextCorrect && isCufsTitleCorrect)
                    ? "Strona logowania działa poprawnie"
                    : "Wykryto błąd strony logowania:",
                value: (isCufsCodeCorrect && isCufsTextCorrect && isCufsTitleCorrect)
                    ? ":ok_hand:"
                    : `Kod?: ${isCufsCodeCorrect ? ":white_check_mark:" : ":x:"}\n` +
                    `Tytuł?: ${isCufsTitleCorrect ? ":white_check_mark:" : ":x:"}\n` +
                    `Tekst?" ${isCufsTextCorrect ? ":white_check_mark:" : ":x:"}\n` +
                    `Przerwa techniczna?: ${isCufsPrzerwa ? ":white_check_mark:" : ":x:"}\n` +
                    `Error?" ${cufsError ? cufsError : ":x:"}`
            }, {
                name: (isUczenCodeCorrect && isUczenTextCorrect && isUczenTitleCorrect)
                    ? "Nowy Uczeń działa poprawnie\n"
                    : "Wykryto błąd w Nowym Uczniu:\n",
                value: (isUczenCodeCorrect && isUczenTextCorrect && isUczenTitleCorrect)
                    ? ":ok_hand:"
                    : `Kod?: ${isUczenCodeCorrect ? ":white_check_mark:" : ":x:"}\n` +
                    `Tytuł?: ${isUczenTitleCorrect ? ":white_check_mark:" : ":x:"}\n` +
                    `Tekst?: ${isUczenTextCorrect ? ":white_check_mark:" : ":x:"}\n` +
                    `Przerwa techniczna?: ${isUczenPrzerwa ? ":white_check_mark:" : ":x:"}\n` +
                    `Error?: ${uczenError ? "\`uczenError\`" : ":x:"}`
            }]
        )
        checkMessage.edit("_")
        checkMessage.edit(embed)
    }
}
