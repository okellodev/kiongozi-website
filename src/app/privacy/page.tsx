"use client";

import { useState, useEffect } from 'react';

export default function PrivacyPolicy() {
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
        <h1 style={{ fontSize: '3rem', color: theme.gold, marginBottom: '40px', fontWeight: 800 }}>Privacy Policy</h1>
        <p style={{ color: theme.textMuted, marginBottom: '30px' }}>Last updated: October 8, 2025</p>

        <div style={{ lineHeight: '1.8', fontSize: '1.05rem' }}>
          <p style={{ marginBottom: '20px' }}>
            This Privacy Policy describes how Kioo Ngozi Leather (the "Site", "we", "us", or "our") collects, uses, and discloses your personal information when you visit, use our services, or make a purchase from kioongozileather.com (the "Site") or otherwise communicate with us regarding the Site (collectively, the "Services"). For purposes of this Privacy Policy, "you" and "your" means you as the user of the Services, whether you are a customer, website visitor, or another individual whose information we have collected pursuant to this Privacy Policy.
          </p>
          
          <p style={{ marginBottom: '20px' }}>
            Please read this Privacy Policy carefully. By using and accessing any of the Services, you agree to the collection, use, and disclosure of your information as described in this Privacy Policy. If you do not agree to this Privacy Policy, please do not use or access any of the Services.
          </p>

          <h2 style={{ color: theme.gold, marginTop: '40px', marginBottom: '20px' }}>Changes to This Privacy Policy</h2>
          <p style={{ marginBottom: '20px' }}>
            We may update this Privacy Policy from time to time, including to reflect changes to our practices or for other operational, legal, or regulatory reasons. We will post the revised Privacy Policy on the Site, update the "Last updated" date and take any other steps required by applicable law.
          </p>

          <h2 style={{ color: theme.gold, marginTop: '40px', marginBottom: '20px' }}>How We Collect and Use Your Personal Information</h2>
          <p style={{ marginBottom: '20px' }}>
            To provide the Services, we collect personal information about you from a variety of sources, as set out below. The information that we collect and use varies depending on how you interact with us.
          </p>
          <p style={{ marginBottom: '20px' }}>
            In addition to the specific uses set out below, we may use information we collect about you to communicate with you, provide or improve the Services, comply with any applicable legal obligations, enforce any applicable terms of service, and to protect or defend the Services, our rights, and the rights of our users or others.
          </p>

          <h2 style={{ color: theme.gold, marginTop: '40px', marginBottom: '20px' }}>What Personal Information We Collect</h2>
          <p style={{ marginBottom: '20px' }}>
            The types of personal information we obtain about you depends on how you interact with our Site and use our Services. When we use the term "personal information", we are referring to information that identifies, relates to, describes or can be associated with you.
          </p>

          <h3 style={{ color: theme.primary, marginTop: '30px', marginBottom: '15px' }}>Information We Collect Directly from You</h3>
          <ul style={{ paddingLeft: '20px', marginBottom: '20px' }}>
            <li>Contact details including your name, address, phone number, and email.</li>
            <li>Order information including your name, billing address, shipping address, payment confirmation, email address, and phone number.</li>
            <li>Account information including your username, password, security questions and other information used for account security purposes.</li>
            <li>Shopping information including the items you view, put in your cart, saved into your account like loyalty points, reviews, referrals or gift cards, or purchases.</li>
            <li>Customer support information including the information you choose to include in communications with us.</li>
          </ul>

          <h3 style={{ color: theme.primary, marginTop: '30px', marginBottom: '15px' }}>Information We Collect about Your Usage</h3>
          <p style={{ marginBottom: '20px' }}>
            We may also automatically collect certain information about your interaction with the Services ("Usage Data"). To do this, we may use cookies, pixels and similar technologies ("Cookies"). Usage Data may include information about how you access and use our Site and your account, including device information, browser information, information about your network connection, your IP address and other information regarding your interaction with the Services.
          </p>

          <h2 style={{ color: theme.gold, marginTop: '40px', marginBottom: '20px' }}>Security and Retention</h2>
          <p style={{ marginBottom: '20px' }}>
            Please be aware that no security measures are perfect or impenetrable, and we cannot guarantee “perfect security.” In addition, any information you send to us may not be secure while in transit. We recommend that you do not use insecure channels to communicate sensitive or confidential information to us.
          </p>

          <h2 style={{ color: theme.gold, marginTop: '40px', marginBottom: '20px' }}>Contact</h2>
          <p style={{ marginBottom: '20px' }}>
            Should you have any questions about our privacy practices or this Privacy Policy, or if you would like to exercise any of the rights available to you, please call or email us at kiongozileather@gmail.com or contact us at Moi Avenue, Mithoo Business Center, 3rd Floor Shop T45, Nairobi, 01000, KE.
          </p>

          <div style={{ marginTop: '60px', borderTop: `1px solid ${theme.border}`, paddingTop: '40px' }}>
            <a href="/" style={{ color: theme.primary, textDecoration: 'none', fontWeight: 700 }}>← Back to Home</a>
          </div>
        </div>
      </div>
    </div>
  );
}
