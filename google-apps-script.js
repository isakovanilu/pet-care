/**
 * Google Apps Script for Pet Care Booking System
 * 
 * INSTRUCTIONS:
 * 1. Open Google Sheets and create a new spreadsheet
 * 2. Go to Extensions > Apps Script
 * 3. Delete the default code and paste this entire file
 * 4. Update the SPREADSHEET_ID (see instructions below)
 * 5. Click "Deploy" > "New deployment"
 * 6. Select type: "Web app"
 * 7. Execute as: "Me"
 * 8. Who has access: "Anyone"
 * 9. Click "Deploy"
 * 10. Copy the Web App URL and paste it into config/sheets.config.js
 */

// REPLACE THIS WITH YOUR SPREADSHEET ID
// To find it: Open your Google Sheet, look at the URL
// Example: https://docs.google.com/spreadsheets/d/SPREADSHEET_ID_HERE/edit
const SPREADSHEET_ID = 'YOUR_SPREADSHEET_ID_HERE';

// Sheet name where data will be written
const SHEET_NAME = 'Bookings';

/**
 * Main function to handle POST requests
 */
function doPost(e) {
  try {
    let data;
    
    // Handle different request formats
    if (e.postData && e.postData.contents) {
      // Try to parse as JSON first
      try {
        data = JSON.parse(e.postData.contents);
      } catch (jsonError) {
        // If not JSON, try to get from form data
        const params = e.parameter;
        if (params && params.data) {
          data = JSON.parse(params.data);
        } else {
          // Try to parse as URL-encoded form data
          const formData = e.postData.contents;
          const dataParam = formData.split('data=')[1];
          if (dataParam) {
            const decoded = decodeURIComponent(dataParam);
            data = JSON.parse(decoded);
          } else {
            throw new Error('Unable to parse request data');
          }
        }
      }
    } else if (e.parameter && e.parameter.data) {
      // Handle form data
      data = JSON.parse(e.parameter.data);
    } else {
      throw new Error('No data received');
    }
    
    // Get the spreadsheet
    const spreadsheet = SpreadsheetApp.openById(SPREADSHEET_ID);
    let sheet = spreadsheet.getSheetByName(SHEET_NAME);
    
    // Create sheet if it doesn't exist
    if (!sheet) {
      sheet = spreadsheet.insertSheet(SHEET_NAME);
      // Add headers
      sheet.appendRow([
        'Booking ID',
        'Date Submitted',
        'Services',
        'Service IDs',
        'Total Amount',
        'Date & Time',
        'Address',
        'Telephone',
        'Email',
        'Status'
      ]);
      // Format header row
      const headerRange = sheet.getRange(1, 1, 1, 10);
      headerRange.setFontWeight('bold');
      headerRange.setBackground('#4285f4');
      headerRange.setFontColor('#ffffff');
    }
    
    // Prepare row data
    const rowData = [
      data.id || '',
      data.createdAt || new Date().toISOString(),
      data.serviceNames || '',
      data.serviceIds ? data.serviceIds.join(', ') : '',
      data.amount || 0,
      data.dateFormatted || '',
      data.address || '',
      data.telephone || '',
      data.email || '',
      data.status || 'pending'
    ];
    
    // Append the row
    sheet.appendRow(rowData);
    
    // Auto-resize columns
    sheet.autoResizeColumns(1, 10);
    
    // Return success response with CORS headers
    const output = ContentService.createTextOutput(
      JSON.stringify({ success: true, message: 'Booking saved successfully' })
    );
    output.setMimeType(ContentService.MimeType.JSON);
    return output;
    
  } catch (error) {
    // Log error for debugging
    Logger.log('Error in doPost: ' + error.toString());
    Logger.log('Error stack: ' + error.stack);
    
    // Return error response
    const output = ContentService.createTextOutput(
      JSON.stringify({ success: false, error: error.toString() })
    );
    output.setMimeType(ContentService.MimeType.JSON);
    return output;
  }
}

/**
 * Handle GET requests (for testing)
 */
function doGet(e) {
  return ContentService.createTextOutput(
    JSON.stringify({ 
      success: true, 
      message: 'Google Apps Script is working!',
      instructions: 'Send POST requests with booking data in the "data" parameter as JSON string'
    })
  ).setMimeType(ContentService.MimeType.JSON);
}

/**
 * Test function - you can run this to test the script
 */
function test() {
  const testData = {
    id: 'test_123',
    createdAt: new Date().toISOString(),
    serviceNames: 'Pop In, Walking',
    serviceIds: [4, 2],
    amount: 50,
    dateFormatted: 'December 07, 2025 02:30 PM',
    address: '123 Test Street',
    telephone: '(555) 123-4567',
    email: 'test@example.com',
    status: 'pending'
  };
  
  const mockEvent = {
    postData: {
      contents: JSON.stringify(testData)
    }
  };
  
  const result = doPost(mockEvent);
  Logger.log(result.getContent());
}

