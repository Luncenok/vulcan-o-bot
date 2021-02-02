module.exports = (client) => {
    console.log(`Ready to serve in ${client.channels.size} channels on ${client.guilds.size} servers, for a total of ${client.users.size} users.`);
    //set custom status
    client.user.setPresence({
        status: "online",
        game: {
            name: "work in progress",
            type: "WATCHING" //PLAYING or WATCHING or LISTENING or STREAMING
        }
    });
}
