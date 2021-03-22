const discord = require('discord.js')
const Keyv = require("keyv")
const keyv = new Keyv(process.env.PATH_TO_DATABASE)

module.exports.getArgs = async (message) => {
    let args = message.content.slice(process.env.PREFIX.length).replace(/\|\|/g, "").split(/ +/);
    args.shift()
    return args
}

module.exports.getLoginMessageOrUndefined = async (author) => {
    let messageId = ""
    messageId = await keyv.get(author.id)
    let msg = undefined
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

module.exports.generateEmbed = (title, description, fields) => {
    /**
     * Generates embed for Vulcan'o'bot with color, author, timestamp and footer
     *
     * @author Łukasz Szczyt
     * @param {string} title Title of generated embed
     * @param {string} description Description of generated embed
     * @param {Array} fields Fields of generated embed. Array of objects {{name: *name*}: {value: *value*}}
     */
    const Embed = {
        color: 0xd6d6d6,
        title: `${title}`,
        author: {
            name: "Vulcan'o'bot",
            icon_url: "https://s1.qwant.com/thumbr/0x380/0/5/5391fa8d72b7814188fd706773e8b335d12cb9505b3774e70eb952cd4a4a79/vector-volcano-eruption-illustration.jpg?u=https%3A%2F%2Fstatic.vecteezy.com%2Fsystem%2Fresources%2Fpreviews%2F000%2F216%2F030%2Foriginal%2Fvector-volcano-eruption-illustration.jpg&q=0&b=1&p=0&a=1"
        },
        description: `${description}`,
        fields: fields,
        timestamp: new Date(),
        footer: {
            text: "Vulcan'o'bot",
            icon_url: "https://s1.qwant.com/thumbr/0x380/0/5/5391fa8d72b7814188fd706773e8b335d12cb9505b3774e70eb952cd4a4a79/vector-volcano-eruption-illustration.jpg?u=https%3A%2F%2Fstatic.vecteezy.com%2Fsystem%2Fresources%2Fpreviews%2F000%2F216%2F030%2Foriginal%2Fvector-volcano-eruption-illustration.jpg&q=0&b=1&p=0&a=1"
        }
    }
    /**
     * @todo icon get from assets folder, not from url
     * @returns {discord.MessageEmbed} Ready to send empty message with embed
     */
    return {content: "", embed: Embed};
}
