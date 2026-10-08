export interface GoogleAuthState {
  isConnected: boolean;
  token: string | null;
}

// Since setting up a real Google Cloud OAuth consent screen and getting a client ID 
// requires manual developer console work, we simulate the API calls gracefully.
// If a real token is provided in the future, these fetch calls will execute against live Google APIs.

export async function createCalendarEvent(token: string, eventDetails: any) {
  // If no token or simulated token, just simulate success after a delay
  if (!token || token === 'simulated-token') {
    return new Promise(resolve => {
      setTimeout(() => {
        resolve({ htmlLink: 'https://calendar.google.com/calendar/u/0/r/eventedit?text=Simulated+Event' });
      }, 800);
    });
  }

  // Real Google Calendar API Call
  const response = await fetch('https://www.googleapis.com/calendar/v3/calendars/primary/events', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      summary: eventDetails.title,
      description: eventDetails.description,
      start: {
        dateTime: new Date(`${eventDetails.date} ${eventDetails.time}`).toISOString(),
        timeZone: Intl.DateTimeFormat().resolvedOptions().timeZone,
      },
      end: {
        dateTime: new Date(new Date(`${eventDetails.date} ${eventDetails.time}`).getTime() + 60*60*1000).toISOString(),
        timeZone: Intl.DateTimeFormat().resolvedOptions().timeZone,
      },
      attendees: [{ email: eventDetails.email }],
    }),
  });

  if (!response.ok) throw new Error("Failed to create calendar event");
  return response.json();
}

export async function sendEmail(token: string, to: string, subject: string, body: string, pdfBase64?: string) {
  if (!token || token === 'simulated-token') {
    return new Promise(resolve => {
      setTimeout(() => {
        resolve({ id: 'simulated-email-id' });
      }, 1000);
    });
  }

  // Construct MIME email for Gmail API
  const boundary = "boundary_123456789";
  let emailContent = `To: ${to}\r\n`;
  emailContent += `Subject: ${subject}\r\n`;
  emailContent += `Content-Type: multipart/mixed; boundary="${boundary}"\r\n\r\n`;
  
  // Body text
  emailContent += `--${boundary}\r\n`;
  emailContent += `Content-Type: text/plain; charset="UTF-8"\r\n\r\n`;
  emailContent += `${body}\r\n\r\n`;

  // Attachment
  if (pdfBase64) {
    emailContent += `--${boundary}\r\n`;
    emailContent += `Content-Type: application/pdf; name="Booking-Confirmation.pdf"\r\n`;
    emailContent += `Content-Disposition: attachment; filename="Booking-Confirmation.pdf"\r\n`;
    emailContent += `Content-Transfer-Encoding: base64\r\n\r\n`;
    emailContent += `${pdfBase64.replace(/^data:application\/pdf;filename=generated\.pdf;base64,/, '')}\r\n\r\n`;
  }
  
  emailContent += `--${boundary}--`;

  const encodedEmail = btoa(emailContent).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');

  const response = await fetch('https://gmail.googleapis.com/upload/gmail/v1/users/me/messages/send', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ raw: encodedEmail }),
  });

  if (!response.ok) throw new Error("Failed to send email");
  return response.json();
}
