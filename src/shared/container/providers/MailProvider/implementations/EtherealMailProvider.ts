import nodemailer, { Transporter } from 'nodemailer';
import { inject, injectable } from 'tsyringe';

import mailConfig from '@config/mail';
import IMailTemplateProvider from '../../MailTemplateProvider/models/IMailTemplateProvider';
import ISendMailDTO from '../dtos/ISendMailDTO';
import IMailProvider from '../models/IMailProvider';

@injectable()
export default class EtherealMailProvider implements IMailProvider {
  private client: Transporter

  constructor(
    @inject('MailTemplateProvider')
    private mailTemplateProvider: IMailTemplateProvider,
  ) {
    nodemailer.createTestAccount().then((account) => {
      const transporter = nodemailer.createTransport({
        host: account.smtp.host,
        port: account.smtp.port,
        secure: account.smtp.secure,
        auth: {
          user: account.user,
          pass: account.pass,
        },
      });

      this.client = transporter;
    });
  }

  public async sendMail({
    from, to, subject, templateData,
  }: ISendMailDTO): Promise<void> {
    const { name, email } = mailConfig.defaults.from;

    const html = await this.mailTemplateProvider.parse(templateData);

    const message = await this.client.sendMail({
      from: {
        name: from?.name || name,
        address: from?.email || email,
      },
      to: {
        name: to.name,
        address: to.email,
      },
      subject,
      html,
    });

    console.log('Message sent: %s', message.messageId);
    console.log('Preview URL: %s', nodemailer.getTestMessageUrl(message));
  }
}
