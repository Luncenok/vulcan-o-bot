const fetch = require('node-fetch')
const cheerio = require('cheerio')

module.exports.loginLogOn = async (email, password, symbol, message) => {

    let fslsUrl = "/FS/LS?wa=wsignin1.0&w..."
    let ciasteczka = ""

    const body = {
        LoginName: email,
        Password: password
    };

    let logOnUrl = `https://cufs.vulcan.net.pl/${symbol}/Account/LogOn?` +
        `ReturnUrl=%2F${symbol}%2FFS%2FLS%3F` +
        `wa%3Dwsignin1.0%26wtrealm%3Dhttps%253a%252f%252fuonetplus.vulcan.net.pl%252f${symbol}%252f%26` +
        `wctx%3Dhttps%253a%252f%252fuonetplus.vulcan.net.pl%252f${symbol}%252f`

    console.log(logOnUrl)
    await fetch(logOnUrl, {
        method: 'post',
        body: JSON.stringify(body),
        headers: {'Content-Type': 'application/json', 'user-agent': 'Mozilla/5.0'},
        follow: 0,
        redirect: 'manual'
    })
        .then(res => {
            fslsUrl = res.headers.raw()['location'][0]
            const raw = res.headers.raw()['set-cookie'];
            ciasteczka = raw.map((entry) => {
                const parts = entry.split(';');
                return parts[0];
            }).join(';');
        })
        .catch(error => {
            console.log(error)
        })
    message.edit('Logowanie... 25%');
    return loginFSLS(fslsUrl, ciasteczka, message, symbol)
}

async function loginFSLS(fslsUrl, ciasteczka, message, symbol) {
    let wa, wctx, wresult, wctxEscaped, wresultEscaped
    let fslsRes = "fsls res"

    console.log(fslsUrl)
    await fetch(fslsUrl, {
        method: 'get',
        headers: {'Cookie': ciasteczka, 'user-agent': 'Mozilla/5.0'},
        follow: 0,
        redirect: 'manual'
    })
        .then(res => {
            const raw = res.headers.raw()['set-cookie'];
            ciasteczka += ';'
            const elo = raw.map((entry) => {
                const parts = entry.split(';');
                return parts[0];
            }).join(';');
            ciasteczka += elo

            return res
        })
        .then(res => res.text())
        .then(res => {
            fslsRes = res
        })
        .catch(error => {
            console.log(error)
        })

    let $ = await cheerio.load(fslsRes)
    wa = await $('input[name=wa]').attr('value')
    wresult = await $('input[name=wresult]').attr('value')
    wctx = await $('input[name=wctx]').attr('value')
    wresultEscaped = encodeURIComponent(wresult)
    wctxEscaped = encodeURIComponent(wctx)

    message.edit('Logowanie... 50%');

    return loginWctx(wa, wresult, wctx, wctxEscaped, wresultEscaped, ciasteczka, message, symbol)

}

async function loginWctx(wa, wresult, wctx, wctxEscaped, wresultEscaped, ciasteczka, message, symbol) {

    const loginBody = `wa=${wa}&wresult=${wresultEscaped}&wctx=${wctxEscaped}`
    console.log(wctx)
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
            const elo = raw.map((entry) => {
                const parts = entry.split(';');
                return parts[0];
            }).join(';');
            ciasteczka += elo
            return res
        })
        .catch(error => {
            console.log(error)
        })
    message.edit('Logowanie... 75%');
    return loginStart(ciasteczka, symbol, message)
}

async function loginStart(ciasteczka, symbol, message) {

    let s
    const startmvcUrl = `https://uonetplus.vulcan.net.pl/${symbol}/Start.mvc/Index`
    console.log(startmvcUrl)
    await fetch(startmvcUrl, {
        method: 'get',
        headers: {'Cookie': ciasteczka, 'User-Agent': 'Mozilla/5.0'},
        follow: 0,
        redirect: 'manual'
    })
        .then(res => {
            return res
        })
        .then(res => res.text())
        .then(res => {
            s = res
        })
        .catch(error => {
            console.log(error)
        })
    console.log(s.length + '\n')

    let $ = cheerio.load(s, {xmlMode: false})
    let permraw = $.html()
    let permissions = permraw.substr(permraw.search('(permissions: )'), 1000).split("'", 2)[1]
    console.log(permissions)

    message.edit('Logowanie... 100%');

    return [permissions, ciasteczka]
}

