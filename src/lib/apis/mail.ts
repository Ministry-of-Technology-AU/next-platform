import nodemailer from 'nodemailer';

interface MailParams {
    from?: string;
    alias?: string;
    to: string | string[];
    subject: string;
    text?: string;
    html?: string;
    cc?: string | string[];
    bcc?: string | string[];
    attachments?: Array<{
        filename: string;
        content: Buffer | string;
        contentType?: string;
    }>;
}

export async function sendMailSG(params: MailParams): Promise<void> {
    try {
        
        const transporter = nodemailer.createTransport({
            service: process.env.MAIL_SERVICE || 'gmail',
            secure: true,
            auth: {
                user: process.env.SGMAIL_ID,
                pass: process.env.SGMAIL_PWD,
            },
        });

        const senderEmail = params.from ? params.from : process.env.SGMAIL_ID;

        // If an alias is provided, format the From header as: Alias <email@domain>
        const fromHeader = params.alias ? `${params.alias} <${senderEmail}>` : `${senderEmail}`;
        
        const mailOptions = {
            from: fromHeader,
            to: params.to,
            subject: params.subject,
            text: params.text,
            html: params.html,
            cc: params.cc,
            bcc: params.bcc,
            attachments: params.attachments,
        };

        await transporter.sendMail(mailOptions);
    } catch (error) {
        throw new Error(`Failed to send email: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
}

export async function sendMail(params: MailParams): Promise<void> {
    try {
        
        const transporter = nodemailer.createTransport({
            service: process.env.MAIL_SERVICE || 'gmail',
            secure: true,
            auth: {
                user: process.env.TECHMAIL_ID,
                pass: process.env.TECHMAIL_PWD,
            },
        });

        const senderEmail = params.from ? params.from : process.env.TECHMAIL_ID;

        // If an alias is provided, format the From header as: Alias <email@domain>
        const fromHeader = params.alias ? `${params.alias} <${senderEmail}>` : `${senderEmail}`;
        
        const mailOptions = {
            from: fromHeader,
            to: params.to,
            subject: params.subject,
            text: params.text,
            html: params.html,
            cc: params.cc,
            bcc: params.bcc,
            attachments: params.attachments,
        };

        await transporter.sendMail(mailOptions);
    } catch (error) {
        throw new Error(`Failed to send email: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
}