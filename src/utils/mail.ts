import nodemailer from 'nodemailer';
 
 const mail = nodemailer.createTransport({
   host: process.env.MAIL_HOST,
   port: 587,
   secure: false, // Use `true` for port 465, `false` for all other ports
   sender: process.env.MAIL_SENDER,
   auth: {
     user: process.env.MAIL_USER,
     pass: process.env.MAIL_PASS,
   },
 });

const emailVerificationTemplate = (name: string, url: string) => {
  return `<!DOCTYPE html>
<html lang="en" dir="rtl">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>تأكيد البريد الإلكتروني</title>
  <style>
    body {
      font-family: Arial, sans-serif;
      background-color: #ffffff;
      color: #000000;
      margin: 0;
      padding: 0;
      direction: rtl;
    }
    .email-container {
      max-width: 600px;
      margin: 20px auto;
      background-color: #ffffff;
      border: 1px solid #e0e0e0;
      border-radius: 8px;
      overflow: hidden;
      box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
    }
    .email-header {
      background-color: #f5f5f5; /* Light grey */
      color: #000000; /* Black text for good contrast */
      text-align: center;
      padding: 20px;
    }
    .email-header img {
      max-width: 100px;
      margin-bottom: 10px;
    }
    .email-header h1 {
      margin: 0;
      font-size: 24px;
    }
    .email-body {
      padding: 20px;
      text-align: center;
    }
    .email-body p {
      margin: 10px 0;
      font-size: 16px;
      line-height: 1.5;
    }
    .email-button {
      display: inline-block;
      margin-top: 20px;
      padding: 12px 24px;
      background-color: #008000; /* Green */
      color: #ffffff;
      text-decoration: none;
      font-size: 16px;
      font-weight: bold;
      border-radius: 4px;
      transition: background-color 0.3s ease;
    }
    .email-button:hover {
      background-color: #005f00; /* Darker green on hover */
    }
    .email-footer {
      text-align: center;
      padding: 10px;
      font-size: 14px;
      color: #666;
    }
  </style>
</head>
<body>
  <div class="email-container">
    <div class="email-header">
      <img src="https://raw.githubusercontent.com/AzizChatbot/aziz-files/refs/heads/main/AzizLogo.webp" alt="Aziz Logo">
      <h1>تأكيد البريد الإلكتروني</h1>
    </div>
    <div class="email-body">
      <p>مرحباً، ${name}</p>
      <p>شكراً لتسجيلك في عزيز. يرجى النقر على الزر أدناه لتأكيد بريدك الإلكتروني.</p>
      <a href="${url}" class="email-button">تأكيد البريد الإلكتروني</a>
      <p>إذا لم تقم بإنشاء هذا الحساب، يمكنك تجاهل هذه الرسالة بأمان.</p>
    </div>
    <div class="email-footer">
      <p>© 2025 المساعد الذكي عزيز. جميع الحقوق محفوظة.</p>
    </div>
  </div>
</body>
</html>
`
}

const passwordResetTemplate = (name: string, url: string) => {
  return `<!DOCTYPE html>
<html lang="en" dir="rtl">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>إعادة تعيين كلمة المرور</title>
  <style>
    body {
      font-family: Arial, sans-serif;
      background-color: #ffffff;
      color: #000000;
      margin: 0;
      padding: 0;
      direction: rtl;
    }
    .email-container {
      max-width: 600px;
      margin: 20px auto;
      background-color: #ffffff;
      border: 1px solid #e0e0e0;
      border-radius: 8px;
      overflow: hidden;
      box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
    }
    .email-header {
      background-color: #f5f5f5; /* Light grey */
      color: #000000; /* Black text for good contrast */
      text-align: center;
      padding: 20px;
    }
    .email-header img {
      max-width: 100px;
      margin-bottom: 10px;
    }
    .email-header h1 {
      margin: 0;
      font-size: 24px;
    }
    .email-body {
      padding: 20px;
      text-align: center;
    }
    .email-body p {
      margin: 10px 0;
      font-size: 16px;
      line-height: 1.5;
    }
    .email-button {
      display: inline-block;
      margin-top: 20px;
      padding: 12px 24px;
      background-color: #008000; /* Green */
      color: #ffffff;
      text-decoration: none;
      font-size: 16px;
      font-weight: bold;
      border-radius: 4px;
      transition: background-color 0.3s ease;
    }
    .email-button:hover {
      background-color: #005f00; /* Darker green on hover */
    }
    .email-footer {
      text-align: center;
      padding: 10px;
      font-size: 14px;
      color: #666;
    }
  </style>
</head>
<body>
  <div class="email-container">
    <div class="email-header">
      <img src="https://raw.githubusercontent.com/AzizChatbot/aziz-files/refs/heads/main/AzizLogo.webp" alt="Aziz Logo">
      <h1>إعادة تعيين كلمة المرور</h1>
    </div>
    <div class="email-body">
      <p>مرحباً، ${name}</p>
      <p>لقد تلقينا طلبًا لإعادة تعيين كلمة المرور الخاصة بحسابك. يرجى النقر على الزر أدناه لإعادة تعيين كلمة المرور.</p>
      <a href="${url}" class="email-button">إعادة تعيين كلمة المرور</a>
      <p>إذا لم تطلب إعادة تعيين كلمة المرور، يمكنك تجاهل هذه الرسالة بأمان. ستنتهي صلاحية هذا الرابط خلال 24 ساعة.</p>
    </div>
    <div class="email-footer">
      <p>© 2025 المساعد الذكي عزيز. جميع الحقوق محفوظة.</p>
    </div>
  </div>
</body>
</html>
`
}

export { mail, emailVerificationTemplate, passwordResetTemplate };
