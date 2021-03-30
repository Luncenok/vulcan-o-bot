const fetch = require('node-fetch')
const cheerio = require('cheerio')
const utils = require('./utils')
const Discord = require('discord.js')

/**
 * Logs in into Uonet register
 * @author Mateusz Idziejczak
 * @param {Discord.Message} loginMessage Message which contains user email, password and symbol
 * @param {Discord.Message} loginProgressMessage Message with progress in percents
 * @returns {Promise<string[]>} Object with data
 */
module.exports.loginLogOn = async (loginMessage, loginProgressMessage) => {
    try {
        let cookies = ""
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
                cookies = raw.map((entry) => {
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
        await loginProgressMessage.edit('Logowanie... 25%');

        let wa, wctx, wresult, wctxEscaped, wresultEscaped
        let fslsRes = ""

        await fetch(fslsUrl, {
            method: 'get',
            headers: {'Cookie': cookies, 'user-agent': 'Mozilla/5.0'},
            follow: 0,
            redirect: 'manual'
        })
            .then(res => {
                const raw = res.headers.raw()['set-cookie'];
                cookies += ';'
                const cookieString = raw.map((entry) => {
                    const parts = entry.split(';');
                    return parts[0];
                }).join(';');
                cookies += cookieString

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

        await loginProgressMessage.edit('Logowanie... 50%');

        const loginBody = `wa=${wa}&wresult=${wresultEscaped}&wctx=${wctxEscaped}`
        await fetch(wctx, {
            method: 'post',
            headers: {
                'Cookie': cookies,
                'User-Agent': 'Mozilla/5.0',
                'Content-Type': 'application/x-www-form-urlencoded'
            },
            body: loginBody,
            follow: 0,
            redirect: 'manual'
        })
            .then(res => {
                const raw = res.headers.raw()['set-cookie'];
                cookies += ';'
                const cookieString = raw.map((entry) => {
                    const parts = entry.split(';');
                    return parts[0];
                }).join(';');
                cookies += cookieString
                return res
            })
            .then(res => res.text())
            .then(res => {
                if (res.toString().search('(Podany identyfikator klienta jest niepoprawny)') >= 0 ||
                    res.toString().search('(Zaloguj się)') >= 0) {
                    throw "Podany identyfikator klienta (symbol) jest niepoprawny."
                }
            })
        await loginProgressMessage.edit('Logowanie... 75%');

        let startMvcRes = ""
        const startmvcUrl = `https://uonetplus.vulcan.net.pl/${symbol}/Start.mvc/Index`
        await fetch(startmvcUrl, {
            method: 'get',
            headers: {'Cookie': cookies, 'User-Agent': 'Mozilla/5.0'},
            follow: 0,
            redirect: 'manual'
        })
            .then(res => res.text())
            .then(res => {
                startMvcRes = res
            })

        $ = cheerio.load(startMvcRes, {xmlMode: false})
        let baseUrl = $('a[title=Uczeń]').attr('href')
        let permraw = $.html()
        permissions = permraw.substr(permraw.search('(permissions: )'), 1000).split("'", 2)[1]
        console.log(`Logged in: user id: ${loginMessage.author.id} permissions length: ${permissions.length} cookies length: ${cookies.length}`)

        await loginProgressMessage.edit('Zalogowano! Pobieranie danych... 0%');

        let xvUrl = baseUrl
        let response = "", resJson = undefined
        await fetch(xvUrl, {
            method: 'get',
            headers: {'User-Agent': 'Mozilla/5.0', 'Cookie': cookies},
            follow: 0,
            redirect: 'manual'
        }).then(res => {
            const raw = res.headers.raw()['set-cookie'];
            cookies += ';'
            const cookieString = raw.map((entry) => {
                const parts = entry.split(';');
                return parts[0];
            }).join(';');
            cookies += cookieString
        })
        await loginProgressMessage.edit("Pobieranie danych... 25%")

        await fetch(`${baseUrl}/Start`, {
            method: 'get',
            headers: {'User-Agent': 'Mozilla/5.0', 'Cookie': cookies},
            follow: 0,
            redirect: 'manual'
        }).then(res => {
            const raw = res.headers.raw()['set-cookie'];
            cookies += ';'
            const cookieString = raw.map((entry) => {
                const parts = entry.split(';');
                return parts[0];
            }).join(';');
            cookies += cookieString

            return res
        })
            .then(res => res.text())
            .then(res => {
                response = res
            })
        await loginProgressMessage.edit("Pobieranie danych... 50%")

        await fetch(`${baseUrl}/UczenDziennik.mvc/Get`, {
            method: 'get',
            headers: {'User-Agent': 'Mozilla/5.0', 'Cookie': cookies},
            follow: 0,
            redirect: 'manual'
        }).then(res => {
            const raw = res.headers.raw()['set-cookie'];
            cookies += ';'
            const cookieString = raw.map((entry) => {
                const parts = entry.split(';');
                return parts[0];
            }).join(';');
            cookies += cookieString

            return res
        })
            .then(res => res.text())
            .then(res => {
                resJson = JSON.parse(res)
            })
        await loginProgressMessage.edit("Pobieranie danych... 75%")

        let uczenIdRok = await utils.getUczenIdRokOrUndefined(loginMessage.author.id)
        if (uczenIdRok === undefined) uczenIdRok = ""
        let uczenId = uczenIdRok.split('-')[0]
        let rok = uczenIdRok.split('-')[1]
        let index = -1, maxi = -1
        let studentNames = ""
        resJson["data"].reverse().forEach((uczen, i) => {
            studentNames += `${i}: ${uczen["UczenPelnaNazwa"]}\n`
            if (`${uczen["IdUczen"]}` === uczenId && `${uczen["DziennikRokSzkolny"]}` === rok) index = i
            maxi = i
        })
        studentNames += "```"
        if (index === -1) {
            const filter = m => parseInt(m.content) >= 0 && parseInt(m.content) <= maxi && m.author.id === loginMessage.author.id;

            await loginProgressMessage.channel.send(`\`\`\`Wybierz ucznia: \n${studentNames}`)
            await loginProgressMessage.channel.awaitMessages(filter, {max: 1, time: 30000, errors: ['time']})
                .then(collected => {
                    return parseInt(collected.first().content)
                })
                .then(ind => {
                    index = ind
                    utils.setUczenId(loginMessage.author.id, resJson["data"][index])
                    loginProgressMessage.channel.send(`Wybrano ucznia ${resJson["data"][index]["UczenPelnaNazwa"]}`);
                })
                .catch(() => {
                    throw 'Nie wybrano ucznia. Anulowano logowanie'
                });
        }
        let idBiezacyUczen = resJson["data"][index]["IdUczen"]
        let idBiezacyDziennik = resJson["data"][index]["IdDziennik"]
        let rokSzkolny = resJson["data"][index]["DziennikRokSzkolny"]
        let okresId = -1
        resJson["data"][index]["Okresy"].forEach((okres) => {
            if (okres["IsLastOkres"]) okresId = okres["Id"]
        })

        $ = cheerio.load(response, {xmlMode: false})
        let raw = $.html()
        let antiForgeryToken = raw.substr(raw.search('(antiForgeryToken: )'), 200).split("'", 2)[1]
        let appGuid = raw.substr(raw.search('(appGuid: )'), 100).split("'", 2)[1]
        let version = raw.substr(raw.search('(version: )'), 20).split("'", 2)[1]

        cookies += `;idBiezacyUczen=${idBiezacyUczen};idBiezacyDziennik=${idBiezacyDziennik};biezacyRokSzkolny=${rokSzkolny}`

        return [permissions, cookies, symbol, antiForgeryToken, appGuid, version, baseUrl, rokSzkolny, okresId]
    } catch (error) {
        console.log(`!error! login error: ${error}`)
        loginProgressMessage.channel.stopTyping(true)
        await loginProgressMessage.channel.send(`\`\`\`\n${error}\`\`\``)
    }
}

/**
 * Gets lucky number from vulcan uonet+
 * @author Mateusz Idziejczak
 * @param {string} permissions String with encoded json needed to login
 * @param {string} cookies Cookies
 * @param {string} symbol Symbol of vulcan register
 * @param {string} baseUrl Base url with symbol and number of unit
 * @param {Discord.Message} loginProgressMessage Message with progress in percents
 * @returns {Promise<string>} Ready to send text with lucky number in it
 */
module.exports.getLuckyNumber = async ([permissions, cookies, symbol, baseUrl], loginProgressMessage) => {
    try {
        let luckyNumberText = ""
        let url = `https://uonetplus.vulcan.net.pl/${symbol}/Start.mvc/GetKidsLuckyNumbers`
        const body = {
            permissions: permissions
        }

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
                luckyNumberText = lnJson["data"][0]["Zawartosc"][0]["Zawartosc"][0]["Nazwa"] // bez jaj...
            })
            .catch(error => {
                loginProgressMessage.edit(error)
                throw error
            })
        await loginProgressMessage.edit('Pobieranie danych... 50%')
        return luckyNumberText
    } catch (error) {
        console.log(`!error! baseUrl: ${baseUrl} error: ${error}`)
        loginProgressMessage.channel.stopTyping(true)
        await loginProgressMessage.channel.send(`\`\`\`\n${error}\`\`\``)
    }
}

/**
 * Gets timetable from vulcan uonet+
 * @author Mateusz Idziejczak
 * @param {string[]} loginInfoArray Array with all data needed to get any information from vulcan uonet+
 * @param {Date} date Date of the timetable
 * @param {Discord.Message} loginProgressMessage Message with progress in percents
 * @returns {Promise<Object|undefined>} Json with information about timetable ready to parse
 */
module.exports.getTimetable = async ([permissions, cookies, symbol, antiForgeryToken, appGuid, version, baseUrl, rokSzkolny, okresId], date, loginProgressMessage) => {
    try {

        let url = `${baseUrl}/PlanZajec.mvc/Get`
        let data = date.toISOString().slice(0, 11) + '00:00:00'
        const body = {
            'data': data
        }
        const headers = {
            'Cookie': cookies,
            'User-Agent': 'Mozilla/5.0',
            'Content-Type': 'application/json',
            'x-requested-with': 'XMLHttpRequest',
            'x-v-appguid': appGuid,
            'x-v-appversion': version,
            'x-v-requestverificationtoken': antiForgeryToken
        }

        let json = await fetchData(url, body, headers, loginProgressMessage)

        await loginProgressMessage.edit('Pobieranie danych... 99%')
        return json
    } catch (error) {
        console.log(`!error! baseUrl: ${baseUrl} error: ${error}`)
        loginProgressMessage.channel.stopTyping(true)
        await loginProgressMessage.channel.send(`\`\`\`\n${error}\`\`\``)
        return undefined
    }
}

/**
 * Gets exams from vulcan uonet+
 * @author Mateusz Idziejczak
 * @param {string[]} loginInfoArray Array with all data needed to get any information from vulcan uonet+
 * @param {number} day Day of week to get exams for 4 months from this day
 * @param {Discord.Message} loginProgressMessage Message with progress in percents
 * @returns {Promise<Object|undefined>} Json with information about timetable ready to parse
 */
module.exports.getExams = async ([permissions, cookies, symbol, antiForgeryToken, appGuid, version, baseUrl, rokSzkolny, okresId], day, loginProgressMessage) => {
    try {

        let url = `${baseUrl}/Sprawdziany.mvc/Get`
        let data = new Date()
        data.setDate(day)
        data = data.toISOString().slice(0, 11) + '00:00:00'
        const body = {
            'data': data,
            'rokSzkolny': rokSzkolny
        }
        const headers = {
            'Cookie': cookies,
            'User-Agent': 'Mozilla/5.0',
            'Content-Type': 'application/json',
            'x-requested-with': 'XMLHttpRequest',
            'x-v-appguid': appGuid,
            'x-v-appversion': version,
            'x-v-requestverificationtoken': antiForgeryToken
        }

        let json = await fetchData(url, body, headers, loginProgressMessage)

        await loginProgressMessage.edit('Pobieranie danych... 99%')
        return json
    } catch (error) {
        console.log(`!error! baseUrl: ${baseUrl} error: ${error}`)
        loginProgressMessage.channel.stopTyping(true)
        await loginProgressMessage.channel.send(`\`\`\`\n${error}\`\`\``)
        return undefined
    }
}

/**
 * Gets homeworks from vulcan uonet+
 * @author Mateusz Idziejczak
 * @param {string[]} loginInfoArray Array with all data needed to get any information from vulcan uonet+
 * @param {number} day Day of week
 * @param {Discord.Message} loginProgressMessage Message with progress in percents
 * @returns {Promise<Object|undefined>} Json with information about homework ready to parse
 */
module.exports.getHomework = async ([permissions, cookies, symbol, antiForgeryToken, appGuid, version, baseUrl, rokSzkolny, okresId], day, loginProgressMessage) => {
    try {

        let url = `${baseUrl}/Homework.mvc/Get`
        let data = new Date()
        data.setDate(day)
        data = data.toISOString().slice(0, 11) + '00:00:00'
        const body = {
            'date': data,
            'schoolYear': rokSzkolny
        }
        const headers = {
            'Cookie': cookies,
            'User-Agent': 'Mozilla/5.0',
            'Content-Type': 'application/json',
            'x-requested-with': 'XMLHttpRequest',
            'x-v-appguid': appGuid,
            'x-v-appversion': version,
            'x-v-requestverificationtoken': antiForgeryToken
        }

        let json = await fetchData(url, body, headers, loginProgressMessage)

        await loginProgressMessage.edit('Pobieranie danych... 99%')
        return json
    } catch (error) {
        console.log(`!error! baseUrl: ${baseUrl} error: ${error}`)
        loginProgressMessage.channel.stopTyping(true)
        await loginProgressMessage.channel.send(`\`\`\`\n${error}\`\`\``)
        return undefined
    }
}

/**
 * Gets grades from vulcan uonet+
 * @author Mateusz Idziejczak
 * @param {string[]} loginInfoArray Array with all data needed to get any information from vulcan uonet+
 * @param {number} day Day of week
 * @param {Discord.Message} loginProgressMessage Message with progress in percents
 * @returns {Promise<Object|undefined>} Json with information about grades ready to parse
 */
module.exports.getGrades = async ([permissions, cookies, symbol, antiForgeryToken, appGuid, version, baseUrl, rokSzkolny, okresId], day, loginProgressMessage) => {
    try {

        let url = `${baseUrl}/Oceny.mvc/Get`
        const body = {
            'okres': okresId
        }
        const headers = {
            'Cookie': cookies,
            'User-Agent': 'Mozilla/5.0',
            'Content-Type': 'application/json',
            'x-requested-with': 'XMLHttpRequest',
            'x-v-appguid': appGuid,
            'x-v-appversion': version,
            'x-v-requestverificationtoken': antiForgeryToken
        }

        let json = await fetchData(url, body, headers, loginProgressMessage)

        await loginProgressMessage.edit('Pobieranie danych... 99%')
        return json["Oceny"];
    } catch (error) {
        console.log(`!error! baseUrl: ${baseUrl} error: ${error}`)
        loginProgressMessage.channel.stopTyping(true)
        await loginProgressMessage.channel.send(`\`\`\`\n${error}\`\`\``)
        return undefined
    }
}

/**
 * Gets exams from vulcan uonet+
 * @author Mateusz Idziejczak
 * @param {string[]} loginInfoArray Array with all data needed to get any information from vulcan uonet+
 * @param {number} day Day of week
 * @param {Discord.Message} loginProgressMessage Message with progress in percents
 * @returns {Promise<Object|undefined>} Json with information about attendance ready to parse
 */
module.exports.getAttendance = async ([permissions, cookies, symbol, antiForgeryToken, appGuid, version, baseUrl, rokSzkolny, okresId], day, loginProgressMessage) => {
    try {

        let url = `${baseUrl}/FrekwencjaStatystyki.mvc/Get`
        const body = {
            'idPrzedmiot': -1,
        }
        const headers = {
            'Cookie': cookies,
            'User-Agent': 'Mozilla/5.0',
            'Content-Type': 'application/json',
            'x-requested-with': 'XMLHttpRequest',
            'x-v-appguid': appGuid,
            'x-v-appversion': version,
            'x-v-requestverificationtoken': antiForgeryToken
        }

        let json = await fetchData(url, body, headers, loginProgressMessage)

        await loginProgressMessage.edit('Pobieranie danych... 99%')
        return json
    } catch (error) {
        console.log(`!error! baseUrl: ${baseUrl} error: ${error}`)
        loginProgressMessage.channel.stopTyping(true)
        await loginProgressMessage.channel.send(`\`\`\`\n${error}\`\`\``)
        return undefined
    }
}

/**
 * Gets grades statistics from vulcan uonet+
 * @author Mateusz Idziejczak
 * @param {string[]} loginInfoArray Array with all data needed to get any information from vulcan uonet+
 * @param {number} day Day of week
 * @param {Discord.Message} loginProgressMessage Message with progress in percents
 * @returns {Promise<Object|undefined>} Json with information about grades statistics ready to parse
 */
module.exports.getGradesStatistics = async ([permissions, cookies, symbol, antiForgeryToken, appGuid, version, baseUrl, rokSzkolny, okresId], day, loginProgressMessage) => {
    try {
        let url = `${baseUrl}/Statystyki.mvc/GetOcenyCzastkowe`
        const body = {
            'idOkres': okresId
        }
        const headers = {
            'Cookie': cookies,
            'User-Agent': 'Mozilla/5.0',
            'Content-Type': 'application/json',
            'x-requested-with': 'XMLHttpRequest',
            'x-v-appguid': appGuid,
            'x-v-appversion': version,
            'x-v-requestverificationtoken': antiForgeryToken
        }

        let json = await fetchData(url, body, headers, loginProgressMessage)

        await loginProgressMessage.edit('Pobieranie danych... 99%')
        return json
    } catch (error) {
        console.log(`!error! baseUrl: ${baseUrl} error: ${error}`)
        loginProgressMessage.channel.stopTyping(true)
        await loginProgressMessage.channel.send(`\`\`\`\n${error}\`\`\``)
        return undefined
    }
}

/**
 * Fetches data from specified url using given body and headers
 * @author Mateusz Idziejczak
 * @param {string} url Url you want to connect to
 * @param {Object} body Json object body send with the request
 * @param {Object} headers Json object headers send with the request
 * @param {Discord.Message} message Message in which will be the error visible
 * @returns {Promise<Object>} Data from json given by vulcan uonet+
 */
async function fetchData(url, body, headers, message) {
    let json = undefined
    await fetch(url, {
        method: 'post',
        body: JSON.stringify(body),
        headers: headers,
        follow: 0,
        redirect: 'manual'
    })
        .then(res => res.text())
        .then(res => {
            let resJson = JSON.parse(res)
            if (!(resJson["success"])) throw resJson["feedback"]["Message"]
            json = resJson["data"]
        })
        .catch(error => {
            message.channel.stopTyping(true)
            message.edit(error)
            throw error
        })
    return json
}
