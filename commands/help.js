module.exports = {
    name: "help",
    description: "Podaje pomocną dłoń wypełnioną niepotrzebnymi, ale ważnymi informacjami na temat komendy (sam przed chwilą użyłes tej komendy, więc wiesz co ona robi hmm...)",
    aliases: ['/', 'h', 'commands', 'komendy', 'pomoc'],
    usage: ['help', 'help login', 'help timetable'],
    category: 'other',
    async execute(client, message, args) {
        const utils = require('../utils');
        let commands = client.commands
        let comsOtherNames = []
        let comsVulcanNames = []

        commands.forEach(command => {
            switch (command.category) { // tu kiedyś (hmm) będzie inaczej. Bedzie automatyczny system tworzenia kategorii, że jak stworzysz se nową komdę kategorii "Moderacja", czy coś, to nie będziesz musiał nic w helpie zmieniać
                case "other":
                    comsOtherNames.push(command.name);
                    break;
                case "vulcan":
                    comsVulcanNames.push(command.name);
                    break;
                case "develop":
                    break;
                default:
                    console.log("Unknow command category", command.category, "\n for command:", command);
                    break;
            }
        })

        let helpCommand = client.commands.get(args[0])
                || client.commands.find(cmd => cmd.aliases && cmd.aliases.includes(args[0]));

        if (!(helpCommand)&&(args[0])) {

            await message.channel.send(`Nieznana komenda \`${args[0]}\`.\nWpisz \`${client.config.prefix}help\`, by otrzymać listę komend i przydatne linki`)
        } else {
            const helpEmbed = (!(helpCommand)) ? utils.generateEmbed(
                'Pomoc',
                'Pomoc do bota oraz przydatne linki',
                [
                    {
                        name: "Zaproszenie",
                        value: "https://discord.com/api/oauth2/authorize?client_id=649280115565395998&permissions=388160&scope=bot"
                    }, {
                        name: "Lista komend",
                        value: "***Vulcan:*** " + comsVulcanNames.join(", ") + "\n***Inne:*** " + comsOtherNames.join(", ") + "\nAby uzyskać więcej informacji o komendzie wpisz: `"+client.config.prefix+"help [komenda]`",
                        inline: false
                    }, {
                        name: "Kontakt",
                        value: "Luncenok <@"+process.env.OWNER1+">\nKasza <@"+process.env.OWNER2+'>'
                    }
                ]
            ) : utils.generateEmbed(
                helpCommand.name,
                "Jak używać tej komendy?",
                [
                    {
                        name: "Użycie",
                        value: '`' + client.config.prefix + helpCommand.usage.join('`\n`' + client.config.prefix) + '`'
                    }, {
                        name: 'Co robi ta komenda?',
                        value: helpCommand.description || "(brak opisu)"
                    }, {
                        name: 'Aliasy',
                        value: helpCommand.aliases.join(", ")
                    }
                ]
            )

            await message.channel.send(helpEmbed);
        }
    }
}
