/* HELP Z PRZYJAIELA
module.exports = {
    name: "help",
    description: "Pokazuje tę wiadomość",
    aliases: ['pomoc', '?', 'commands'],
    usage: 'help [komenda]',
    category: 'other',
    execute(client, message, args) {
        const fs = require('fs')
        let komenda, listaKomend = []
        fs.readdir("./commands", (err, files) => {
            if (err) return console.error(err);
            files.forEach(file => {
                if (!file.endsWith(".js")) return;
                let commandName = file.split(".")[0];
                let command = client.commands.get(commandName)
                    || client.commands.find(cmd => cmd.aliases && cmd.aliases.includes(commandName));
                listaKomend.push(command)
                if (command.name === args[0]) {
                    komenda = command
                }
                command.aliases.forEach(function (item) {
                    if (item === args[0]) {
                        komenda = command
                    }
                })
            });
            let komendyVulcan = [], komendyZabawa = [], komendyInne = []
            listaKomend.forEach(function (item) {
                if (item.category === 'vulcan') komendyVulcan.push(item.name)
                else if (item.category === 'fun') komendyZabawa.push(item.name)
                else if (item.category === 'other') komendyInne.push(item.name)
            })

            const exampleEmbed = (args.length<1) ? {
                color: 0x28166f,
                title: 'Pomoc',
                author: {
                    name: 'Przyjaciel z ZSK',
                    icon_url: 'https://www.zsk.poznan.pl/wp-content/uploads/2019/05/cropped-m_logo-192x192.png',
                },
                description: 'Poniżej znajdują się przydatne linki oraz komendy do bota',
                fields: [
                    {
                        name: 'Zaproszenie',
                        value: 'https://discord.com/api/oauth2/authorize?client_id=651399623646380062&permissions=8&scope=bot',
                    },
                    {
                        name: 'Lista dostępnych komend',
                        value: "***Vulcan:*** " + komendyVulcan.join(", ") + "\n***Zabawne:*** " + komendyZabawa.join(", ") + "\n***Inne:*** " + komendyInne.join(", ") + "\nAby uzyskać więcej informacji o komendzie wpisz: `" + client.config.prefix + "help [komenda]`",
                        inline: false,
                    },
                    {
                        name: 'Pomoc',
                        value: 'Coś nie działa w bocie i nie wiesz jak sobie z tym poradzić? Dołącz do serwera poniżej aby skontaktować się z developerem bota',
                        inline: false,
                    },
                    {
                        name: 'Oficjalny serwer',
                        value: 'No tutaj ogólnie kiedyś będzie linczek do sewera',
                        inline: false,
                    },
                ],
                timestamp: new Date(),
                footer: {
                    text: 'Przyjaciel z ZSK',
                    icon_url: 'https://www.zsk.poznan.pl/wp-content/uploads/2019/05/cropped-m_logo-192x192.png',
                },
            } : {
                color: 0x28166f,
                title: komenda.name,
                author: {
                    name: 'Przyjaciel z ZSK',
                    icon_url: 'https://www.zsk.poznan.pl/wp-content/uploads/2019/05/cropped-m_logo-192x192.png',
                },
                description: 'Jak używać tej komendy?',
                fields: [
                    {
                        name: 'Użycie',
                        value: "`" + client.config.prefix + komenda.usage + "`",
                    },
                    {
                        name: 'Co robi ta komenda?',
                        value: komenda.description || "(brak opisu)"
                    },
                    {
                        name: 'Aliasy',
                        value: komenda.aliases.toString()
                    }
                ],
            }
            message.channel.send({embed: exampleEmbed});
        });
    }
}
*/


module.exports = {
    name: "help",
    description: "Podaje pomocną dłoń wypełnioną niepotrzebnymi, ale ważnymi informacjami na temat komendy (sam użyłes tej komendy przed chwilą, więc wiesz co ona robi tho...)",
    aliases: ['/', 'h', 'commands', 'komendy', 'pomoc'], // zdecydowałem, by użyć aliasu '/', bo wiadomość typu '??' może się często pojawiać bez chęci, by otrzymać helpa
    usage: 'help [komenda]',
    category: 'other',
    async execute(client, message) {
        const fs = require('fs');
        const files = fs.readdirSync('./commands').filter(file => file.endsWith('.js'));
        let commands = [];
        files.forEach(file => {
            comName = file.split(".")[0];
            let command = client.commands.get(comName)
                || client.commands.find(cmd => cmd.aliases && cmd.aliases.includes(comName));
            commands.push(command);
        })
        // console.log(commands);
        let comsOtherNames = []
        let comsVulcanNames = []
        commands.forEach(command => {
            switch(command.category) {
                case "other":
                    comsOtherNames.push(command.name);
                    break;
                case "vulcan":
                    comsVulcanNames.push(command.name);
                    break;
                default:
                    console.log("Unknow command", command.name, '\n', command);
                    break;
            }
        })

        if (!(message.content.split(' ')[1])) {
            console.log("pomoc do bota");
        }
        else {
            console.log("pomoc do komendy", message.content.split(' ')[1]);
        }

        const helpEmbed = (!(message.content.split(' ')[1])) ? {} : {}
    }
}