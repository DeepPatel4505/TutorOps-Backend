import transporter from './email.transport.js';

export const sendVerificationEmail = async ({email , otp}) => { 
    const mailOptions = {
        from: `"TutorOps" <${process.env.MAIL_FROM}>`,
        to: email,
        subject: 'Your TutorOps verification code',
        html: `
            <h2>Email Verification</h2>
            <p>Your verification code is:</p>
            <h1 style="letter-spacing:4px">${otp}</h1>
            <p>This code expires in 10 minutes.</p>
        `,
    };

    try {
        const info = await transporter.sendMail(mailOptions);
        console.log('Verification email sent:', info.messageId);
    } catch (error) {
        console.error('Error sending verification email:', error);
        throw new Error('Could not send verification email');
    }
}