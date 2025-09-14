// Email Service for sending ticket notifications
export interface EmailData {
  to: string;
  subject: string;
  html: string;
  ticketData: {
    ticketNo: string;
    title: string;
    requestor: string;
    department: string;
    category: string;
    severity: string;
    assignee: string;
    branch: string;
    description: string;
    date: string;
  };
}

// Email template for new ticket notifications
export const generateTicketEmailTemplate = (
  data: EmailData["ticketData"]
): string => {
  const severityColor =
    {
      Critical: "#dc2626", // red-600
      High: "#ea580c", // orange-600
      Medium: "#d97706", // amber-600
      Low: "#16a34a", // green-600
    }[data.severity] || "#6b7280"; // gray-500

  return `
    <!DOCTYPE html>
    <html lang="en">
    <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>New Ticket Request - ${data.ticketNo}</title>
        <style>
            body {
                font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
                line-height: 1.6;
                color: #374151;
                max-width: 600px;
                margin: 0 auto;
                padding: 20px;
                background-color: #f9fafb;
            }
            .container {
                background-color: white;
                border-radius: 8px;
                box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
                overflow: hidden;
            }
            .header {
                background: linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%);
                color: white;
                padding: 24px;
                text-align: center;
            }
            .header h1 {
                margin: 0;
                font-size: 24px;
                font-weight: 600;
            }
            .header p {
                margin: 8px 0 0 0;
                opacity: 0.9;
                font-size: 14px;
            }
            .content {
                padding: 24px;
            }
            .ticket-info {
                background-color: #f8fafc;
                border: 1px solid #e2e8f0;
                border-radius: 6px;
                padding: 16px;
                margin: 16px 0;
            }
            .info-row {
                display: flex;
                justify-content: space-between;
                align-items: center;
                padding: 8px 0;
                border-bottom: 1px solid #e2e8f0;
            }
            .info-row:last-child {
                border-bottom: none;
            }
            .info-label {
                font-weight: 600;
                color: #475569;
                font-size: 14px;
            }
            .info-value {
                color: #1e293b;
                font-size: 14px;
            }
            .severity-badge {
                display: inline-block;
                padding: 4px 8px;
                border-radius: 4px;
                font-size: 12px;
                font-weight: 600;
                color: white;
                background-color: ${severityColor};
            }
            .description {
                background-color: #f8fafc;
                border: 1px solid #e2e8f0;
                border-radius: 6px;
                padding: 16px;
                margin: 16px 0;
            }
            .description h3 {
                margin: 0 0 12px 0;
                font-size: 16px;
                color: #374151;
            }
            .description-content {
                color: #4b5563;
                line-height: 1.6;
            }
            .footer {
                background-color: #f8fafc;
                padding: 16px 24px;
                text-align: center;
                border-top: 1px solid #e2e8f0;
                color: #6b7280;
                font-size: 12px;
            }
            .action-button {
                display: inline-block;
                background-color: #3b82f6;
                color: white;
                padding: 12px 24px;
                text-decoration: none;
                border-radius: 6px;
                font-weight: 600;
                margin: 16px 0;
            }
        </style>
    </head>
    <body>
        <div class="container">
            <div class="header">
                <h1>🎫 New Ticket Request</h1>
                <p>Ticket #${data.ticketNo} has been assigned to you</p>
            </div>
            
            <div class="content">
                <h2 style="margin: 0 0 16px 0; color: #1e293b;">${
                  data.title
                }</h2>
                
                <div class="ticket-info">
                    <div class="info-row">
                        <span class="info-label">Ticket Number:</span>
                        <span class="info-value" style="font-family: monospace; font-weight: 600;">${
                          data.ticketNo
                        }</span>
                    </div>
                    <div class="info-row">
                        <span class="info-label">Requestor:</span>
                        <span class="info-value">${data.requestor}</span>
                    </div>
                    <div class="info-row">
                        <span class="info-label">Department:</span>
                        <span class="info-value">${data.department}</span>
                    </div>
                    <div class="info-row">
                        <span class="info-label">Category:</span>
                        <span class="info-value">${data.category}</span>
                    </div>
                    <div class="info-row">
                        <span class="info-label">Severity:</span>
                        <span class="severity-badge">${data.severity}</span>
                    </div>
                    <div class="info-row">
                        <span class="info-label">Assignee:</span>
                        <span class="info-value">${data.assignee}</span>
                    </div>
                    <div class="info-row">
                        <span class="info-label">Branch:</span>
                        <span class="info-value">${data.branch}</span>
                    </div>
                    <div class="info-row">
                        <span class="info-label">Date Created:</span>
                        <span class="info-value">${new Date(
                          data.date
                        ).toLocaleDateString("en-US", {
                          year: "numeric",
                          month: "long",
                          day: "numeric",
                        })}</span>
                    </div>
                </div>

                <div class="description">
                    <h3>📝 Description</h3>
                    <div class="description-content">
                        ${data.description}
                    </div>
                </div>

                <div style="text-align: center;">
                    <a href="#" class="action-button">View Ticket Details</a>
                </div>
            </div>
            
            <div class="footer">
                <p>This is an automated notification from NexTrack Helpdesk System.</p>
                <p>Please do not reply to this email. For support, contact the IT department.</p>
            </div>
        </div>
    </body>
    </html>
  `;
};

// Mock email service (in a real application, this would integrate with an email service like SendGrid, AWS SES, etc.)
export const sendTicketNotificationEmail = async (
  emailData: EmailData
): Promise<boolean> => {
  try {
    // In a real implementation, you would:
    // 1. Use an email service like SendGrid, AWS SES, or Nodemailer
    // 2. Configure SMTP settings
    // 3. Handle authentication and rate limiting
    // 4. Add error handling and retry logic

    console.log("📧 Sending email notification...");
    console.log("To:", emailData.to);
    console.log("Subject:", emailData.subject);
    console.log("Ticket Data:", emailData.ticketData);

    // Simulate email sending delay
    await new Promise((resolve) => setTimeout(resolve, 1000));

    // Mock successful email sending
    console.log("✅ Email notification sent successfully!");

    // In a real application, you would return the actual result from the email service
    return true;
  } catch (error) {
    console.error("❌ Failed to send email notification:", error);
    return false;
  }
};

// Helper function to get assignee email based on assignee name
export const getAssigneeEmail = (assigneeName: string): string => {
  const assigneeEmails: { [key: string]: string } = {
    "John Smith": "john.smith@company.com",
    "Sarah Johnson": "sarah.johnson@company.com",
    "Mike Wilson": "mike.wilson@company.com",
    "Lisa Chen": "lisa.chen@company.com",
    "IT Support Team": "itsupport@company.com",
    "Network Administrator": "network.admin@company.com",
    "System Administrator": "system.admin@company.com",
    "Help Desk Specialist": "helpdesk@company.com",
    "Technical Support": "techsupport@company.com",
    "IT Manager": "it.manager@company.com",
  };

  return assigneeEmails[assigneeName] || "itsupport@company.com";
};
