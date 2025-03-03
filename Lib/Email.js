import { Resend } from "resend";
import env from "dotenv"
env.config()
const resend = new Resend(process.env.RESEND_API_KEY);

export const SendverficationCode = async(userEmail, otp)=>{
try {
  const { data, error } = await resend.emails.send({
    from: "Acme <onboarding@resend.dev>",
    to: [`${userEmail}`],
    subject: "From Blog Website",
    html: `<h1>Verification code</h1> <p><strong>Your verfication code is ${otp} </strong></p>`,
  })
return data
} catch (err) {
  return err
}
  
  // if (error) {
  //   // console.error("Error sending email:", error)
  //   return false
  // } else {
  //   // console.log("Email sent successfully:", data)
  //   return true
  // }
}


