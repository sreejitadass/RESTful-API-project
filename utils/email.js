const nodemailer = require('nodemailer');
const pug = require('pug');

module.exports = class Email {
    constructor(user, url) {
        this.to = user.email;
        this.from = 'Sreejita Das <sreejita.das1609@gmail.com>';
        this.firstName = user.name.split(' ')[0];
        this.url = url;
    }

    newTransport() {
        return nodemailer.createTransport({
            host: process.env.EMAIL_HOST,
            port: process.env.EMAIL_PORT,
            auth:{
                user: process.env.EMAIL_USER,
                pass: process.env.EMAIL_PASS
            }
        });
    }

    async sendEmail(template, subject) {

        //1.render pug template and create html from pug
        const html = pug.renderFile(`${__dirname}/../views/emails/${template}.pug`,{
            firstName: this.firstName,
            url: this.url,
            subject
        });

        //2.specify mail options
        const mailOptions = {
            from: this.from,
            to: this.to,
            subject,
            html
        };

        //3.call the function to finally send the email
        await this.newTransport().sendMail(mailOptions);
    }
    
    async sendWelcome() {
        await this.sendEmail('welcome', 'Welcome to Natours!');
    }

    async sendPasswordReset() {
        await this.sendEmail('passwordReset', 'Reset your password');
    }
};