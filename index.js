const {
Client,
GatewayIntentBits,
SlashCommandBuilder,
REST,
Routes,
EmbedBuilder,
PermissionsBitField
} = require("discord.js");

const token = process.env.TOKEN; // SAFE TOKEN
const clientId = "1482627214834008105"; 
const guildId = "1482262162440323143";

const client = new Client({
intents: [
GatewayIntentBits.Guilds,
GatewayIntentBits.GuildMembers,
GatewayIntentBits.GuildMessages
]
});

client.once("ready", () => {
console.log(`✅ Bot online as ${client.user.tag}`);
});


/* ---------- SLASH COMMANDS ---------- */

const commands = [

new SlashCommandBuilder()
.setName("ban")
.setDescription("Ban a user")
.addUserOption(option =>
option.setName("user").setDescription("User to ban").setRequired(true)
),

new SlashCommandBuilder()
.setName("unban")
.setDescription("Unban a user")
.addStringOption(option =>
option.setName("userid").setDescription("User ID").setRequired(true)
),

new SlashCommandBuilder()
.setName("kick")
.setDescription("Kick a user")
.addUserOption(option =>
option.setName("user").setDescription("User to kick").setRequired(true)
),

new SlashCommandBuilder()
.setName("timeout")
.setDescription("Timeout a user (10 minutes)")
.addUserOption(option =>
option.setName("user").setDescription("User to timeout").setRequired(true)
),

new SlashCommandBuilder()
.setName("clear")
.setDescription("Delete messages")
.addIntegerOption(option =>
option.setName("amount").setDescription("Number of messages").setRequired(true)
),

new SlashCommandBuilder()
.setName("embed")
.setDescription("Create an embed")
.addStringOption(option =>
option.setName("text").setDescription("Embed text").setRequired(true)
)

].map(cmd => cmd.toJSON());


const rest = new REST({ version: "10" }).setToken(token);

(async () => {
try {

await rest.put(
Routes.applicationGuildCommands(clientId, guildId),
{ body: commands }
);

console.log("✅ Slash commands registered");

} catch (error) {
console.error(error);
}
})();


/* ---------- WELCOME MESSAGE ---------- */

client.on("guildMemberAdd", member => {

const channel = member.guild.channels.cache.find(c => c.name === "mainchat");
if (!channel) return;

const embed = new EmbedBuilder()
.setTitle("🎉 New Member Joined!")
.setDescription(
`Hey ${member} 👋\n\nWelcome to **${member.guild.name}**!\nMake sure to read the rules and enjoy your stay.`
)
.addFields(
{ name: "User", value: member.user.tag, inline: true },
{ name: "Member Count", value: `${member.guild.memberCount}`, inline: true }
)
.setThumbnail(member.user.displayAvatarURL())
.setColor(Math.floor(Math.random() * 16777215))
.setTimestamp();

channel.send({ embeds: [embed] });

});


/* ---------- COMMAND HANDLER ---------- */

client.on("interactionCreate", async interaction => {

if (!interaction.isChatInputCommand()) return;

try {

/* BAN */

if (interaction.commandName === "ban") {

if (!interaction.member.permissions.has(PermissionsBitField.Flags.BanMembers))
return interaction.reply({ content: "❌ No permission.", ephemeral: true });

const user = interaction.options.getMember("user");

await user.ban();

return interaction.reply(`🔨 ${user.user.tag} was banned.`);
}


/* UNBAN */

if (interaction.commandName === "unban") {

if (!interaction.member.permissions.has(PermissionsBitField.Flags.BanMembers))
return interaction.reply({ content: "❌ No permission.", ephemeral: true });

const userId = interaction.options.getString("userid");

await interaction.guild.members.unban(userId);

return interaction.reply(`✅ User ${userId} was unbanned.`);
}


/* KICK */

if (interaction.commandName === "kick") {

if (!interaction.member.permissions.has(PermissionsBitField.Flags.KickMembers))
return interaction.reply({ content: "❌ No permission.", ephemeral: true });

const user = interaction.options.getMember("user");

await user.kick();

return interaction.reply(`👢 ${user.user.tag} was kicked.`);
}


/* TIMEOUT */

if (interaction.commandName === "timeout") {

const user = interaction.options.getMember("user");

await user.timeout(600000);

return interaction.reply(`⏳ ${user.user.tag} timed out for 10 minutes.`);
}


/* CLEAR */

if (interaction.commandName === "clear") {

const amount = interaction.options.getInteger("amount");

await interaction.channel.bulkDelete(amount, true);

return interaction.reply({
content: `🧹 Deleted ${amount} messages.`,
ephemeral: true
});

}


/* EMBED */

if (interaction.commandName === "embed") {

const text = interaction.options.getString("text");

const embed = new EmbedBuilder()
.setTitle("📢 Server Message")
.setDescription(text)
.setColor("#5865F2");

return interaction.reply({ embeds: [embed] });

}

} catch (error) {

console.error(error);

if (!interaction.replied) {
interaction.reply({ content: "⚠️ Something went wrong.", ephemeral: true });
}

}

});


client.login(token);