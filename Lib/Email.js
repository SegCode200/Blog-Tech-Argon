import nodemailer from "nodemailer";
import { google } from "googleapis";
import env from "dotenv"
env.config()


const GOOGLE_ID = process.env.GOOGLE_ID
const GOOGLE_SECRET = process.env.GOOGLE_SECRET
const GOOGLE_REFRESHTOKEN = process.env.GOOGLE_REFRESHTOKEN

const GOOGLE_URL = process.env.GOOGLE_URL

const oAuth = new google.auth.OAuth2(GOOGLE_ID, GOOGLE_SECRET, GOOGLE_URL);
oAuth.setCredentials({ access_token: GOOGLE_REFRESHTOKEN });


export const openingMail = async (userEmail,userName, otp) => {
    try {
        const accessToken = await oAuth.getAccessToken();
        if (!accessToken.token) {
            throw new Error("Failed to retrieve access token");
        }

        const transport = nodemailer.createTransport({
            service: "gmail",
            auth: {
                type: "OAuth2",
                user: "geekkube@gmail.com",
                clientId: GOOGLE_ID,
                clientSecret: GOOGLE_SECRET,
                refreshToken: GOOGLE_REFRESHTOKEN,
                accessToken,
            },
        });

        const data = {
            email: userEmail,
            userName: userName
        };
        const verificationLink = `http://localhost:5173/verify/${userEmail}/${otp}`

        const mailer = {
            from: "Verfication 🚀🚀🚀 <geekkube@gmail.com>",
            to: userEmail,
            subject: "Verify Your Email - E-blog",
            html: `<h2>Hello ${userName},</h2>
             <p>Click the link below to verify your email:</p>
             <a href="${verificationLink}">Verify Email</a>
             <p>This link expires in 1 hour.</p>`,
        };

        transport.sendMail(mailer);
    } catch (error) {
        console.log(error);
    }
}