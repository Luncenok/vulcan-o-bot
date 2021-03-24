module.exports = {
    name: "grades",
    description: "Pokazuje podsumowanie ocen z wybranego lub wszystkich przedmiotów",
    aliases: ['oceny', 'ocenki'],
    usage: ['grades', 'grades wszystkie', 'grades matematyka', 'grades język angielski'],
    category: 'vulcan',
    async execute(client, message, args) {
        const uonet = require('../uonet')
        const utils = require('../utils')

        const loginProgressMessage = await message.channel.send("Logowanie... 0%")
        message.channel.startTyping()

        const loginMessage = await utils.getLoginMessageOrUndefined(message.author)
        if (loginMessage) {
            let embedZOcenami, embedBezOcen, embedUkryty, embedCzas
            const day = new Date().getDate()
            await uonet.loginLogOn(loginMessage, loginProgressMessage).then((permsCookieSymbolUrl) => {
                return uonet.getXVHeaders(permsCookieSymbolUrl, loginProgressMessage)
            }).then(loginInfo => {
                return uonet.getGrades(loginInfo, day, loginProgressMessage)
            }).then(json => {
                let nazwaPrzedmiotu = args.join(" ").toLowerCase()
                let wybranyPrzedmiot = ""
                json.forEach((przedmiot) => {
                    if (przedmiot["Przedmiot"].toLowerCase() === nazwaPrzedmiotu) wybranyPrzedmiot = przedmiot
                })
                if (wybranyPrzedmiot === "") {
                    let fields = []
                    let fieldsBez = []
                    let fieldsUkryty = []
                    let fieldsCzas = []
                    json.forEach((przedmiot) => {
                        if (przedmiot["OcenyCzastkowe"].length > 0) {
                            let oceny = []
                            przedmiot["OcenyCzastkowe"].forEach((ocena) => {
                                oceny.push(ocena["Wpis"])
                            })
                            let proczna = (przedmiot["ProponowanaOcenaRoczna"] === "") ? "brak" : przedmiot["ProponowanaOcenaRoczna"]
                            let roczna = (przedmiot["OcenaRoczna"] === "") ? "brak" : przedmiot["OcenaRoczna"]
                            fields.push({
                                name: `${przedmiot["Przedmiot"]} - ${przedmiot["Srednia"]} | ${proczna} | ${roczna}`,
                                value: oceny.join(" | ")
                            })
                            fieldsBez.push({
                                name: `${przedmiot["Przedmiot"]} - ${przedmiot["Srednia"]} | ${proczna} | ${roczna}`,
                                value: "Aby zobaczyć oceny zareaguj :thumbsup:"
                            })
                            fieldsUkryty.push({
                                name: `${przedmiot["Przedmiot"]} - ${przedmiot["Srednia"]} | ${proczna} | ${roczna}`,
                                value: "Ukryto oceny"
                            })
                            fieldsCzas.push({
                                name: `${przedmiot["Przedmiot"]} - ${przedmiot["Srednia"]} | ${proczna} | ${roczna}`,
                                value: "Minął czas na reakcję"
                            })
                        }
                    })
                    if (fields.length <= 0) fields.push({
                        name: `Brak ocen`,
                        value: "Nie znaleziono żadnych ocen"
                    })
                    embedZOcenami = utils.generateEmbed(
                        "Podsumowanie ocen",
                        `Przedmiot - średnia ocen | ocena proponowana | ocena roczna\n[oceny]\nAby wyświetlić szczegóły oceny wpisz: \`${client.config.prefix}${this.name} [przedmiot]\``,
                        fields
                    )
                    embedBezOcen = utils.generateEmbed(
                        "Podsumowanie ocen",
                        `Przedmiot - średnia ocen | ocena proponowana | ocena roczna\n[oceny]\nAby wyświetlić szczegóły oceny wpisz: \`${client.config.prefix}${this.name} [przedmiot]\``,
                        fieldsBez
                    )
                    embedUkryty = utils.generateEmbed(
                        "Podsumowanie ocen",
                        `Przedmiot - średnia ocen | ocena proponowana | ocena roczna\n[oceny]\nAby wyświetlić szczegóły oceny wpisz: \`${client.config.prefix}${this.name} [przedmiot]\``,
                        fieldsUkryty
                    )
                    embedCzas = utils.generateEmbed(
                        "Podsumowanie ocen",
                        `Przedmiot - średnia ocen | ocena proponowana | ocena roczna\n[oceny]\nAby wyświetlić szczegóły oceny wpisz: \`${client.config.prefix}${this.name} [przedmiot]\``,
                        fieldsCzas
                    )
                } else {
                    let fields = []
                    let fieldsBez = []
                    if (wybranyPrzedmiot["OcenyCzastkowe"].length > 0) {
                        wybranyPrzedmiot["OcenyCzastkowe"].forEach((ocena) => {
                            fields.push({
                                name: `Kod: ${ocena["KodKolumny"]} | ${ocena["NazwaKolumny"]} | ${ocena["DataOceny"]}`,
                                value: `Wpis: ${ocena["Wpis"]}\nWaga: ${ocena["Waga"]}\nNauczyciel: ${ocena["Nauczyciel"]}`
                            })
                        })
                    } else fields.push({
                        name: `Brak ocen`,
                        value: "Nie znaleziono żadnych ocen"
                    })
                    fields.push({
                        name: `Średnia: ${wybranyPrzedmiot["Srednia"]}`,
                        value: `Proponowana roczna: ${wybranyPrzedmiot["ProponowanaOcenaRoczna"]}\nOcena roczna: ${wybranyPrzedmiot["OcenaRoczna"]}`
                    })
                    fieldsBez.push({
                        name: `Średnia: ${wybranyPrzedmiot["Srednia"]}`,
                        value: `Proponowana roczna: ${wybranyPrzedmiot["ProponowanaOcenaRoczna"]}\nOcena roczna: ${wybranyPrzedmiot["OcenaRoczna"]}`
                    })
                    embedZOcenami = utils.generateEmbed(
                        `Oceny z ${wybranyPrzedmiot["Przedmiot"]}`,
                        `Sczegółowe dane ocen z przedmiotu: ${wybranyPrzedmiot["Przedmiot"]}`,
                        fields
                    )
                    embedBezOcen = utils.generateEmbed(
                        `Oceny z ${wybranyPrzedmiot["Przedmiot"]}`,
                        `Sczegółowe dane ocen z przedmiotu: ${wybranyPrzedmiot["Przedmiot"]}\nAby zobaczyć oceny zareaguj :thumbsup:`,
                        fieldsBez
                    )
                    embedUkryty = utils.generateEmbed(
                        `Oceny z ${wybranyPrzedmiot["Przedmiot"]}`,
                        `Sczegółowe dane ocen z przedmiotu: ${wybranyPrzedmiot["Przedmiot"]}\nUkryto oceny`,
                        fieldsBez
                    )
                    embedCzas = utils.generateEmbed(
                        `Oceny z ${wybranyPrzedmiot["Przedmiot"]}`,
                        `Sczegółowe dane ocen z przedmiotu: ${wybranyPrzedmiot["Przedmiot"]}\nMinął czas na reakcje`,
                        fieldsBez
                    )
                }
                message.channel.stopTyping()
                if (message.channel.type === 'dm') loginProgressMessage.edit(embedZOcenami)
                else {
                    loginProgressMessage.edit(embedBezOcen)
                    loginProgressMessage.react('👍').then(() => loginProgressMessage.react('👎'));

                    const filter = (reaction, user) => {
                        return ['👍', '👎'].includes(reaction.emoji.name) && user.id === message.author.id;
                    };

                    loginProgressMessage.awaitReactions(filter, {max: 1, time: 60000, errors: ['time']})
                        .then(collected => {
                            const reaction = collected.first();

                            if (reaction.emoji.name === '👍') {
                                loginProgressMessage.edit(embedZOcenami)
                            } else {
                                loginProgressMessage.edit(embedUkryty)
                            }
                        })
                        .catch(collected => {
                            loginProgressMessage.edit(embedCzas)
                        })
                }
            })
        } else {
            message.channel.stopTyping()
            await loginProgressMessage.edit("Aby użyć tej komendy najpierw musisz się zalogować w wiadomości **prywatnej** do mnie. Po więcej informacji użyj komendy `help`")
            await utils.removeFromDatabase(message.author.id)
        }
    }
}
