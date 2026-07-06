// product-checker.js
// Checks for trending products once a day, texts you the results.
// NOTE: Replace the fetchTrendingProducts() function with a real data source
// (e.g. a product research API like Sell The Trend, Ecomhunt, or your supplier's API).
// Free scraping of sites like AliExpress can break their terms of service,
// so a paid data API is the safer long-term option.

const twilio = require('twilio')(
  process.env.TWILIO_ACCOUNT_SID,
  process.env.TWILIO_AUTH_TOKEN
);

const YOUR_PHONE_NUMBER = 'your-number-here'; // e.g. '+15551234567'

// PLACEHOLDER: swap this out for a real API call later
async function fetchTrendingProducts() {
  // Example of what a real API response might look like
  return [
    { name: 'Mini LED Desk Lamp', cost: 6.50, trend: '+40% this week' },
    { name: 'Portable Blender', cost: 9.00, trend: '+25% this week' },
  ];
}

async function sendDailyPicks() {
  const products = await fetchTrendingProducts();

  let message = "Today's top picks:\n";
  products.forEach(p => {
    message += `${p.name} - Cost $${p.cost} - Trending ${p.trend}\n`;
  });

  await twilio.messages.create({
    body: message,
    from: process.env.TWILIO_PHONE_NUMBER,
    to: YOUR_PHONE_NUMBER,
  });

  console.log('Sent daily product picks.');
}

// Run once a day (every 24 hours)
sendDailyPicks(); // runs once immediately when started
setInterval(sendDailyPicks, 24 * 60 * 60 * 1000);
