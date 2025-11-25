function doPost(e) {
  Logger.log("doPost TRIGGERED at: " + new Date());

  try {
    if (!e || !e.postData || !e.postData.contents) {
      return ContentService.createTextOutput(JSON.stringify({ success: false, error: "No data" }))
        .setMimeType(ContentService.MimeType.JSON);
    }

    const payload = e.postData.contents;
    Logger.log("RAW PAYLOAD: " + payload);

    let data;
    try {
      data = JSON.parse(payload);
      Logger.log("Keys received: " + Object.keys(data).join(", "));
    } catch (err) {
      Logger.log("JSON parse failed: " + err);
      return ContentService.createTextOutput(JSON.stringify({ success: false, error: "Invalid JSON" }))
        .setMimeType(ContentService.MimeType.JSON);
    }

    // FIXED: Extract fields – EXACTLY MATCHES YOUR SHOPIFY JS NAMES
    const fullName = (data.full_name || data.name || data.customer_name || data.your_name || "Customer").trim();
    const email = (data.email || data.customer_email || "").trim().toLowerCase();
    const phone = (data.phone || data.customer_phone || "").trim();
    const address = (data.address || data.shipping_address || "").trim();
    const instructions = (data.instructions || data.message || data.notes || "").trim();
    const productTitle = (data.product_title || data.title || data.product_name || "Product").trim();
    const productUrl = (data.product_url || data.productUrl || window.location.href || "").trim();  // Fallback to current URL if missing
    const productImage = (data.product_image || data.productImage || "").trim();

    Logger.log(`EXTRACTED → Name: "${fullName}" | Product: "${productTitle}" | URL: "${productUrl}" | Image: "${productImage}"`);

    // 1. SAVE TO GOOGLE SHEET (with URL + Image columns)
    const sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName("Sheet1");
    sheet.appendRow([new Date(), fullName, email, phone, address, instructions, productTitle, productUrl, productImage]);
    Logger.log("Saved to Google Sheet");

    // 2. PROFESSIONAL EMAIL TO BOSS & YOU
    const adminEmails = "store-email@outlook.com";

    MailApp.sendEmail({
      to: adminEmails,
      subject: `FREIGHT INQUIRY – ${productTitle}`,
      htmlBody: `
        <!DOCTYPE html PUBLIC "-//W3C//DTD XHTML 1.0 Transitional//EN" "http://www.w3.org/TR/xhtml1/DTD/xhtml1-transitional.dtd">
<html xmlns="http://www.w3.org/1999/xhtml">
<head>
  <meta http-equiv="Content-Type" content="text/html; charset=UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Freight Request Received</title>

  <style type="text/css">
    table { border-collapse:collapse; mso-table-lspace:0pt; mso-table-rspace:0pt; }
    img { border:0; height:auto; line-height:100%; outline:none; text-decoration:none; -ms-interpolation-mode:bicubic; }
    body { margin:0 !important; padding:0 !important; width:100% !important; background:#f8f9fa; }
    a { color:#e74c3c; text-decoration:none; }
  </style>
</head>

<body style="margin:0; padding:16px 8px; background:#f8f9fa; font-family:Arial, sans-serif; font-size:16px; line-height:1.5;">

  <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%" style="max-width:560px; margin:0 auto; background:#ffffff; border-radius:20px; overflow:hidden; box-shadow:0 20px 40px rgba(0,0,0,0.08);">

    <!-- HEADER -->
    <tr>
      <td style="background:#000; padding:20px; text-align:center;">
        <img src="https://www.kartingcentral.com.au/cdn/shop/files/kc_logo_Black_L_024ee790-ff9a-4c38-807d-b5762320f29c_180x@2x.png?v=1613536910"
             alt="Karting Central" width="160" style="display:block; max-width:160px; height:auto;">
      </td>
    </tr>

    <!-- CONTENT -->
    <tr>
      <td style="padding:32px 36px 40px; color:#1a1a1a;">

        <h1 style="font-size:26px; font-weight:bold; color:#e74c3c; margin:0 0 6px 0;">
          Thank you${fullName ? ', ' + fullName.split(' ')[0] : ''}!
        </h1>

        <p style="font-size:15px; color:#666; margin:0 0 24px 0;">
          We've received your freight request and our team is calculating the best shipping option.
        </p>

        <!-- PRODUCT SECTION -->
        <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%" 
          style="background:#fff8f8; border-left:5px solid #e74c3c; border-radius:14px; margin:0 0 28px 0;">
          <tr>
            <td style="padding:18px 22px; vertical-align:top;">
              ${productImage ? `<img src="${productImage}" alt="${productTitle}" width="100" 
                style="display:block; max-width:100px; height:auto; border-radius:10px; box-shadow:0 6px 15px rgba(0,0,0,0.1);">` : ''}
            </td>
            <td style="padding:18px 22px; vertical-align:top;">
              <div style="font-size:18px; font-weight:bold; color:#111; margin:0 0 4px 0;">
                ${productTitle}
              </div>
              ${address ? `<div style="font-size:15px; color:#666; margin:0;">
                Delivery to: ${address}
              </div>` : ''}
            </td>
          </tr>
        </table>

        <!-- CUSTOMER INFO (UPDATED / PREMIUM) -->
        <div style="background:#fff; border:1px solid #eee; border-radius:14px; padding:24px 28px; margin-bottom:32px;">

          <div style="font-size:13px; color:#999; letter-spacing:1px; font-weight:600; text-transform:uppercase; margin-bottom:6px;">
            Customer
          </div>
          <div style="font-size:18px; font-weight:700; color:#111; margin-bottom:18px;">
            ${fullName || ''}
          </div>

          <div style="font-size:13px; color:#999; letter-spacing:1px; font-weight:600; text-transform:uppercase; margin-bottom:6px;">
            Email
          </div>
          <div style="font-size:16px; color:#444; font-weight:600; margin-bottom:18px;">
            ${email || ''}
          </div>

          <div style="font-size:13px; color:#999; letter-spacing:1px; font-weight:600; text-transform:uppercase; margin-bottom:6px;">
            Phone
          </div>
          <div style="font-size:16px; color:#444; font-weight:600; margin-bottom:18px;">
            ${phone || ''}
          </div>

          <div style="font-size:13px; color:#999; letter-spacing:1px; font-weight:600; text-transform:uppercase; margin-bottom:6px;">
            Delivery Address
          </div>
          <div style="font-size:16px; color:#444; font-weight:600;">
            ${address || ''}
          </div>
        </div>

        <p style="font-size:16px; color:#333; margin:0 0 32px 0;">
          We'll reply with your exact freight quote <strong>within 24 hours</strong> (usually much sooner).
        </p>

        <!-- BUTTON -->
        <div style="text-align:center; margin:0 0 32px 0;">
          <a href="${productUrl}" 
             style="display:inline-block; background:#e74c3c; color:#ffffff; padding:14px 36px; 
             border-radius:50px; text-decoration:none; font-weight:bold; font-size:15px; 
             box-shadow:0 8px 20px rgba(231,76,60,0.3);">
            View Your Product
          </a>
        </div>

        <p style="font-size:14px; color:#666; margin:0;">
          Questions? Just reply to this email — we're here to help.
        </p>

        <div style="text-align:center; color:#888; font-size:13px; margin:32px 0 0 0;">
          ${new Date().toLocaleString("en-AU", {
            timeZone: "Australia/Sydney",
            year: "numeric",
            month: "short",
            day: "numeric",
            hour: "2-digit",
            minute: "2-digit"
          })}
        </div>

      </td>
    </tr>

    <!-- FOOTER -->
    <tr>
      <td style="background:#111; color:#777; text-align:center; padding:20px; font-size:12px;">
        © 2025 Karting Central Australia • 
        <a href="https://www.kartingcentral.com.au" style="color:#e74c3c; text-decoration:none;">
          www.kartingcentral.com.au
        </a>
      </td>
    </tr>

  </table>

</body>


        </html>

      `
    });
    Logger.log("Admin email sent");

    // 3. PROFESSIONAL CUSTOMER CONFIRMATION EMAIL
    if (email && email.includes("@") && email.includes(".")) {
      MailApp.sendEmail({
        to: email,
        name: "Your Store Name",                            // Hides personal Gmail
        replyTo: "Your Store Email",             // Replies to boss
        subject: "Thank you! We received your freight request",
        htmlBody: `
          <!DOCTYPE html PUBLIC "-//W3C//DTD XHTML 1.0 Transitional//EN" "http://www.w3.org/TR/xhtml1/DTD/xhtml1-transitional.dtd">
          <html xmlns="http://www.w3.org/1999/xhtml">
          <head>
            <meta http-equiv="Content-Type" content="text/html; charset=UTF-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <title>Freight Request Received</title>
            <!--[if mso]>
            <noscript>
              <xml>
                <o:OfficeDocumentSettings>
                  <o:AllowPNG/>
                  <o:PixelsPerInch>96</o:PixelsPerInch>
                </o:OfficeDocumentSettings>
              </xml>
            </noscript>
            <![endif]-->
            <style type="text/css">
              table { border-collapse:collapse; mso-table-lspace:0pt; mso-table-rspace:0pt; }
              img { border:0; height:auto; line-height:100%; outline:none; text-decoration:none; -ms-interpolation-mode:bicubic; }
              body { margin:0 !important; padding:0 !important; width:100% !important; background:#f8f9fa; }
              a { color:#e74c3c; text-decoration:none; }
            </style>
          </head>
          <body style="margin:0; padding:16px 8px; background:#f8f9fa; font-family:Arial, sans-serif; font-size:16px; line-height:1.5;">
            <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%" style="max-width:560px; margin:0 auto; background:#ffffff; border-radius:20px; overflow:hidden; box-shadow:0 20px 40px rgba(0,0,0,0.08);">
              <!-- HEADER -->
              <tr>
                <td style="background:#000; padding:20px; text-align:center;">
                  <img src="https://www.kartingcentral.com.au/cdn/shop/files/kc_logo_Black_L_024ee790-ff9a-4c38-807d-b5762320f29c_180x@2x.png?v=1613536910" alt="Karting Central" width="160" style="display:block; max-width:160px; height:auto;">
                </td>
              </tr>
              <!-- CONTENT -->
              <tr>
                <td style="padding:32px 36px 40px; color:#1a1a1a;">
                  <h1 style="font-size:26px; font-weight:bold; color:#e74c3c; margin:0 0 6px 0;">Thank you${fullName ? ', ' + fullName.split(' ')[0] : ''}!</h1>
                  <p style="font-size:15px; color:#666; margin:0 0 24px 0;">We've received your freight request and our team is calculating the best shipping option.</p>

                  <!-- PRODUCT SECTION (Table for cross-client consistency) -->
                  <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%" style="background:#fff8f8; border-left:5px solid #e74c3c; border-radius:14px; margin:0 0 24px 0;">
                    <tr>
                      <td style="padding:18px 22px; vertical-align:top;">
                        ${productImage ? `<img src="${productImage}" alt="${productTitle}" width="100" style="display:block; max-width:100px; height:auto; border-radius:10px; box-shadow:0 6px 15px rgba(0,0,0,0.1);">` : ''}
                      </td>
                      <td style="padding:18px 22px; vertical-align:top;">
                        <div style="font-size:18px; font-weight:bold; color:#111; margin:0 0 4px 0;">${productTitle}</div>
                        ${address ? `<div style="font-size:15px; color:#666; margin:0;">Delivery to: ${address}</div>` : ''}
                      </td>
                    </tr>
                  </table>

                  <p style="font-size:16px; color:#333; margin:0 0 32px 0;">We'll reply with your exact freight quote <strong>within 24 hours</strong> (usually much sooner).</p>

                  <!-- BUTTON (Centered, pill-shaped like admin) -->
                  <div style="text-align:center; margin:0 0 32px 0;">
                    <a href="${productUrl}" style="display:inline-block; background:#e74c3c; color:#ffffff; padding:14px 36px; border-radius:50px; text-decoration:none; font-weight:bold; font-size:15px; box-shadow:0 8px 20px rgba(231,76,60,0.3);">View Your Product</a>
                  </div>

                  <p style="font-size:14px; color:#666; margin:0;">Questions? Just reply to this email — we're here to help.</p>

                  <div style="text-align:center; color:#888; font-size:13px; margin:32px 0 0 0;">
                    ${new Date().toLocaleString("en-AU", { timeZone: "Australia/Sydney", year: "numeric", month: "short", day: "numeric", hour: "2-digit", minute: "2-digit" })}
                  </div>
                </td>
              </tr>
              <!-- FOOTER -->
              <tr>
                <td style="background:#111; color:#777; text-align:center; padding:20px; font-size:12px;">
                  © 2025 Karting Central Australia • <a href="https://www.kartingcentral.com.au" style="color:#e74c3c; text-decoration:none;">www.kartingcentral.com.au</a>
                </td>
              </tr>
            </table>
          </body>
          </html>
        `
      });
      Logger.log("Customer email sent");
    }

    // Success response to Shopify
    return ContentService.createTextOutput(JSON.stringify({
      success: true,
      message: "Thank you! Your request has been sent."
    })).setMimeType(ContentService.MimeType.JSON);

  } catch (error) {
    Logger.log("ERROR: " + error.toString());
    return ContentService.createTextOutput(JSON.stringify({ success: false, error: "Server error" }))
      .setMimeType(ContentService.MimeType.JSON);
  }
}