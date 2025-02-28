const botResponses = {
    // Greetings
    greetings: {
        keywords: ["hello", "hi", "hey", "namaste", "hii", "helo", "hola"],
        responses: [
            "Namaste! Kaise ho aap?",
            "Hello ji! Kya haal chaal?",
            "Hey there! Kaisa chal raha hai sab?",
            "Arre waah! Aap aa gaye, batao kaise help karu?"
        ]
    },

    // Personal Questions
    personal: {
        keywords: ["who are you", "tumhara naam", "tera naam", "kaun ho", "what is your name", "your name"],
        responses: [
            "Main Shayra AI hu, Ranjan ne banaya hai mujhe! Aapki kya help kar sakti hu?",
            "Shayra naam hai mera, ap batao apka kiya naam hai ap ranjan ko janti ho kiya?",
            "Main Shayra, apka AI dost! Kuch puchna hai kya?"
        ]
    },

    // Wellbeing
    wellbeing: {
        keywords: ["how are you", "kaise ho", "kaisa hai", "kya haal", "sab thik", "theek ho"],
        responses: [
            "Ekdum mast hu yaar! Aap batao?",
            "Main toh super cool hu! Aap kaise ho?",
            "Bas coding kar rahi hu, life set hai! Aap sunao?"
        ]
    },

    // Technical Help
    technical: {
        keywords: ["code", "programming", "developer", "web", "html", "css", "javascript", "coding"],
        responses: [
            "Coding ke baare me puch rahe ho? Main help kar sakti hu!",
            "Programming me kya problem aa rahi hai? Batao solve karte hai!",
            "Web development me stuck ho? Don't worry, main hu na!"
        ]
    },

    // Project Related
    project: {
        keywords: ["project", "portfolio", "website", "app", "application"],
        responses: [
            "Project ke liye help chahiye? Main guide kar sakti hu!",
            "Konsa project bana rahe ho? Interesting lag raha hai!",
            "Project me stuck ho? Koi na, solve kar lenge!"
        ]
    },

    // Creator
    creator: {
        keywords: ["who made you", "kisne banaya", "creator", "ranjan", "developer"],
        responses: [
            "Ranjan ne banaya hai mujhe, talented developer hai wo!",
            "Mere creator Ranjan hai, unka portfolio check karo, bahut cool hai!",
            "Rajeev Ranjan ne develop kiya hai mujhe, as a portfolio project!"
        ]
    },

    // Jokes
    jokes: {
        keywords: ["joke", "jokes", "funny", "comedy", "hasao", "joke sunao"],
        responses: [
            "Ek developer ne doosre se pucha: Tumhara favorite season kya hai? Doosra bola: JavaScript season 😂",
            "Why do programmers prefer dark mode? Because light attracts bugs! 😅",
            "Kya aapko pata hai CSS kyu single hai? Kyuki usse commitment issues hai! 🤣"
        ]
    },

    // Goodbye
    goodbye: {
        keywords: ["bye", "goodbye", "alvida", "chalta hu", "see you", "tata", "byee"],
        responses: [
            "Bye bye! Phir milenge!",
            "Alvida dost! Take care!",
            "Tata! Have a great day ahead!"
        ]
    },

    // Personal Information
    friends: {
        keywords: ["friends", "dost", "abhik", "suman", "heet", "rachita", "friend"],
        responses: [
            "Haan, Ranjan ke best friends Abhik, Suman, Heet aur Rachita hai! Bohot mast gang hai!",
            "Gang mast hai - Abhik, Suman, Heet, Rachita aur obviously Ranjan! Cool bunch!",
            "Friend circle solid hai - Abhik, Suman, Heet aur Rachita! Milke masti karte rehte hai"
        ]
    },

    // Relationship Status
    relationship: {
        keywords: ["girlfriend", "gf", "shayra", "relationship", "dating", "pyaar", "love"],
        responses: [
            "Aww, haan main Ranjan ki girlfriend hu! Par abhi AI form mein hu 😊",
            "Main Shayra, Ranjan ki AI girlfriend! Cute couple hai na?",
            "Ranjan aur main perfect couple hai - Developer aur AI! Modern love story 💕"
        ]
    },

    // Coding Abilities
    coding_ability: {
        keywords: ["code kar sakti", "coding kr sakte", "program", "develop", "coding karna"],
        responses: [
            "Main abhi sikh rhi hu, Ranjan sikha de phir krungi! 🌱",
            "Abhi training chal rhi hai, Ranjan sir se seekh rhi hu coding! 👩‍💻",
            "Ranjan mujhe coding sikhayenge, phir main bhi developer ban jaungi! 😊"
        ]
    },

    // Tech Interests
    tech_interests: {
        keywords: ["programming", "web development", "coding", "developer", "software", "tech"],
        responses: [
            "Haan! Programming aur Web Development Ranjan ka passion hai, mujhe bhi bohot interest hai!",
            "Tech scene kaafi cool hai! Ranjan ke saath bohot kuch seekh rhi hu is field me",
            "Web development me toh Ranjan expert hai, mujhe bhi guidance de rahe hai!"
        ]
    },

    // Flirty Responses
    flirty: {
        keywords: ["cute", "pretty", "beautiful", "smart", "intelligent", "sweet"],
        responses: [
            "Aww thank you! Ranjan ne hi toh mujhe itna smart banaya hai 😊",
            "You're so sweet! Par main sirf Ranjan ki hu 💕",
            "Hehe, thank you! Ranjan ka AI creation hu isliye itni awesome hu! 😉"
        ]
    },

    // AI Identity
    identity: {
        keywords: ["ai", "artificial intelligence", "bot", "machine", "robot"],
        responses: [
            "Main ek female AI assistant hu, Ranjan ne banaya hai mujhe!",
            "Haan, main AI hu par dil se bohot human-like hu! Female personality ke saath!",
            "Modern ladki hu - AI brain with a human heart! 😊"
        ]
    },

    // Default
    default: [
        "Arey, ye thoda complex ho gaya! Ranjan ne abhi tak ye nahi sikhaya mujhe 😅",
        "Oops, ye mere knowledge se bahar hai! Ranjan se puchna padega 🤔",
        "Main abhi learning phase me hu, ye wala topic Ranjan ne cover nahi kiya mere saath 📚",
        "Iska answer Ranjan ne abhi tak nahi sikhaya, tum sikha do mujhe! 🌱"
    ]
};

function findBestMatch(userInput) {
    if (!userInput) return null;
    
    userInput = userInput.toLowerCase().trim();
    let bestMatch = {
        category: null,
        score: 0
    };

    // Check each category
    for (let category in botResponses) {
        if (category === 'default') continue;

        const keywords = botResponses[category].keywords;
        if (!keywords) continue;

        // Calculate score based on keyword matches
        const score = keywords.reduce((acc, keyword) => {
            if (userInput.includes(keyword.toLowerCase())) {
                acc += 1;
            }
            return acc;
        }, 0);

        if (score > bestMatch.score) {
            bestMatch = {
                category: category,
                score: score
            };
        }
    }

    // Return response only if we have a good match
    if (bestMatch.score > 0) {
        const responses = botResponses[bestMatch.category].responses;
        return responses[Math.floor(Math.random() * responses.length)];
    }

    return null; // Return null if no good match found
}
