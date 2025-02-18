const { Client } = require('discord.js-selfbot-v13');
require("dotenv").config(); // For environment variables

// Create bot instance
const client = new Client();




const responses = [ //responses u can add to this as u want
    "Hello there!",
    "I'm just a simple bot.",
    "How can I help?",
    "Beep boop!",
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
    if (message.author.id === client.user.id) return; // Ignore self messages
    console.log("Received message:", message.content);

    

    if (Date.now() - lastMessageTime < minTimeBetweenMessages) {
        console.log("Ignoring message to prevent spam.");
        return;
    }

    lastMessageTime = Date.now();

    //console.log("Processing message from:", message.author.username);

    // Add message to memory (for debugging)
    

    const botReply = getRandomResponse(); // Use random response 
    setTimeout(() => {
        
        console.log("Bot Reply:", botReply); // Debugging log

        if(message.channel.type === 'dm'){
            try {
                message.channel.send(botReply);
                
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
const allowedUsers = [""]; // Allow specific users to control the bot

client.on("messageCreate", async function (message) {
    //console.log("Message received:", message.content); // Debugging log

    if (!allowedUsers.includes(message.author.id)) return; // Only allow specific users

    const msg = message.content.toLowerCase();

    if(!isActive){ // if u text the bot and get no response, its most likely off and will alert you
        console.log("Bot is asleep issue the Wake up command")
        return; 
    }
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
client.login(""); // Use your Discord user token
