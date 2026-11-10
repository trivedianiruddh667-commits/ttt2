import { Course, Order } from '../data/db';

const escapeHtml = (unsafe: string): string =>
  unsafe
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');

const triggerBlobDownload = (filename: string, content: string, mimeType: string) => {
  const blob = new Blob([content], { type: mimeType });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  setTimeout(() => URL.revokeObjectURL(url), 1000);
};

export function downloadCourseStudyPack(course: Course): string {
  const safeCode = (course.code || 'COURSE').replace(/[^a-zA-Z0-9_-]/g, '_');
  const fileName = `${safeCode}_Tribe_Study_Pack.html`;

  const outcomesHtml = (course.learningOutcomes || [])
    .map((item) => `<li>${escapeHtml(item)}</li>`)
    .join('');

  const syllabusHtml = (course.syllabus || [])
    .map(
      (mod, idx) => `
      <div class="module">
        <div class="module-head">
          <strong>${escapeHtml(mod.title || `Module ${idx + 1}`)}</strong>
          <span>${escapeHtml(mod.duration || '')}</span>
        </div>
        <ul>
          ${(mod.topics || []).map((t) => `<li>${escapeHtml(t)}</li>`).join('')}
        </ul>
      </div>`
    )
    .join('');

  const notesBlock = course.notesContent
    ? `<section class="box">
         <h2>Faculty Attached Study Notes (${escapeHtml(course.uploadedFileName || 'Attached Manuscript')})</h2>
         <pre class="notes-pre">${escapeHtml(course.notesContent)}</pre>
       </section>`
    : '';

  const html = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <title>${escapeHtml(course.code)} · ${escapeHtml(course.title)} | Techie Teacher's Tribe Trust</title>
  <style>
    body { font-family: system-ui, -apple-system, sans-serif; color: #111; max-width: 820px; margin: 32px auto; padding: 0 20px; line-height: 1.55; }
    .header { border: 3px solid #000; padding: 20px; margin-bottom: 24px; }
    .brand { font-size: 11px; letter-spacing: 2px; text-transform: uppercase; font-weight: 800; color: #444; }
    h1 { margin: 8px 0 6px; font-size: 24px; text-transform: uppercase; }
    .meta { font-family: monospace; font-size: 12px; color: #333; margin-top: 8px; }
    .box { border: 2px solid #000; padding: 16px 20px; margin-bottom: 20px; }
    h2 { font-size: 14px; text-transform: uppercase; letter-spacing: 1px; margin: 0 0 12px; border-bottom: 1px solid #ccc; padding-bottom: 6px; }
    .module { border: 1px solid #bbb; padding: 12px; margin-bottom: 10px; }
    .module-head { display: flex; justify-content: space-between; font-size: 14px; margin-bottom: 6px; }
    ul { margin: 6px 0 0 18px; padding: 0; font-size: 13px; }
    .notes-pre { white-space: pre-wrap; font-family: monospace; font-size: 12px; background: #f4f4f5; padding: 12px; border: 1px solid #d4d4d8; }
    .footer { font-size: 11px; color: #555; border-top: 2px solid #000; padding-top: 12px; margin-top: 28px; display: flex; justify-content: space-between; }
    @media print { body { margin: 0; } }
  </style>
</head>
<body>
  <div class="header">
    <div class="brand">TECHIE TEACHER'S TRIBE TRUST · DIGITAL STUDY PACK</div>
    <h1>${escapeHtml(course.code)} · ${escapeHtml(course.title)}</h1>
    <div class="meta">
      Mentor: ${escapeHtml(course.teacher)} (${escapeHtml(course.teacherRole)})<br/>
      Branch: ${escapeHtml(course.branch)} · ${escapeHtml(course.semester)} · Duration: ${escapeHtml(course.duration)}
      ${course.pdfPages ? ` · ${course.pdfPages} Exam Focus Pages` : ''}
    </div>
  </div>

  <section class="box">
    <h2>Subject Overview</h2>
    <p>${escapeHtml(course.description)}</p>
  </section>

  <section class="box">
    <h2>High-Yield Exam Learning Outcomes</h2>
    <ul>${outcomesHtml || '<li>Complete exam syllabus revision and solved past-year numericals.</li>'}</ul>
  </section>

  <section class="box">
    <h2>Module-by-Module Study Roadmap</h2>
    ${syllabusHtml || '<p>Full syllabus blueprint included in course reader.</p>'}
  </section>

  ${notesBlock}

  <div class="footer">
    <span>Generated for personal exam revision · Print to PDF via Ctrl+P / Cmd+P</span>
    <span>© 2026 Techie Teacher's Tribe Trust</span>
  </div>
</body>
</html>`;

  triggerBlobDownload(fileName, html, 'text/html;charset=utf-8');
  return fileName;
}

export function downloadOrderReceipt(order: Order, studentName?: string): string {
  const safeOrderId = (order.id || 'RECEIPT').replace(/[^a-zA-Z0-9_-]/g, '_');
  const fileName = `Receipt_${safeOrderId}.html`;

  const itemsRows = order.items
    .map(
      (item) => `
      <tr>
        <td>${escapeHtml(item.title)}</td>
        <td>${escapeHtml(item.category)}</td>
        <td style="text-align:right;font-family:monospace;">₹${Number(item.price).toFixed(2)}</td>
      </tr>`
    )
    .join('');

  const html = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <title>Tax Invoice ${escapeHtml(order.id)} | Techie Teacher's Tribe Trust</title>
  <style>
    body { font-family: system-ui, -apple-system, sans-serif; color: #111; max-width: 720px; margin: 32px auto; padding: 24px; border: 3px solid #000; }
    .top { display: flex; justify-content: space-between; border-bottom: 2px solid #000; padding-bottom: 16px; margin-bottom: 20px; }
    h1 { margin: 0; font-size: 20px; text-transform: uppercase; }
    .mono { font-family: monospace; font-size: 12px; }
    table { width: 100%; border-collapse: collapse; margin: 20px 0; }
    th, td { border: 1px solid #ccc; padding: 10px; text-align: left; font-size: 13px; }
    th { background: #f4f4f5; text-transform: uppercase; font-size: 11px; }
    .totals { width: 280px; margin-left: auto; font-size: 13px; }
    .totals div { display: flex; justify-content: space-between; padding: 4px 0; }
    .grand { border-top: 2px solid #000; margin-top: 6px; padding-top: 8px !important; font-weight: 800; font-size: 16px; }
    .badge { display: inline-block; padding: 3px 8px; border: 1px solid #000; font-family: monospace; font-size: 11px; font-weight: 700; }
  </style>
</head>
<body>
  <div class="top">
    <div>
      <h1>Techie Teacher's Tribe Trust</h1>
      <div class="mono">Reg. Educational Trust · Sector 18 Tech Plaza, New Delhi</div>
      <div class="mono">Support: queries@techieteachertribe.org</div>
    </div>
    <div style="text-align:right;">
      <div class="badge">PAID TAX RECEIPT</div>
      <div class="mono" style="margin-top:8px;">Invoice: ${escapeHtml(order.id)}</div>
      <div class="mono">Date: ${escapeHtml(order.date)}</div>
    </div>
  </div>

  <div class="mono" style="margin-bottom:16px;">
    <strong>Billed To:</strong> ${escapeHtml(studentName || order.studentEmail)} (${escapeHtml(order.studentEmail)})<br/>
    <strong>Payment Method:</strong> ${escapeHtml(order.paymentMethod)} · <strong>TXN ID:</strong> ${escapeHtml(order.transactionId)}
  </div>

  <table>
    <thead>
      <tr>
        <th>Course / Notes Title</th>
        <th>Category</th>
        <th style="text-align:right;">Amount</th>
      </tr>
    </thead>
    <tbody>
      ${itemsRows}
    </tbody>
  </table>

  <div class="totals mono">
    <div><span>Subtotal</span><span>₹${Number(order.subtotal).toFixed(2)}</span></div>
    <div><span>Discount</span><span>-₹${Number(order.discount).toFixed(2)}</span></div>
    <div class="grand"><span>Total Paid</span><span>₹${Number(order.total).toFixed(2)}</span></div>
  </div>
</body>
</html>`;

  triggerBlobDownload(fileName, html, 'text/html;charset=utf-8');
  return fileName;
}

export async function copyTextSafely(text: string): Promise<boolean> {
  if (!text) return false;
  try {
    if (navigator.clipboard && window.isSecureContext) {
      await navigator.clipboard.writeText(text);
      return true;
    }
  } catch {
    // Fallback below
  }

  try {
    const textarea = document.createElement('textarea');
    textarea.value = text;
    textarea.setAttribute('readonly', '');
    textarea.style.position = 'fixed';
    textarea.style.left = '-9999px';
    document.body.appendChild(textarea);
    textarea.select();
    const ok = document.execCommand('copy');
    document.body.removeChild(textarea);
    return ok;
  } catch {
    return false;
  }
}

export async function shareContentSafely(payload: {
  title: string;
  text: string;
  url?: string;
}): Promise<'shared' | 'copied' | 'failed'> {
  const shareUrl = payload.url || window.location.href;
  try {
    if (typeof navigator !== 'undefined' && typeof navigator.share === 'function') {
      await navigator.share({
        title: payload.title,
        text: payload.text,
        url: shareUrl
      });
      return 'shared';
    }
  } catch (err) {
    if (err instanceof Error && err.name === 'AbortError') {
      return 'failed';
    }
  }

  const copied = await copyTextSafely(`${payload.title}\n${payload.text}\n${shareUrl}`);
  return copied ? 'copied' : 'failed';
}
