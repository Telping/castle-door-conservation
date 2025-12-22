import { Resend } from 'npm:resend';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const resend = new Resend(Deno.env.get('RESEND_API_KEY'));

interface EmailRequest {
  to: string;
  template: 'approval_request' | 'approval_decision' | 'work_assignment' | 'work_completion';
  data: Record<string, unknown>;
}

function getSubject(template: string, data: Record<string, unknown>): string {
  switch (template) {
    case 'approval_request':
      return `[Action Required] Door Assessment Review - ${data.site_name}`;
    case 'approval_decision':
      return `Assessment ${data.status === 'approved' ? 'Approved' : 'Rejected'} - ${data.site_name}`;
    case 'work_assignment':
      return `New Work Assignment - ${data.site_name}`;
    case 'work_completion':
      return `Work Completion Confirmation - ${data.site_name}`;
    default:
      return 'Castle Door Conservation Notification';
  }
}

function getHtmlContent(template: string, data: Record<string, unknown>): string {
  const baseStyle = `
    <style>
      body { font-family: system-ui, -apple-system, sans-serif; line-height: 1.6; color: #333; }
      .container { max-width: 600px; margin: 0 auto; padding: 20px; }
      .header { background: #166534; color: white; padding: 20px; border-radius: 8px 8px 0 0; }
      .content { background: #f9fafb; padding: 20px; border: 1px solid #e5e7eb; }
      .footer { padding: 15px; text-align: center; font-size: 12px; color: #6b7280; }
      .button { display: inline-block; background: #166534; color: white; padding: 12px 24px; border-radius: 6px; text-decoration: none; margin: 10px 0; }
      .status-approved { color: #166534; font-weight: bold; }
      .status-rejected { color: #dc2626; font-weight: bold; }
      .detail { margin: 10px 0; padding: 10px; background: white; border-radius: 4px; }
    </style>
  `;

  switch (template) {
    case 'approval_request':
      return `
        ${baseStyle}
        <div class="container">
          <div class="header">
            <h1>Door Assessment Review Required</h1>
          </div>
          <div class="content">
            <p>Hello ${data.approver_name},</p>
            <p>A new door assessment requires your review as ${data.approval_role}.</p>

            <div class="detail">
              <strong>Site:</strong> ${data.site_name}<br>
              <strong>Location:</strong> ${data.door_location}<br>
              <strong>Submitted by:</strong> ${data.submitter_name}<br>
              <strong>Estimated Cost:</strong> ${data.total_cost}
            </div>

            <p>${data.conservation_summary}</p>

            <a href="${data.review_url}" class="button">Review Assessment</a>

            <p>Please review this assessment and provide your approval or feedback.</p>
          </div>
          <div class="footer">
            Castle Door Conservation App<br>
            This is an automated notification.
          </div>
        </div>
      `;

    case 'approval_decision':
      return `
        ${baseStyle}
        <div class="container">
          <div class="header">
            <h1>Assessment ${data.status === 'approved' ? 'Approved' : 'Requires Revision'}</h1>
          </div>
          <div class="content">
            <p>Hello ${data.submitter_name},</p>
            <p>Your door assessment has been <span class="status-${data.status}">${data.status}</span> by ${data.approver_name} (${data.approval_role}).</p>

            <div class="detail">
              <strong>Site:</strong> ${data.site_name}<br>
              <strong>Location:</strong> ${data.door_location}
            </div>

            ${data.comments ? `
              <div class="detail">
                <strong>Comments:</strong><br>
                ${data.comments}
              </div>
            ` : ''}

            <a href="${data.assessment_url}" class="button">View Assessment</a>

            ${data.status === 'rejected' ? '<p>Please review the feedback and make necessary revisions before resubmitting.</p>' : '<p>The assessment will proceed to the next stage of approval.</p>'}
          </div>
          <div class="footer">
            Castle Door Conservation App<br>
            This is an automated notification.
          </div>
        </div>
      `;

    case 'work_assignment':
      return `
        ${baseStyle}
        <div class="container">
          <div class="header">
            <h1>New Work Assignment</h1>
          </div>
          <div class="content">
            <p>Hello ${data.contractor_name},</p>
            <p>You have been assigned a new conservation project.</p>

            <div class="detail">
              <strong>Site:</strong> ${data.site_name}<br>
              <strong>Location:</strong> ${data.door_location}<br>
              <strong>Due Date:</strong> ${data.due_date || 'To be confirmed'}<br>
              <strong>Assigned by:</strong> ${data.assigner_name}
            </div>

            <div class="detail">
              <strong>Work Description:</strong><br>
              ${data.work_description}
            </div>

            <div class="detail">
              <strong>Estimated Hours:</strong> ${data.effort_hours}<br>
              <strong>Budget:</strong> ${data.total_cost}
            </div>

            <a href="${data.assignment_url}" class="button">View Assignment Details</a>

            <p>Please confirm receipt and contact us if you have any questions.</p>
          </div>
          <div class="footer">
            Castle Door Conservation App<br>
            This is an automated notification.
          </div>
        </div>
      `;

    case 'work_completion':
      return `
        ${baseStyle}
        <div class="container">
          <div class="header">
            <h1>Work Completion Confirmation</h1>
          </div>
          <div class="content">
            <p>Hello ${data.recipient_name},</p>
            <p>The conservation work has been marked as complete.</p>

            <div class="detail">
              <strong>Site:</strong> ${data.site_name}<br>
              <strong>Location:</strong> ${data.door_location}<br>
              <strong>Completed by:</strong> ${data.contractor_name}<br>
              <strong>Completion Date:</strong> ${data.completion_date}
            </div>

            ${data.completion_notes ? `
              <div class="detail">
                <strong>Completion Notes:</strong><br>
                ${data.completion_notes}
              </div>
            ` : ''}

            <a href="${data.assessment_url}" class="button">View Project Details</a>

            <p>Please verify the work and update the project status as needed.</p>
          </div>
          <div class="footer">
            Castle Door Conservation App<br>
            This is an automated notification.
          </div>
        </div>
      `;

    default:
      return `<p>Notification from Castle Door Conservation App</p>`;
  }
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const { to, template, data } = await req.json() as EmailRequest;

    if (!to || !template) {
      return new Response(
        JSON.stringify({ error: 'Missing required fields' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const subject = getSubject(template, data);
    const html = getHtmlContent(template, data);

    const result = await resend.emails.send({
      from: 'Castle Conservation <noreply@castleconservation.ie>',
      to: [to],
      subject,
      html,
    });

    return new Response(
      JSON.stringify({ success: true, id: result.data?.id }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Error sending email:', error);
    return new Response(
      JSON.stringify({ error: 'Failed to send email', details: error.message }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
