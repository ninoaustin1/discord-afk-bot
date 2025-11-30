const { Client, GatewayIntentBits } = require("discord.js");
const { 
    joinVoiceChannel,
    getVoiceConnection 
} = require("@discordjs/voice");

// Create the Discord client with required intents
const client = new Client({
    intents: [
        GatewayIntentBits.Guilds,
        GatewayIntentBits.GuildMessages,
        GatewayIntentBits.MessageContent,
        GatewayIntentBits.GuildVoiceStates
    ]
});

const PREFIX = "a!";

// FIXED READY EVENT
client.once("clientReady", () => {
    console.log(`Logged in as ${client.user.tag}`);
});

client.on("messageCreate", async (message) => {
    if (message.author.bot) return;
    if (!message.content.startsWith(PREFIX)) return;

    const args = message.content.slice(PREFIX.length).trim().split(" ");
    const command = args.shift().toLowerCase();

    // JOIN COMMAND
    if (command === "join") {
        const channelName = args.join(" ");

        if (!channelName)
            return message.reply("❌ Please provide a voice channel name or ID.");

        const channel = message.guild.channels.cache.find(
            c =>
                c.type === 2 &&
                (c.name.toLowerCase() === channelName.toLowerCase() || c.id === channelName)
        );

        if (!channel)
            return message.reply("❌ Voice channel not found.");

        joinVoiceChannel({
            channelId: channel.id,
            guildId: message.guild.id,
            adapterCreator: message.guild.voiceAdapterCreator,
            selfMute: true,
            selfDeaf: false
        });

        return message.reply(`✔️ Joined **${channel.name}**.`);
    }

    // LEAVE COMMAND
    if (command === "leave") {
        const channelName = args.join(" ");

        if (!channelName)
            return message.reply("❌ Provide the name or ID of the channel to leave.");

        const channel = message.guild.channels.cache.find(
            c =>
                c.type === 2 &&
                (c.name.toLowerCase() === channelName.toLowerCase() || c.id === channelName)
        );

        if (!channel)
            return message.reply("❌ Voice channel not found.");

        const connection = getVoiceConnection(message.guild.id);

        if (!connection)
            return message.reply("❌ I'm not connected to any voice channel.");

        if (connection.joinConfig.channelId !== channel.id)
            return message.reply(`❌ I'm not in **${channel.name}**.`);

        connection.destroy();
        return message.reply(`👋 Left **${channel.name}**.`);
    }
});

// Use environment variable for token
client.login(process.env.TOKEN);
