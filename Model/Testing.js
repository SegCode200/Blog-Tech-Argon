// import { DateTime } from "luxon";
import argon2 from "argon2";
import crypto from "crypto";
// const newYorkTime = DateTime.now().setZone("Africa/Lagos").toFormat("yyyy-MM-dd HH:mm:ss Z"); 
// const newYorkTime1 = DateTime.now().setZone("Africa/Lagos").toISO(); 
// const utcISOTime = newYorkTime.toISO(); // Convert to UTC
// const Time = new Date(utcISOTime)

// console.log("Current Time in New York:", newYorkTime);
// console.log("Current Time in New York:", newYorkTime1);
// console.log( utcISOTime);
// console.log( Time);

// import crypto from "crypto"

// // Load secret keys from env variables (Ensure these are kept safe)
// const HASH_SECRET = 'GoBoring';
// const ENCRYPTION_KEY = crypto.createHash('sha256').update('travisisStupid').digest('base64').substr(0, 32);
// const IV = Buffer.alloc(16, 0); // Initialization vector (must be 16 bytes)

// function encryptAmount(amount) {
//     const cipher = crypto.createCipheriv('aes-256-cbc', Buffer.from(ENCRYPTION_KEY), IV);
//     let encrypted = cipher.update(JSON.stringify(amount), 'utf8', 'hex');
//     encrypted += cipher.final('hex');
//     return encrypted;
// }

// function decryptAmount(encryptedAmount) {
//     const decipher = crypto.createDecipheriv('aes-256-cbc', Buffer.from(ENCRYPTION_KEY), IV);
//     let decrypted = decipher.update(encryptedAmount, 'hex', 'utf8');
//     decrypted += decipher.final('utf8');
//     return decrypted;
// }

// function generateHash(amount, userId) {
//     const hmac = crypto.createHmac('sha256', HASH_SECRET);
//     hmac.update(`${amount}:${userId}`);
//     return hmac.digest('hex');
// }
// function compareHash(amount, userId, givenHash) {
//   const newHash = generateHash(amount, userId);
//   // console.log(newHash)
//   return newHash === givenHash;
// }
// const givenHash = "41a0f5dcf425843cb8949eec7543cda5c0a61ae0399ba05508921471161922d1"
// console.log(compareHash(20001,"1235", givenHash))
// console.log(generateHash(2000,"1235"))
// console.log(decryptAmount("fd3e368fe2f34a32c013cc69ad4e57e915499c466b5e14e990aa6bf18ff0a4511773abd203d59a3783a9ff0c43c98d5b"))
// module.exports = { encryptAmount, decryptAmount, generateHash };


const SECRET_KEY = "your_super_secret_key"; // Store this securely

async function generateHash(amount, userId) {
    const data = `${amount}:${userId}`;
    
    // Create an HMAC signature to add integrity protection
    const hmac = crypto.createHmac('sha256', SECRET_KEY).update(data).digest('hex');
    
    // Embed the original data inside before hashing
    const encodedData = `${data}|${hmac}`;
    
    // Hash the encoded data
    const hash = await argon2.hash(encodedData);

    return hash; // Return only the hash
}

// Example usage
(async () => {
    const hash = await generateHash(100, "user123");
    console.log("Generated Hash:", hash);
})();

async function compareHash(givenAmount, givenUserId, storedHash) {
    const data = `${givenAmount}:${givenUserId}`;
    
    // Recreate HMAC signature
    const hmac = crypto.createHmac('sha256', SECRET_KEY).update(data).digest('hex');
    
    // Recreate encoded format
    const encodedData = `${data}|${hmac}`;

    try {
        const isValid = await argon2.verify(storedHash, encodedData);
        if (isValid) {
            return { valid: true }; // Successful match
        } else {
            // Hash doesn't match—try to extract the original data
            return extractOriginalData(storedHash);
        }
    } catch (err) {
        return extractOriginalData(storedHash); // Extract data if there's an error
    }
}

// Helper function to extract the original data from the stored hash
function extractOriginalData(storedHash) {
    const regex = /(\d+):([a-zA-Z0-9]+)\|/; // Extract amount & userId format
    const match = storedHash.match(regex);
    
    if (match) {
        return { valid: false, amount: match[1], userId: match[2] };
    }
    
    return { valid: false, error: "Data extraction failed" };
}

// Example usage
(async () => {
    const storedHash = await generateHash(100, "user123");

    console.log(await compareHash(100, "user123", storedHash)); // ✅ { valid: true }
    console.log(await compareHash(200, "user123", storedHash)); // ❌ { valid: false, amount: '100', userId: 'user123' }
})();


// console.log(generateHash(100, "user123"))