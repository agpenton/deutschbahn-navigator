# 🔑 Deutsche Bahn API Key Setup Guide

This guide walks you through getting your Deutsche Bahn API credentials to use the MCP extension.

## Quick Start

1. **Register**: [Deutsche Bahn API Marketplace](https://developers.deutschebahn.com/db-api-marketplace/apis/user/login)
2. **Create Application**: Get your Client ID and API Key
3. **Subscribe to APIs**: Enable the services you need
4. **Configure Extension**: Add credentials to Claude Desktop

---

## Step-by-Step Process

### 1. 🎯 Register at DB API Marketplace

**Go to**: [https://developers.deutschebahn.com/db-api-marketplace/apis/user/login](https://developers.deutschebahn.com/db-api-marketplace/apis/user/login)

1. Click "**Weiter mit DB Kundenkonto**" (Continue with DB Customer Account)
2. You'll be redirected to the DB Customer Account page

### 2. 🏠 Create/Login to DB Customer Account

**New Users:**
- Click "**Registrieren**" (Register)  
- Fill in your personal details
- Verify your email address with the confirmation code
- Complete registration

**Existing Users:**
- Click "**Anmelden**" (Login)
- Use your existing DB account credentials

After login, grant permission for the API Marketplace to use your data.

### 3. 📱 Create an Application

**Go to**: [Create New Application](https://developers.deutschebahn.com/db-api-marketplace/apis/application/new)

Fill in the application form:
- **Title**: `Deutsche Bahn MCP Extension` (or any descriptive name)
- **Description**: `MCP extension for Claude Desktop to access Deutsche Bahn services`
- **OAuth Redirect URLs**: Leave empty (not required for this use case)

Click "**Application erstellen**" (Create Application)

### 4. 🔐 Save Your Credentials

⚠️ **CRITICAL**: After creating the application, you'll see your credentials **ONLY ONCE**!

**Copy and save these immediately:**
- **Client ID**: `your-client-id-here`
- **Client Secret (API Key)**: `your-secret-key-here`

💡 Store these in a password manager or secure note-taking app.

### 5. 📋 Subscribe to APIs

**Go to**: [API Catalog](https://developers.deutschebahn.com/db-api-marketplace/apis/product)

Subscribe to these APIs for full functionality:

#### Required APIs:
1. **[Timetables](https://developers.deutschebahn.com/db-api-marketplace/apis/product/timetables)**
   - For departures and arrivals
   - Click → Select plan → "Abonnieren" → Choose your application

2. **[StaDa (Station Data)](https://developers.deutschebahn.com/db-api-marketplace/apis/product/stada)**
   - For station information
   - Click → Select plan → "Abonnieren" → Choose your application

3. **[FaSta (Facility Status)](https://developers.deutschebahn.com/db-api-marketplace/apis/product/fasta)**
   - For elevator/escalator status
   - Click → Select plan → "Abonnieren" → Choose your application

#### Optional APIs:
- **Journey Planning APIs** (if available)
- **Parking Information**
- **Regional transport APIs**

### 6. ⚙️ Configure the MCP Extension

After installing the Deutsche Bahn MCP extension in Claude Desktop:

1. **Open Claude Desktop Settings**
2. **Go to Extensions**
3. **Find "Deutsche Bahn Transport"**
4. **Configure the settings:**

```json
{
  "db_api_key": "your-client-secret-here",
  "db_client_id": "your-client-id-here", 
  "request_timeout": 30000,
  "max_retries": 3
}
```

### 7. ✅ Test Your Setup

Try these commands in Claude Desktop:

- **Search stations**: "Find train stations near Munich"
- **Get departures**: "Show departures from Berlin Hauptbahnhof"
- **Check facilities**: "Are the elevators working at Frankfurt Main station?"

---

## 🔧 API Authentication Details

The extension uses these authentication headers:
- `DB-Client-Id`: Your Client ID
- `DB-Api-Key`: Your Client Secret (API Key)

## 📊 Rate Limits

Deutsche Bahn APIs have rate limits:
- **Free tier**: Usually 1000 requests/day
- **Paid tiers**: Higher limits available
- **Retry logic**: Extension automatically retries failed requests

## 🛠️ Troubleshooting

### Common Issues:

**401 Unauthorized**
- Check your API key and Client ID
- Ensure you've subscribed to the required APIs
- Verify credentials are correctly configured

**429 Rate Limited** 
- You've hit the API rate limit
- Wait before making more requests
- Consider upgrading your plan

**API Not Available**
- Some APIs may have maintenance periods
- Check [DB API Status](https://developers.deutschebahn.com/db-api-marketplace/apis/news)

### Get Help:

- **GitHub Issues**: [Report bugs](https://github.com/agpenton/deutschebahn/issues)
- **DB Support**: [Contact Deutsche Bahn](https://developers.deutschebahn.com/db-api-marketplace/apis/contact)
- **Documentation**: [API Docs](https://developers.deutschebahn.com/db-api-marketplace/apis/product)

---

## 🆓 Free vs Paid Plans

**Free Plan Includes:**
- 1000 API calls per day
- All basic functionality
- Real-time data access

**Paid Plans Offer:**
- Higher rate limits
- Premium support
- Advanced features
- SLA guarantees

Most users find the free plan sufficient for personal use!

---

## 🔒 Security Notes

- **Never share** your API key publicly
- **Don't commit** credentials to version control
- **Use environment variables** in development
- **Regenerate keys** if compromised

The Claude Desktop extension stores your credentials securely and only uses them for Deutsche Bahn API requests.

---

**Ready to start?** 🚀 [Register now](https://developers.deutschebahn.com/db-api-marketplace/apis/user/login) and get your Deutsche Bahn API access!
