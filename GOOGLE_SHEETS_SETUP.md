# Google Sheets Integration Setup Guide

This guide will help you set up Google Sheets to automatically receive booking data from your Pet Care app.

## Step 1: Create a Google Sheet

1. Go to [Google Sheets](https://sheets.google.com)
2. Create a new spreadsheet
3. Name it "Pet Care Bookings" (or any name you prefer)
4. **Copy the Spreadsheet ID from the URL:**
   - The URL looks like: `https://docs.google.com/spreadsheets/d/SPREADSHEET_ID_HERE/edit`
   - Copy the part between `/d/` and `/edit`

## Step 2: Set Up Google Apps Script

1. In your Google Sheet, go to **Extensions** > **Apps Script**
2. Delete all the default code
3. Open the file `google-apps-script.js` from this project
4. Copy the entire contents
5. Paste it into the Apps Script editor
6. **Replace `YOUR_SPREADSHEET_ID_HERE`** with your actual Spreadsheet ID (from Step 1)

## Step 3: Deploy as Web App

1. In the Apps Script editor, click **Deploy** > **New deployment**
2. Click the gear icon (⚙️) next to "Select type"
3. Choose **Web app**
4. Set the following:
   - **Description:** "Pet Care Bookings API" (or any description)
   - **Execute as:** Me (your email)
   - **Who has access:** Anyone
5. Click **Deploy**
6. **Copy the Web App URL** that appears (it will look like: `https://script.google.com/macros/s/...`)

**Important:** If you update the script code later, you need to:
- Click **Deploy** > **Manage deployments**
- Click the pencil icon (✏️) to edit
- Click **New version**
- Click **Deploy**
- The URL will remain the same

## Step 4: Configure the App

1. Open `config/sheets.config.js` in this project
2. Paste your Web App URL into the `GOOGLE_SHEETS_WEB_APP_URL` variable:

```javascript
export const GOOGLE_SHEETS_WEB_APP_URL = 'https://script.google.com/macros/s/YOUR_SCRIPT_ID/exec';
```

3. Save the file

## Step 5: Test

1. Start your app: `npm start`
2. Fill out a booking form
3. Submit it
4. Check your Google Sheet - you should see a new row with the booking data!

## Troubleshooting

### "Bad Request" or "400 Error"
1. **Check the Spreadsheet ID:**
   - Make sure you replaced `YOUR_SPREADSHEET_ID_HERE` with your actual Spreadsheet ID
   - The ID is in the URL: `https://docs.google.com/spreadsheets/d/SPREADSHEET_ID_HERE/edit`

2. **Redeploy the script:**
   - After making any changes to the script, you must create a new version and redeploy
   - Go to **Deploy** > **Manage deployments** > Edit > **New version** > **Deploy**

3. **Check the Web App URL:**
   - Make sure the URL in `config/sheets.config.js` matches exactly
   - The URL should end with `/exec` (not `/dev`)

4. **Test the script:**
   - In Apps Script editor, click **Run** > Select `doGet` > Click Run
   - This will test if the script can access your sheet
   - Check **Executions** tab for any errors

### "Script not found" error
- Make sure you copied the correct Web App URL
- Make sure the deployment is set to "Anyone" access
- Try redeploying the script

### Data not appearing in sheet
- Check the Apps Script execution log: **Executions** in the Apps Script editor
- Make sure the Spreadsheet ID is correct in the script
- Verify the sheet name is "Bookings" (or update it in the script)
- Check browser console (F12) for any error messages

### CORS errors
- The script uses `no-cors` mode, which should work with Google Apps Script
- If you see errors, make sure the Web App URL is correct
- The script handles both JSON and form-encoded data

## Sheet Structure

The script will automatically create a sheet named "Bookings" with these columns:
- Booking ID
- Date Submitted
- Services
- Service IDs
- Total Amount
- Date & Time
- Address
- Telephone
- Email
- Status

## Security Note

The Web App URL allows anyone to write to your sheet. For production use, consider:
- Adding authentication to the Apps Script
- Using a service account with Google Sheets API
- Implementing rate limiting

