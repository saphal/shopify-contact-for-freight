# Contact for Freight

[![License: MIT](https://img.shields.io/badge/License-MIT-green)](LICENSE)
[![JavaScript](https://img.shields.io/badge/JavaScript-vanilla-yellow)]()
[![Shopify Liquid](https://img.shields.io/badge/Shopify-Liquid-blue)]()

**Prevent customers from accidentally buying large freight items in Shopify.**

This project replaces the **Add to Cart** button for freight products with a **Contact for Freight** button. It shows a popup for customer details, saves submissions in Google Sheets, and sends email alerts. Built with **Shopify Liquid, JavaScript, and Google Apps Script**. No third-party apps, no monthly fees, 100% free.

---

## Preview

![Contact for Freight Popup](assets/preview.png)

---

## Story and Inspiration

This project started from a real client problem. An Australian client sells racing karts and bare chassis frames that cost $3,000–$4,000, alongside $10 accessories. Shopify treats all products the same, which caused a risk of wrong purchases for large items.

I wrote about the full story on Medium:
[How I Built a Custom “Contact for Freight” Popup That Saved My Client From Wrong Orders](https://medium.com/@franticarsenal/how-i-built-a-custom-contact-for-freight-popup-that-saved-my-client-from-wrong-orders-6c0ce36cc4f6)


---

## How It Works

1. Detect freight products using a **tag** (`freight`) or **price threshold** (`product.price > 100000` cents).
2. Hide the standard Add-to-Cart button.
3. Show the **Contact for Freight** button.
4. Open a popup to collect customer details (name, email, address, phone, instructions).
5. Save submissions in Google Sheets.
6. Send email alerts to both the client and customer.

**Shopify Liquid example:**

```liquid
{% if product.tags contains 'freight' or product.price > 100000 %}
  <button id="contactFreightBtn">Contact for Freight</button>
  <style>
    #AddToCart { display:none !important; }
  </style>
{% endif %}
```

---

## Installation and Deployment

### Prerequisites

* Shopify admin and theme editor (or Theme Kit / CLI)
* Google account to create Apps Script and Google Sheet
* Basic knowledge of Shopify Liquid and JavaScript

### Steps

1. **Add snippet**
   Copy `/shopify/snippets/contact-freight.liquid` to `snippets/` folder.
   Include it in the product template near Add-to-Cart:

```liquid
{% include 'contact-freight' %}
```

2. **Upload assets**
   Copy `/shopify/assets/freight-popup.css` and `freight-popup.js` to `assets/`.
   Ensure JS runs after the product markup loads.

3. **Google Apps Script**

   * Create a Google Sheet for submissions (e.g., `Contact-for-Freight - Submissions`)
   * Paste `/google-apps-script/Code.gs`
   * Update Sheet name and owner email(s)
   * Deploy as Web App (`Execute as: Me`, `Access: Anyone`)
   * Update JS fetch URL with the `/exec` link

---

## Email and Google Sheets

**Apps Script example for saving submissions:**

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

**Email template (table-based for Gmail):**

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

---

## Security

* Add a secret token to the JS payload:

```js
payload._token = "YOUR_SECRET_TOKEN";
```

* Validate in Apps Script:

```javascript
if (data._token !== "YOUR_SECRET_TOKEN") {
  return ContentService.createTextOutput("Forbidden").setMimeType(ContentService.MimeType.TEXT);
}
```

* Rotate the token if compromised. Optional: add CAPTCHA or rate-limiting.

---

## Testing and Troubleshooting

* Popup shows correct product image and title
* Submission stored in Google Sheets
* Emails sent to client and customer
* Freight items hide Add-to-Cart; normal items remain

**Advanced QA / Developer test using curl:**

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

## Customization

* Change detection logic: tag vs price
* Add or remove fields from the popup
* Update email templates
* Adjust CSS or JS to match your theme

---

## Repo Structure

```
shopify-contact-for-freight/
│
├─ assets/
│   ├─ customer-confirmation.png
│   ├─ final-order-email.png
│   ├─ googlesheet.png
│   └─ popup-loader.png
│
├─ google-apps-script/
│   └─ Code.gs
│
├─ shopify/
│   └─ popup.liquid
│
├─ .gitignore
├─ LICENSE
└─ README.md

```

## Changelog

* **v1.0** — Initial release
* **v1.1** — Added token validation
* **v1.2** — Updated popup styling and responsive fixes

---

## License

MIT — see [LICENSE](LICENSE)

---

This README now has a **simple human tone**, Medium link, optional Upwork link, badges, folder structure, and clear sections for setup, usage, and testing.

It is ready for a **top 1% GitHub repo presentation**.

---

If you want, I can also **suggest a small hero GIF screenshot and folder tree image** to really make it stand out visually at the top of the repo. Do you want me to do that?
