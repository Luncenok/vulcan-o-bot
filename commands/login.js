module.exports = {
    name: "login",
    description: "Loguje się do platformy vulcan uonet+ (Ze względów bezpieczeństwa, logować się można tylko w wiadomości **prywatnej** (dm) do mnie)",
    aliases: ['zaloguj', 'loguj'],
    usage: ['login jan.kowalski@gmail.com Qwerty123 warszawa', 'login ||adamnowak69 zaq1@WSX poznan||', '||login marcin.gwozdz@wp.pl 1@qwerty warszawa||'],
    category: 'vulcan',
    async execute(client, message, args) {

        if (message.guild !== null) {
            message.reply("Ze względów bezpieczeństwa, logować się można tylko w wiadomości **prywatnej** (dm) do mnie")
            message.delete()
            return
        }

        const uonet = require('../uonet')
        const Keyv = require("keyv")
        const keyv = new Keyv(process.env.PATH_TO_DATABASE)

        let loginProgressMessage;
        await message.channel.send("Logowanie... 0%").then(lpMessage => {
            loginProgressMessage = lpMessage
        })
        message.channel.startTyping()
        let email = args[0], password = args[1], symbol = args[2], prefix = process.env.PREFIX

        if (email && password && symbol)
            uonet.loginLogOn(message, loginProgressMessage).then(loginInfo => {
                if (loginInfo) {
                    message.channel.stopTyping(true)
                    loginProgressMessage.edit(
                        `Zalogowano! Zapisano id wiadomości z danymi logowania: ${message.id}\n` +
                        `Aby się wylogować - usuń wiadomość lub napisz \`${prefix}wyloguj\`\n` +
                        `Przypominamy: Ze względów bezpieczeństwa nie przechowujemy haseł ani emailów w bazie danych. ` +
                        `Jedyne co przechowujemy to: id twojej wiadomości z danymi, id wybranego ucznia i rok do którego jest przypisany. :slight_smile:`
                    )
                    console.log(`message id: ${message.id}`)
                    keyv.set(message.author.id, message.id)
                }
            })
        else {
            message.channel.stopTyping(true)
            loginProgressMessage.edit(`Nieprawidłowe użycie komendy. Prawidłowe użycie: \`${process.env.PREFIX}${this.usage}\``)
        }
    }
}
