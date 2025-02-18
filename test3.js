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



// Memory for messages
let memory = [];
let isActive = true; // bot on/off
let lastMessageTime = 0; // Track last message time for anti-spam

// Random delay to act like human
function getRandomDelay() {
    return Math.floor(Math.random() * (8000 - 3000) + 3000); // Between 3s and 8s
}

// Anti-spam check: Ensures bot doesn't respond too quickly
const minTimeBetweenMessages = 6000; // 6 seconds between messages

// Wait for bot to initialize and then log it
client.on("ready", () => {
    console.log(`\nBot is online as ${client.user.tag}`); //the bot account being used
});


// Function to handle messages
async function handleMessage(message) {
    if (message.author.id === client.user.id) return; // Ignore self messages
    if (Date.now() - lastMessageTime < minTimeBetweenMessages) return; // Prevent spams

    lastMessageTime = Date.now();

    // Add to memory
    if (memory.length === config.memory_limit) memory.shift();
    memory.push({ role: "user", content: `@${message.author.username}: ${message.content}` });

    setTimeout(async () => {
        try{ //handles the error  
            const gptResponse = await openai.chat.completions.create({ //creates the bot
                model: config.model,
                messages: [{ role: "system", content: config.system_text }, ...memory],
                temperature: 0.7,
                max_tokens: config.max_tokens,
            })

            const response = gptResponse.choices[0].text //stores the response function

            console.log("\nGPT-3 Response:", response); // Debugging log use // to block it out once everything works
    
            // Send the response with random delay 
            if (message.channel.type === 'dm') { // if the chat is in dm 
                try {
                    
                    await message.reply(response); // Respond directly in DM
                    
                    console.log("\nReplied in DM:", response); // Debugging log
                } catch (error) {
                    console.error("\nError replying to DM:", error); // Debugging log
                }
            } else {
                try{
                   await message.channel.send(response);
                   console.log("Message channel type:", message.channel.type);
                }
                catch (error){
                    console.error("\nError sending message in text channel:", error);
                }
            }
        } catch(error){
            console.error("\nError with OpenAI API:", error);
        }
        
    }, getRandomDelay());
}





// Command Handling: Wake and Sleep 
const allowedUsers = ["888"]; // Allow specific users to control the bot

client.on("messageCreate", async function (message) {
    // console.log("Message received:", message.content); // Debugging log

    if (!allowedUsers.includes(message.author.id)) return; // Only allow specific users

    const msg = message.content.toLowerCase();

    if (msg.includes("wake up bot")) { // Wake up command ad tweaks to allow it to be able to respond from dms also validate if the account is actually turned off or wontrespond
        isActive = true;
        console.log("Waking up");
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
client.login("8888"); // Use your Discord user token
