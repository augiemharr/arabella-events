export const RESPONSE_TEMPLATES = [
  {
    name: "Initial Response",
    subject: "Thank you for your inquiry - Arabella Events Place",
    body: "Hi {name},\n\nThank you for your inquiry about your {event_type}{date}! We'd love to help make your event special.\n\nWe'll review your details and get back to you within 24 hours with availability and a custom quote.\n\nIn the meantime, feel free to reach out if you have any questions.\n\nBest regards,\nArabella Events Place",
  },
  {
    name: "Date Available",
    subject: "Great news! Your date is available - Arabella Events Place",
    body: "Hi {name},\n\nGreat news! We have availability for your {event_type} on {date}.\n\nHere's a quick summary:\n- Event Type: {event_type}\n- Date: {date}\n- Expected Guests: {pax}\n\nI'll send over a detailed quote shortly. To secure your date, we require a 30% deposit.\n\nLet me know if you have any questions!\n\nBest regards,\nArabella Events Place",
  },
  {
    name: "Date Unavailable",
    subject: "Regarding your booking request - Arabella Events Place",
    body: "Hi {name},\n\nThank you for your interest in booking with Arabella Events Place for your {event_type}.\n\nUnfortunately, we are already fully booked for {date}. However, I'd be happy to check availability for nearby dates if you're flexible.\n\nWould any of these alternatives work for you?\n- The week before your preferred date\n- The week after your preferred date\n\nPlease let me know and I'll check our calendar right away.\n\nBest regards,\nArabella Events Place",
  },
  {
    name: "Quote Sent",
    subject: "Your custom quote is ready - Arabella Events Place",
    body: "Hi {name},\n\nPlease find below your custom quote for your {event_type}:\n\nEvent Date: {date}\nGuest Count: {pax}\nTotal Amount: P{total}\nDeposit Required (30%): P{deposit}\n\nPackage includes:\n- Full buffet setup with serving staff\n- Table and chair arrangement\n- Basic sound system\n- Event coordinator on-site\n\nTo confirm your booking, please send your deposit within 5 business days. Your date will be held temporarily until then.\n\nFeel free to reach out with any questions.\n\nBest regards,\nArabella Events Place",
  },
  {
    name: "Deposit Reminder",
    subject: "Deposit reminder for your event - Arabella Events Place",
    body: "Hi {name},\n\nJust a friendly reminder that we're holding your booking for your {event_type} on {date}.\n\nTo confirm your reservation, please send your deposit of P{deposit} at your earliest convenience.\n\nPayment can be made via:\n- Bank Transfer (details provided upon request)\n- GCash\n- Cash (visit our office)\n\nOnce we receive your deposit, we'll send a confirmation email with all the details.\n\nThank you!\nArabella Events Place",
  },
  {
    name: "Booking Confirmed",
    subject: "Your booking is confirmed! - Arabella Events Place",
    body: "Hi {name},\n\nYour booking is now confirmed! We're excited to be part of your {event_type}.\n\nHere are your booking details:\n- Event Date: {date}\n- Event Type: {event_type}\n- Guest Count: {pax}\n\nNext steps:\n1. Final menu selection (2 weeks before the event)\n2. Final headcount confirmation (1 week before the event)\n3. Final payment (3 days before the event)\n\nWe'll reach out as we get closer to your event date.\n\nThank you for choosing Arabella Events Place!\n\nBest regards,\nArabella Events Place",
  },
];
