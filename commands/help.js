module.exports = {
    name: "help",
    description: "Podaje pomocną dłoń wypełnioną niepotrzebnymi, ale ważnymi informacjami na temat komendy (sam przed chwilą użyłes tej komendy, więc wiesz co ona robi hmm...)",
    aliases: ['/', 'h', 'commands', 'komendy', 'pomoc'], 
    usage: 'help [komenda]',
    category: 'other',
    async execute(client, message, args) {
        const fs = require('fs');
        const utils = require('../utils');
        const files = fs.readdirSync('./commands').filter(file => file.endsWith('.js'));
        let commands = [];
        files.forEach(file => {
            comName = file.split(".")[0];
            let command = client.commands.get(comName)
                || client.commands.find(cmd => cmd.aliases && cmd.aliases.includes(comName));
            commands.push(command);
        })
        let comsOtherNames = []
        let comsVulcanNames = []
        commands.forEach(command => {
            switch(command.category) { // tu kiedyś (hmm) będzie inaczej. Bedzie automatyczny system tworzenia kategorii, że jak stworzysz se nową komdę kategorii "Moderacja", czy coś, to nie będziesz musiał nic w helpie zmieniać
                case "other":
                    comsOtherNames.push(command.name);
                    break;
                case "vulcan":
                    comsVulcanNames.push(command.name);
                    break;
                default:
                    console.log("Unknow command category", command.category, "\n for command:", command);
                    break;
            }
        })
        
        let helpCommand = client.commands.get(args[0])
                || client.commands.find(cmd => cmd.aliases && cmd.aliases.includes(args[0]));

        if (!(helpCommand)&&(args[0])) {
            message.channel.send("Nieznana komenda `"+args[0]+"`.\nWpisz `"+ client.config.prefix +"help`, by otrzymać listę komend i przydatne linki")
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
                        value: "`" + client.config.prefix + helpCommand.usage + "`",
                    }, {
                        name: 'Co robi ta komenda?',
                        value: helpCommand.description || "(brak opisu)"
                    }, {
                        name: 'Aliasy',
                        value: helpCommand.aliases.join(", ")
                    }
                ]
            )
            message.channel.send({embed: helpEmbed});
        }
    }
}
