import { Injectable, Logger } from '@nestjs/common';
import { CreateMailDto } from './dto/create-mail.dto';
import { MailerService } from '@nestjs-modules/mailer';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class MailService {
  private readonly logger = new Logger(MailService.name);
  constructor(
    private readonly mailerService: MailerService,
    private readonly configService: ConfigService,
  ) {}

  /**
   * Sends a test/hello email to verify email configuration.
   *
   * This method performs the following operations:
   * 1. Sends test email using MailerService
   * 2. Uses hardcoded recipient and test data
   * 3. Uses 'register' email template
   * 4. Logs successful email sending
   * 5. Returns success message
   *
   * @returns {Object} Success message object:
   *   - message: Confirmation string
   *
   * @throws {Error} If email sending fails
   *
   * @remarks
   * - Test function for email configuration verification
   * - Uses hardcoded recipient: maiphuongbrt9a1@gmail.com
   * - Uses hardcoded test activation code: 123456789
   * - Used during development/testing only
   * - Errors are caught but not thrown to caller
   */
  sendHelloMail() {
    try {
      this.mailerService
        .sendMail({
          to: 'maiphuongbrt9a1@gmail.com', // list of receivers
          subject: 'Testing Nest MailerModule ✔', // Subject line
          text: 'welcome', // plaintext body
          template: 'register',
          context: {
            name: 'Mai Phuong - Hardcode name to test',
            activationCode: 123456789,
          },
        })
        .then(() => {})
        .catch(() => {});

      this.logger.log('Hello email sent successfully');
      return {
        message: 'Hello world. This is hello email from ecommerce shop!',
      };
    } catch (error) {
      this.logger.error('Failed to send hello email: ', error);
      throw new Error('Failed to send hello email');
    }
  }

  /**
   * Sends an email with custom recipient and content.
   *
   * This method performs the following operations:
   * 1. Retrieves sender email from config or uses provided value
   * 2. Sends email using MailerService with template
   * 3. Uses 'register' template with name and activation code
   * 4. Logs successful email sending
   * 5. Returns success message
   *
   * @param {CreateMailDto} createMailDto - The email data containing:
   *   - to_email (recipient email address)
   *   - from_email (optional sender email, defaults to MAIL_FROM config)
   *   - subject (email subject line)
   *   - text (plain text body)
   *   - name (recipient name for template)
   *   - activationCode (code for template)
   *
   * @returns {Object} Success message object:
   *   - message: Confirmation string
   *
   * @throws {Error} If email sending fails
   *
   * @remarks
   * - Uses 'register' email template
   * - Sender email defaults to MAIL_FROM environment variable
   * - Used for account activation, password reset emails
   * - Template context includes name and activationCode
   * - Errors are logged with recipient email for debugging
   */
  create(createMailDto: CreateMailDto) {
    try {
      this.mailerService
        .sendMail({
          to: createMailDto.to_email, // list of receivers
          from:
            createMailDto.from_email ??
            this.configService.get<string>('MAIL_FROM'),
          subject: createMailDto.subject, // Subject line
          text: createMailDto.text, // plaintext body
          template: 'register',
          context: {
            name: createMailDto.name,
            activationCode: createMailDto.activationCode,
          },
        })
        .then(() => {
          return 'Send email from ecommerce shop successfully!';
        })
        .catch(() => {
          throw new Error('Send email failed!');
        });
      this.logger.log('Email sent successfully to ' + createMailDto.to_email);
      return {
        message: 'Send email from ecommerce shop successfully!',
      };
    } catch (error) {
      this.logger.error(
        'Failed to send email to ' + createMailDto.to_email + ': ',
        error,
      );
      throw new Error('Failed to send email');
    }
  }
}
