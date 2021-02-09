module.exports.getArgs = async (message) => {
    let args = message.content.slice(process.env.PREFIX.length).split(/ +/);
    args.shift()
    return args
}

module.exports.getLoginMessageOrUndefined = async (author) => {
    const Keyv = require("keyv")
    const keyv = new Keyv(process.env.PATH_TO_DATABASE)

    let messageId = ""
    messageId = await keyv.get(author.id)
    let msgContent
    await author.createDM()
        .then(channel => channel.messages)
        .then(messages => messages.fetch(messageId))
        .then(msg => {
            msgContent = msg.content
        })
    return msgContent
}
