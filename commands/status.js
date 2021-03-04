module.exports = {
    name: "status",
    description: "Sprawdza czy vulcan działa czy może nie",
    aliases: ['dziala'],
    usage: 'status',
    category: 'vulcan',
    async execute(client, message) {
        const fetch = require('node-fetch')
        const cheerio = require('cheerio')
        const checkMessage = await message.channel.send('Sprawdzanie...');

        let
            isCufsTitleCorrect = false,
            isCufsCodeCorrect = false,
            isCufsTextCorrect = false,
            isCufsPrzerwa = false,
            isUczenTextCorrect = false,
            isUczenCodeCorrect = false,
            isUczenTitleCorrect = false,
            isUczenPrzerwa = false,
            messageText = "\`\`\`Status dzienniczka vulcan.net.pl dla symbolu warszawa:\n\n"

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
            })

        messageText +=
            (isCufsCodeCorrect && isCufsTextCorrect && isCufsTitleCorrect) ? `Strona logowania działa poprawnie\n` : `Wykryto błąd strony logowania:\n` +
                `Kod?: ${isCufsCodeCorrect}\n` +
                `Tytuł?: ${isCufsTitleCorrect}\n` +
                `Przerwa techniczna?: ${isCufsPrzerwa}\n` +
                `Tekst?" ${isCufsTextCorrect}\n\n`

        messageText +=
            (isUczenCodeCorrect && isUczenTextCorrect && isUczenTitleCorrect) ? `"Nowy Uczeń" działa poprawnie\n\`\`\`` : `Wykryto błąd w "Nowy Uczeń":\n` +
                `Kod?: ${isUczenCodeCorrect}\n` +
                `Tytuł?: ${isUczenTitleCorrect}\n` +
                `Przerwa techniczna?: ${isUczenPrzerwa}\n` +
                `Tekst?: ${isUczenTextCorrect}\n\`\`\``
        checkMessage.edit(messageText)
    }
}
