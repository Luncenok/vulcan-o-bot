const Discord = require('discord.js')
const Keyv = require("keyv")
const keyv = new Keyv(process.env.PATH_TO_DATABASE)

/**
 * Splits the message to args array and returns args
 * @param {Discord.Message} message Message you want args from
 * @returns {Promise<string[]>} Ready args in array
 */
module.exports.getArgs = async (message) => {
    let args = message.content.slice(process.env.PREFIX.length).replace(/\|\|/g, "").split(/ +/);
    args.shift()
    return args
}

/**
 * Gets Login message which contain user email, password and symbol
 * @author Mateusz Idziejczak
 * @param {Discord.User} author Author of the login message
 * @returns {Promise<Discord.Message>} Message with email, password and symbol
 */
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
                if (error instanceof Discord.DiscordAPIError)
                    msg = undefined
                else console.log(error)
            })
    return msg
}

/**
 * Removes user from database
 * @param {string} userId Id of user you want to delete from database
 */
module.exports.removeFromDatabase = async (userId) => {
    await keyv.delete(userId)
}

/**
 * Generates embed for Vulcan'o'bot with color, author, timestamp and footer
 *
 * @author Łukasz Szczyt
 * @param {string} title Title of generated embed
 * @param {string} description Description of generated embed
 * @param {Object} fields Fields of generated embed
 * @param {string} fields.name Subtitle of field
 * @param {string} fields.value value of field
 * @todo icon get from assets folder, not from url
 * @returns {Object} Ready to send empty message with embed
 */
module.exports.generateEmbed = (title, description, fields) => {
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
    return {content: "", embed: Embed};
}
