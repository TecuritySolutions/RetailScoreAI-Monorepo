import sgMail from '@sendgrid/mail';
import { env } from './env.js';

// Initialize SendGrid with API key
sgMail.setApiKey(env.SENDGRID_API_KEY);

export { sgMail };
