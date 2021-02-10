const fetch = require('node-fetch')
const cheerio = require('cheerio')
const utils = require('./utils')

module.exports.loginLogOn = async (loginMessage, loginProgressMessage) => {

    try {
        let ciasteczka = ""
        let permissions

        let args = await utils.getArgs(loginMessage)
        let email = args[0], password = args[1], symbol = args[2]

        let logOnUrl = `https://cufs.vulcan.net.pl/${symbol}/Account/LogOn?` +
            `ReturnUrl=%2F${symbol}%2FFS%2FLS%3F` +
            `wa%3Dwsignin1.0%26wtrealm%3Dhttps%253a%252f%252fuonetplus.vulcan.net.pl%252f${symbol}%252f%26` +
            `wctx%3Dhttps%253a%252f%252fuonetplus.vulcan.net.pl%252f${symbol}%252f`

        const logOnBody = {
            LoginName: email,
            Password: password
        };

        let fslsUrl = ""
        await fetch(logOnUrl, {
            method: 'post',
            body: JSON.stringify(logOnBody),
            headers: {'Content-Type': 'application/json', 'user-agent': 'Mozilla/5.0'},
            follow: 0,
            redirect: 'manual'
        })
            .then(res => {
                try {
                    fslsUrl = res.headers.raw()['location'][0]
                } catch (e) {
                }
                const raw = res.headers.raw()['set-cookie'];
                ciasteczka = raw.map((entry) => {
                    const parts = entry.split(';');
                    return parts[0];
                }).join(';');
                return res
            })
            .then(res => res.text())
            .then(res => {
                if (res.toString().search('(Zła nazwa użytkownika lub hasło)') >= 0) {
                    throw "Zła nazwa użytkownika lub hasło."
                }
            })
        loginProgressMessage.edit('Logowanie... 25%');

        let wa, wctx, wresult, wctxEscaped, wresultEscaped
        let fslsRes = ""

        await fetch(fslsUrl, {
            method: 'get',
            headers: {'Cookie': ciasteczka, 'user-agent': 'Mozilla/5.0'},
            follow: 0,
            redirect: 'manual'
        })
            .then(res => {
                const raw = res.headers.raw()['set-cookie'];
                ciasteczka += ';'
                const cookieString = raw.map((entry) => {
                    const parts = entry.split(';');
                    return parts[0];
                }).join(';');
                ciasteczka += cookieString

                return res
            })
            .then(res => res.text())
            .then(res => {
                fslsRes = res
            })

        let $ = await cheerio.load(fslsRes)
        wa = await $('input[name=wa]').attr('value')
        wresult = await $('input[name=wresult]').attr('value')
        wctx = await $('input[name=wctx]').attr('value')
        wresultEscaped = encodeURIComponent(wresult)
        wctxEscaped = encodeURIComponent(wctx)

        loginProgressMessage.edit('Logowanie... 50%');

        const loginBody = `wa=${wa}&wresult=${wresultEscaped}&wctx=${wctxEscaped}`
        await fetch(wctx, {
            method: 'post',
            headers: {
                'Cookie': ciasteczka,
                'User-Agent': 'Mozilla/5.0',
                'Content-Type': 'application/x-www-form-urlencoded'
            },
            body: loginBody,
            follow: 0,
            redirect: 'manual'
        })
            .then(res => {
                const raw = res.headers.raw()['set-cookie'];
                ciasteczka += ';'
                const cookieString = raw.map((entry) => {
                    const parts = entry.split(';');
                    return parts[0];
                }).join(';');
                ciasteczka += cookieString
                return res
            })
            .then(res => res.text())
            .then(res => {
                if (res.toString().search('(Podany identyfikator klienta jest niepoprawny)') >= 0 ||
                    res.toString().search('(Zaloguj się)') >= 0) {
                    throw "Podany identyfikator klienta (symbol) jest niepoprawny."
                }
            })
        loginProgressMessage.edit('Logowanie... 75%');

        let startMvcRes = ""
        const startmvcUrl = `https://uonetplus.vulcan.net.pl/${symbol}/Start.mvc/Index`
        await fetch(startmvcUrl, {
            method: 'get',
            headers: {'Cookie': ciasteczka, 'User-Agent': 'Mozilla/5.0'},
            follow: 0,
            redirect: 'manual'
        })
            .then(res => res.text())
            .then(res => {
                startMvcRes = res
            })

        $ = cheerio.load(startMvcRes, {xmlMode: false})
        let permraw = $.html()
        permissions = permraw.substr(permraw.search('(permissions: )'), 1000).split("'", 2)[1]
        console.log(`Logged in: user id: ${loginMessage.author.id} permissions length: ${permissions.length} cookies length: ${ciasteczka.length}`)

        loginProgressMessage.edit('Zalogowano! Pobieranie danych... 0%');

        return [permissions, ciasteczka, symbol]
    } catch (error) {
        console.log(`!error! user id: ${loginMessage.author.id} error: ${error}`)
        loginProgressMessage.edit(`\`\`\`\n${error}\`\`\``)
        return [undefined, undefined, undefined]
    }
}

module.exports.getLuckyNumber = async ([permissions, cookies, symbol], loginProgressMessage) => {

    let luckyNumberText = ""
    let url = `https://uonetplus.vulcan.net.pl/${symbol}/Start.mvc/GetKidsLuckyNumbers`
    const body = {
        permissions: permissions
    }
    await loginProgressMessage.edit('Pobieranie danych... 50%')

    await fetch(url, {
        method: 'post',
        body: JSON.stringify(body),
        headers: {
            'Cookie': cookies,
            'User-Agent': 'Mozilla/5.0',
            'Content-Type': 'application/x-www-form-urlencoded'
        },
        follow: 0,
        redirect: 'manual'
    })
        .then(res => res.text())
        .then(res => {
            let lnJson = JSON.parse(res)
            luckyNumberText = lnJson["data"][0]["Zawartosc"][0]["Zawartosc"][0]["Nazwa"]
        })
    return luckyNumberText
}
