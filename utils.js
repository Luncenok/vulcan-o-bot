module.exports.getArgs = async (message) => {
    let args = message.content.slice(process.env.PREFIX.length).split(/ +/);
    args.shift()
    return args
}
