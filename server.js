
const express = require('express');
const app = express();
app.use(express.json());
app.use(express.static('.'));

const otpStore = {};

app.post('/request-otp', (req, res) => {
  const { phone } = req.body;
  const otp = Math.floor(100000 + Math.random() * 900000).toString();
  otpStore[phone] = { otp, expires: Date.now() + 5 * 60000 };
  console.log(`OTP for ${phone}: ${otp}`);
  res.json({ message: 'OTP generated. Check admin panel to send manually.' });
});

app.post('/verify-otp', (req, res) => {
  const { phone, otp } = req.body;
  const record = otpStore[phone];
  if (!record) return res.status(400).json({ message: 'OTP not requested.' });
  if (Date.now() > record.expires) return res.status(400).json({ message: 'OTP expired.' });
  if (record.otp !== otp) return res.status(400).json({ message: 'Invalid OTP.' });
  delete otpStore[phone];
  res.json({ message: 'Login successful!' });
});

app.get('/admin/otps', (req, res) => {
  const list = Object.entries(otpStore).map(([phone, data]) => ({
    phone,
    otp: data.otp,
    expires: data.expires
  }));
  res.json(list);
});

app.listen(3000, () => console.log('Server running on http://localhost:3000'));
