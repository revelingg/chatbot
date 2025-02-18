const { Client } = require('discord.js-selfbot-v13');
const OpenAI = require("openai");
require("dotenv").config(); // For environment variables

// Create bot instance
const client = new Client();

// Initialize OpenAI API
const openai = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY, // Use your OpenAI API key
});

// Config (can be extended or customized per bot)
const config = {
    memory_limit: 5, // Keep a small memory for ChatGPT's conversation context
    model: "gpt-3.5-turbo", // Engine to use
    max_tokens: 100, // Max response length
    system_text: "You are a chat-bot on the social media platform Discord. Give good advice, and have entertaining conversations with people. Be comforting", // you can configure this as you want
};

const responses = [ //responses u can add to this as u want
    "Hello there!",
    "I'm just a simple bot.",
    "How can I help?",
    "Beep boop! 🤖",
];
function getRandomResponse() { // controls the response randomness
    return responses[Math.floor(Math.random() * responses.length)];
}

// Memory for messages
let memory = [];
let isActive = true; // Track if bot should respond
let lastMessageTime = 0; // Track last message time for anti-spam

// Random delay to act like human
function getRandomDelay() {
    return Math.floor(Math.random() * (8000 - 3000) + 3000); // Between 3s and 8s
}

// Anti-spam check: Ensures bot doesn't respond too quickly
const minTimeBetweenMessages = 6000; // 6 seconds between messages

// Wait for bot to initialize and then log it
client.on("ready", () => {
    console.log(`Bot is online as ${client.user.tag}`);
});

// Function to handle messages
async function handleMessage(message) {
    console.log("Received message:", message.content);

    if (message.author.id === client.user.id) return; // Ignore self messages

    if (Date.now() - lastMessageTime < minTimeBetweenMessages) {
        console.log("Ignoring message to prevent spam.");
        return;
    }

    lastMessageTime = Date.now();

    // debug console.log("Processing message from:", message.author.username);

    // Add message to memory (for debugging)
    if (memory.length === config.memory_limit) memory.shift();
    memory.push({ role: "user", content: `@${message.author.username}: ${message.content}` });

    setTimeout(() => {
        const botReply = getRandomResponse(); // Use random response
        console.log("\nBot Reply:", botReply); // Debugging log

        if(message.channel.type === 'dm'){
            try {
                message.reply(botReply);
                
                console.log("Replied successfully.");
            } catch (error) {
                console.error("Error sending message:", error);
            }
        } else{
            try{message.channel.send(botReply); // server

            } catch(error){
                console.error("Error sending message in text channel:", error);
            }
         
        }
    }, getRandomDelay());
}





// Command Handling: Wake and Sleep 
const allowedUsers = ["ff"]; // Allow specific users to control the bot

client.on("messageCreate", async function (message) {
    //console.log("Message received:", message.content); // Debugging log

    if (!allowedUsers.includes(message.author.id)) return; // Only allow specific users

    const msg = message.content.toLowerCase();

    if (msg.includes("wake up bot")) { // Wake up command ad tweaks to allow it to be able to respond from dms also validate if the account is actually turned off or wontrespond
        isActive = true;
        
        console.log("Waking up")
        return message.channel.send("I'm awake! Ready to chat.");
    }

    if (msg.includes("go to sleep bot")) { // Sleep command
        isActive = false;
        
        console.log("Going to sleep")
        return message.channel.send("Goodnight! See you later.");
    }

    if (!isActive) return; // Ignore messages when "asleep"

    // Handle Normal AI Response
    handleMessage(message);
});

// Log in the bot with the user token
client.login("ffv"); // Use your Discord user token
