"use client";

export default function TermsOfService() {
  const theme = {
    primary: '#e95420',
    dark: '#0a0a0a',
    surface: '#111111',
    text: '#ffffff',
    textMuted: '#888888',
    border: 'rgba(255,255,255,0.1)',
    gold: '#cfae81',
  };

  return (
    <div className="min-h-screen" style={{ backgroundColor: theme.dark, color: theme.text, fontFamily: 'system-ui, sans-serif', padding: '100px 20px' }}>
      <div style={{ maxWidth: '800px', margin: '0 auto' }}>
        <h1 style={{ fontSize: '3rem', color: theme.gold, marginBottom: '40px', fontWeight: 800 }}>Terms of Service</h1>

        <div style={{ lineHeight: '1.8', fontSize: '1.05rem' }}>
          <h2 style={{ color: theme.gold, marginTop: '40px', marginBottom: '20px' }}>OVERVIEW</h2>
          <p style={{ marginBottom: '20px' }}>
            This website is operated by Kioo Ngozi Leather. Throughout the site, the terms “we”, “us” and “our” refer to Kioo Ngozi Leather. Kioo Ngozi Leather offers this website, including all information, tools and Services available from this site to you, the user, conditioned upon your acceptance of all terms, conditions, policies and notices stated here.
          </p>
          <p style={{ marginBottom: '20px' }}>
            By visiting our site and/ or purchasing something from us, you engage in our “Service” and agree to be bound by the following terms and conditions (“Terms of Service”, “Terms”), including those additional terms and conditions and policies referenced herein and/or available by hyperlink.
          </p>

          <h2 style={{ color: theme.gold, marginTop: '40px', marginBottom: '20px' }}>SECTION 1 - ONLINE STORE TERMS</h2>
          <p style={{ marginBottom: '20px' }}>
            By agreeing to these Terms of Service, you represent that you are at least the age of majority in your state or province of residence. You may not use our products for any illegal or unauthorized purpose nor may you, in the use of the Service, violate any laws in your jurisdiction.
          </p>

          <h2 style={{ color: theme.gold, marginTop: '40px', marginBottom: '20px' }}>SECTION 2 - GENERAL CONDITIONS</h2>
          <p style={{ marginBottom: '20px' }}>
            We reserve the right to refuse Service to anyone for any reason at any time. You agree not to reproduce, duplicate, copy, sell, resell or exploit any portion of the Service without express written permission by us.
          </p>

          <h2 style={{ color: theme.gold, marginTop: '40px', marginBottom: '20px' }}>SECTION 3 - MODIFICATIONS TO THE SERVICE AND PRICES</h2>
          <p style={{ marginBottom: '20px' }}>
            Prices for our products are subject to change without notice. We reserve the right at any time to modify or discontinue the Service (or any part or content thereof) without notice at any time.
          </p>

          <h2 style={{ color: theme.gold, marginTop: '40px', marginBottom: '20px' }}>SECTION 4 - PRODUCTS OR SERVICES</h2>
          <p style={{ marginBottom: '20px' }}>
            Certain products or Services may be available exclusively online through the website. These products or Services may have limited quantities and are subject to return or exchange only according to our Refund Policy.
          </p>

          <h2 style={{ color: theme.gold, marginTop: '40px', marginBottom: '20px' }}>SECTION 5 - ACCURACY OF BILLING AND ACCOUNT INFORMATION</h2>
          <p style={{ marginBottom: '20px' }}>
            We reserve the right to refuse any order you place with us. We may, in our sole discretion, limit or cancel quantities purchased per person, per household or per order.
          </p>

          <h2 style={{ color: theme.gold, marginTop: '40px', marginBottom: '20px' }}>SECTION 6 - PROHIBITED USES</h2>
          <p style={{ marginBottom: '20px' }}>
            In addition to other prohibitions, you are prohibited from using the site or its content: (a) for any unlawful purpose; (b) to solicit others to perform or participate in any unlawful acts; (c) to infringe upon or violate our intellectual property rights or the intellectual property rights of others.
          </p>

          <h2 style={{ color: theme.gold, marginTop: '40px', marginBottom: '20px' }}>SECTION 7 - CONTACT INFORMATION</h2>
          <p style={{ marginBottom: '20px' }}>
            Questions about the Terms of Service should be sent to us at kiongozileather@gmail.com.<br/>
            <strong>KONGOZI LEATHER</strong><br/>
            Mithoo Business Center, Moi Avenue<br/>
            PHONE NUMBER: 0742507786 / +254 111 955 273<br/>
            BUSINESS REG NO: PVT-5JUZP85A<br/>
            VAT NUMBER: P052416296Q
          </p>

          <div style={{ marginTop: '60px', borderTop: `1px solid ${theme.border}`, paddingTop: '40px' }}>
            <a href="/" style={{ color: theme.primary, textDecoration: 'none', fontWeight: 700 }}>← Back to Home</a>
          </div>
        </div>
      </div>
    </div>
  );
}
