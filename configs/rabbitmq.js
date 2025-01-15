const amqp = require("amqplib/callback_api");
const nodemailer = require("nodemailer");

let channel = null;

const connectRabbitMQ = () => {
  if (process.env.NODE_ENV === "test") return;

  amqp.connect(
    {
      protocol: "amqp",
      hostname: process.env.AMQP_HOST,
      port: process.env.AMQP_PORT,
      username: process.env.AMQP_USER,
      password: process.env.AMQP_PASS,
      vhost: process.env.AMQP_VHOST,
      heartbeat: 10,
    },
    (err, connection) => {
      if (err) {
        console.error("RabbitMQ connection error", err);
        process.exit(1);
      }
      connection.createChannel((err, ch) => {
        if (err) {
          console.error("RabbitMQ channel error", err);
          process.exit(1);
        }
        channel = ch;
        channel.assertQueue("users.send", { durable: true });
        channel.prefetch(1);
        consumeMessages(channel);
      });
    }
  );
};

const consumeMessages = (channel) => {
  channel.consume(
    "users.send",
    async (msg) => {
      if (msg) {
        const emailMessage = JSON.parse(msg.content.toString());

        try {
          await sendEmail(emailMessage);
          channel.ack(msg);
          console.log("Email sent successfully to:", emailMessage.to);
        } catch (err) {
          console.error("Error sending email:", err);
          channel.nack(msg);
        }
      }
    },
    { noAck: false }
  );
};

const sendEmail = async ({ to, subject, text }) => {
  const transporter = nodemailer.createTransport({
    service: "gmail",
    secure: true,
    host: process.env.EMAIL_HOST,
    port: process.env.EMAIL_PORT,
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS,
    },
  });

  const mailOptions = {
    from: process.env.EMAIL_USER,
    to,
    subject,
    text,
  };

  return transporter.sendMail(mailOptions);
};

const sendMessageToQueue = (message) => {
  if (channel && process.env.NODE_ENV !== "test") {
    channel.sendToQueue("users.send", Buffer.from(JSON.stringify(message)), { persistent: true });
    console.log("Sent email message to queue:", message);
  }
};

module.exports = { connectRabbitMQ, sendMessageToQueue };
