module.exports = {
    name: "help",
    description: "Podaje pomocną dłoń wypełnioną niepotrzebnymi, ale ważnymi informacjami na temat komendy (sam przed chwilą użyłes tej komendy, więc wiesz co ona robi hmm...)",
    aliases: ['/', 'h', 'commands', 'komendy', 'pomoc'], 
    usage: 'help [komenda]',
    category: 'other',
    async execute(client, message, args) {
        const fs = require('fs');
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
            const helpEmbed = (!(helpCommand)) ? {
                color: 0xd6d6d6,
                title: "Pomoc",
                author: {
                    name: "Vulcan'o'bot",
                    icon_url: "https://s1.qwant.com/thumbr/0x380/0/5/5391fa8d72b7814188fd706773e8b335d12cb9505b3774e70eb952cd4a4a79/vector-volcano-eruption-illustration.jpg?u=https%3A%2F%2Fstatic.vecteezy.com%2Fsystem%2Fresources%2Fpreviews%2F000%2F216%2F030%2Foriginal%2Fvector-volcano-eruption-illustration.jpg&q=0&b=1&p=0&a=1"
                },
                description: "Pomoc do bota oraz przydatne linki",
                fields: [
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
                ],
                timestamp: new Date(),
                footer: {
                    text: "Vulcan'o'bot",
                    icon_url: "https://s1.qwant.com/thumbr/0x380/0/5/5391fa8d72b7814188fd706773e8b335d12cb9505b3774e70eb952cd4a4a79/vector-volcano-eruption-illustration.jpg?u=https%3A%2F%2Fstatic.vecteezy.com%2Fsystem%2Fresources%2Fpreviews%2F000%2F216%2F030%2Foriginal%2Fvector-volcano-eruption-illustration.jpg&q=0&b=1&p=0&a=1"
                }
            } : {
                color: 0xd6d6d6,
                title: helpCommand.name,
                author: {
                    name: "Vulcan'o'bot",
                    icon_url: "https://s1.qwant.com/thumbr/0x380/0/5/5391fa8d72b7814188fd706773e8b335d12cb9505b3774e70eb952cd4a4a79/vector-volcano-eruption-illustration.jpg?u=https%3A%2F%2Fstatic.vecteezy.com%2Fsystem%2Fresources%2Fpreviews%2F000%2F216%2F030%2Foriginal%2Fvector-volcano-eruption-illustration.jpg&q=0&b=1&p=0&a=1"
                },
                description: "Jak używać tej komendy?",
                fields: [
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
                ],
                timestamp: new Date(),
                footer: {
                    text: "Vulcan'o'bot",
                    icon_url: "https://s1.qwant.com/thumbr/0x380/0/5/5391fa8d72b7814188fd706773e8b335d12cb9505b3774e70eb952cd4a4a79/vector-volcano-eruption-illustration.jpg?u=https%3A%2F%2Fstatic.vecteezy.com%2Fsystem%2Fresources%2Fpreviews%2F000%2F216%2F030%2Foriginal%2Fvector-volcano-eruption-illustration.jpg&q=0&b=1&p=0&a=1"
                }
            }
            message.channel.send({embed: helpEmbed});
        }
    }
}
