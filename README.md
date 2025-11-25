# Contact for Freight

**Prevent accidental purchases of large/freight items in Shopify.**

Replace the standard **Add to Cart** button for freight products with a native-looking **Contact for Freight** button. Collect customer details in a popup, store submissions in Google Sheets, and send email alerts. Built with **Shopify Liquid + vanilla JS + Google Apps Script**, with **zero third-party apps and no recurring fees**.

---

## Table of Contents

* [The Story](#the-story)
* [Problem Solved](#problem-solved)
* [How It Works](#how-it-works)
* [Installation & Deployment](#installation--deployment)
* [Email & Google Sheets](#email--google-sheets)
* [Security](#security)
* [Testing & Troubleshooting](#testing--troubleshooting)
* [Customization](#customization)
* [QA / Curl Test](#qa--curl-test)
* [Changelog](#changelog)
* [License](#license)

---

## The Story

Sometimes, you don’t start a project because you’re an expert — you start because a **real problem needs solving**.

An Australian client sells racing karts, bare chassis frames, and various kart parts — from **$10 accessories to $4,000 chassis** — all in the same Shopify store. Shopify treats all products the same: **Add to Cart → Shipping → Checkout**.

The client’s rule:

> Customers **must not** buy large freight items directly. They must contact the owner first.

Why? Freight rates and delivery logistics vary widely, and Shopify doesn’t account for that. Without intervention, a customer could buy a $4,000 chassis using a $10 product shipping method — a recipe for disaster.

---

## Problem Solved

* Prevent accidental purchases of large/freight products
* Avoid Shopify Plus (>$2,400/month) checkout customization
* Keep a clean, theme-native UI without third-party apps
* Ensure no customer inquiry is missed

This project is **practical, reliable, and lightweight**.

---

## How It Works

**Plan:**

1. Detect freight products by **tag** (`freight`) or **price threshold** (`product.price > 100000` cents).
2. Hide the Add-to-Cart button.
3. Show a **Contact for Freight** button.
4. Open a **popup form** for customer details.
5. Store submissions in **Google Sheets**.
6. Send **email notifications** to the client and customer.

**Shopify Liquid Logic Example:**

```liquid
{% if product.tags contains 'freight' or product.price > 100000 %}
  <button id="contactFreightBtn">Contact for Freight</button>
  <style>
    #AddToCart { display:none !important; }
  </style>
{% endif %}
```

**Popup HTML (inline snippet in Liquid):**

```html
<div id="freightForm" class="popup">
  <h3>Contact for Freight</h3>
  <form id="freightSubmitForm">
    <input name="name" placeholder="Full Name" required />
    <input name="email" placeholder="Email" required />
    <input name="address" placeholder="Address" />
    <input name="phone" placeholder="Phone" />
    <textarea name="instruction" placeholder="Instruction"></textarea>
    <button type="submit">Send</button>
  </form>
  <p id="successMsg" style="display:none;">Request Sent</p>
</div>

<div id="freight-popup-body">
  <div class="freight-product">
    {% if product and product.featured_image %}
      <img src="{{ product.featured_image | img_url: '200x200' }}" alt="{{ product.title }}">
    {% endif %}
    <div>{{ product.title }}</div>
  </div>
</div>
```

---

## Installation & Deployment

### Prerequisites

* Shopify admin & theme editor (or Theme Kit / CLI)
* Google account to create Apps Script + Google Sheet
* Basic Git familiarity

### Steps

1. **Add snippet**
   Copy `/shopify/snippets/contact-freight.liquid` → theme `snippets/`
   Include in product template near Add-to-Cart:

```liquid
{% include 'contact-freight' %}
```

2. **Upload assets**
   Add `/shopify/assets/freight-popup.css` & `freight-popup.js` → theme `assets/`
   Ensure JS runs after product markup loads

3. **Google Apps Script**

   * Create a Google Sheet (e.g., `Contact-for-Freight - Submissions`)
   * Paste `/google-apps-script/Code.gs`
   * Update Sheet name & owner emails
   * Deploy as Web App (`Execute as: Me`, `Access: Anyone`)
   * Update JS fetch URL with `/exec` link

4. **Test everything** (popup, Sheets backup, email notifications)

---

## Email & Google Sheets

**Apps Script Submission Example:**

```javascript
function doPost(e) {
  var sheet = SpreadsheetApp.getActive().getSheetByName("Sheet1");
  var data = JSON.parse(e.postData.contents);

  sheet.appendRow([
    new Date(),
    data.name,
    data.email,
    data.address,
    data.phone,
    data.instruction
  ]);

  sendEmails(data);

  return ContentService.createTextOutput("Saved");
}
```

**Table-based Email Template for Gmail Compatibility:**

```html
<table style="width:100%; font-family:Arial;">
  <tr>
    <td>
      <h3 style="color:#222;">New Freight Request</h3>
      <p><b>Name:</b> {{name}}</p>
      <p><b>Email:</b> {{email}}</p>
      <p><b>Address:</b> {{address}}</p>
      <p><b>Phone:</b> {{phone}}</p>
      <p><b>Instruction:</b> {{instruction}}</p>
    </td>
  </tr>
</table>
```

**Note:** Redeploy Apps Script after every code change; update deployment ID in JS fetch URL.

---

## Security

* Use a shared token in JS payload:

```js
payload._token = "YOUR_SECRET_TOKEN";
```

* Validate in Apps Script:

```javascript
if (data._token !== "YOUR_SECRET_TOKEN") {
  return ContentService.createTextOutput("Forbidden").setMimeType(ContentService.MimeType.TEXT);
}
```

* Rotate token if compromised. Optional: add CAPTCHA or rate-limiting.

---

## Testing & Troubleshooting

* Popup shows correct product image/title
* Submission stored in Google Sheets
* Emails sent to client & customer
* Freight items hide Add-to-Cart; normal items unaffected

**Common issues:**

* Nothing saved → redeploy Apps Script, check logs
* Emails fail → check MailApp quotas
* Gmail layout broken → use inline styles, table-based layout
* CORS → `mode: "no-cors"` or configure server headers

---

## Customization

* Change detection logic: tag vs price
* Modify email templates or form fields
* Adjust CSS/JS for theme consistency

---

## QA / Curl Test

```bash
curl -X POST 'https://script.google.com/macros/s/YOUR_DEPLOY_ID/exec' \
  -H "Content-Type: application/json" \
  -d '{
    "_token":"YOUR_SECRET_TOKEN",
    "name":"Test User",
    "email":"test@example.com",
    "address":"123 Test Lane",
    "phone":"1234567890",
    "instruction":"Test request",
    "product_title":"Kart Frame - Demo"
  }'
```

---

## Changelog

* **v1.0** — Initial deployment
* **v1.1** — Added token validation
* **v1.2** — Updated popup styling & responsive improvements

---

## License

MIT — see [LICENSE](LICENSE)

---

## Outcome

* No wrong shipping at checkout
* Clean, theme-native popup workflow
* Data safely stored in Google Sheets
* Email alerts to client and customer
* Lightweight, practical, and reliable

This project demonstrates **real-world Shopify problem-solving without Shopify Plus or unnecessary apps** — just simple, effective, maintainable code.

---

**Author:** Saphal Adhikari
Follow my Medium for more no-BS Shopify stories.

---

This README blends **storytelling**, **practical setup**, and **production readiness**, making it top-tier for GitHub.

I can also create a **full repo structure** with `snippets`, `assets`, and `Apps Script` templates, ready to upload, if you want me to do that next. Do you want me to generate that?
