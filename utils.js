const discord = require('discord.js')
const Keyv = require("keyv")
const keyv = new Keyv(process.env.PATH_TO_DATABASE)

module.exports.getArgs = async (message) => {
    let args = message.content.slice(process.env.PREFIX.length).split(/ +/);
    args.shift()
    return args
}

module.exports.getLoginMessageOrUndefined = async (author) => {
    let messageId = ""
    messageId = await keyv.get(author.id)
    let msg
    if (messageId)
        await author.createDM()
            .then(channel => channel.messages)
            .then(messages => messages.fetch(messageId))
            .then(message => {
                msg = message
            })
            .catch(error => {
                if (error instanceof discord.DiscordAPIError)
                    msg = undefined
                else console.log(error)
            })
    return msg
}

module.exports.removeFromDatabase = async (userId) => {
    await keyv.delete(userId)
}
