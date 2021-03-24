module.exports = {
    name: "reload",
    description: "Ponownie wczytuje wszystkie komendy|komende. Jak nazwa wskazuje, ładuje tylko komendy, które były już załadowane. Aby załadować nowo dodaną komenda, należy wpisać bez argumentów. Wtedy cały folder commands zostanie ponownie załadowany",
    aliases: ['renew', 'f5'],
    usage: ['reload', 'reload help'],
    category: 'develop',
    async execute(client, message, args) {
        const fs = require('fs');

        if ([process.env.OWNER1, process.env.OWNER2].indexOf(message.author.id) !== -1) {

            function reloadCommandByName(commandName) {
                try {
                    delete require.cache[require.resolve(`./${commandName}.js`)];
                    client.commands.delete(commandName);
                    let command = require(`./${commandName}.js`);
                    client.commands.set(commandName, command);
                    console.log(`Successfully reloaded command ${command.name}`);
                } catch (err) {
                    console.error(err);
                }
            }

            let reloadCommand = client.commands.get(args[0])
                    || client.commands.find(cmd => cmd.aliases && cmd.aliases.includes(args[0]));

            if (!(reloadCommand)&&(args[0])) {
                message.channel.send("Nieznana komenda `"+args[0]+"`.\nWpisz `"+ client.config.prefix +"help`, by otrzymać listę komend i przydatne linki");
            } else if(reloadCommand) {
                reloadCommandByName(reloadCommand.name);
                console.log("Ready!")
            } else {
                const files = fs.readdirSync('./commands').filter(file => file.endsWith('.js'));
                files.forEach(file => {
                    reloadCommandByName(file.split('.')[0])
                });
                console.log("Ready!")
            }
        }
    }
}
