const Discord = require('discord.js');
require('dotenv').config();

const client = new Discord.Client();
const config = {
  "prefix": process.env.PREFIX,
  "ownerId1": process.env.OWNER1,
  "ownerId2": process.env.OWNER2,
  "pathToDatabase": process.env.PATH_TO_DATABASE
}
client.config = config;

const fs = require('fs');

fs.readdir("./events/", (err, files) => {
  if (err) return console.error(err);
  files.forEach(file => {
    const event = require(`./events/${file}`);
    let eventName = file.split(".")[0];
    client.on(eventName, event.bind(null, client));
  });
});

client.commands = new Discord.Collection();

const files = fs.readdirSync('./commands').filter(file => file.endsWith('.js'));
files.forEach(file => {
  let command = require(`./commands/${file}`);
  if (process.env.NODE_ENV == "development" || command.category == "develop") {
    console.log(`Attempting to load command ${command.name}`);
    client.commands.set(command.name, command);
  }
});

client.login();
