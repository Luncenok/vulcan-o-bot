module.exports = {
    name: "reload",
    description: "Ponownie wczytuje wszystkie komendy|komende",
    aliases: ['renew', 'f5'],
    usage: 'reload [komenda]',
    category: 'dev',
    async execute(client, message, args) {
        const fs = require('fs');
        
        function reloadCommandByName(commandName) {
            delete require.cache[require.resolve(`./${commandName}.js`)];
            client.commands.delete(commandName);
            let command = require(`./${commandName}.js`);
            console.log(`Attempting to reload command ${command.name}`);
            client.commands.set(commandName, command);
        }

        let reloadCommand = client.commands.get(args[0])
                || client.commands.find(cmd => cmd.aliases && cmd.aliases.includes(args[0]));
        
        if (!(reloadCommand)&&(args[0])) {
            message.channel.send("Nieznana komenda `"+args[0]+"`.\nWpisz `"+ client.config.prefix +"help`, by otrzymać listę komend i przydatne linki");
        } else if(reloadCommand) {
            reloadCommandByName(reloadCommand.name);
        } else {
            const files = fs.readdirSync('./commands').filter(file => file.endsWith('.js'));
            files.forEach(file => {
                reloadCommandByName(file.split('.')[0])
            });
        }
        console.log("Ready!")
    }
}
