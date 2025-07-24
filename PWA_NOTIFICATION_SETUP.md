# PWA Notification Setup Guide

## Overview

The DingDongDog app now includes PWA (Progressive Web App) notifications that alert all users when activities are added to the pet care schedule.

## Features Implemented

### ✅ **Service Worker**
- **Location**: `public/sw.js`
- **Functionality**: Handles push notifications, caching, and offline support
- **Features**:
  - Push notification handling
  - Notification click actions
  - Background sync support
  - Cache management

### ✅ **Notification Service**
- **Location**: `src/services/notificationService.ts`
- **Functionality**: Manages notification permissions and sending
- **Features**:
  - Permission management
  - Service worker registration
  - Local notification sending
  - Push subscription management

### ✅ **Notification Settings UI**
- **Location**: `src/components/NotificationSettings.tsx`
- **Functionality**: User interface for managing notification preferences
- **Features**:
  - Permission status display
  - Enable/disable toggle
  - Test notification button
  - Help text for blocked permissions

### ✅ **Activity Notifications**
- **Integration**: Automatically sends notifications when activities are logged
- **Content**: Includes activity type, time period, and who completed it
- **Timing**: Sent immediately when an activity is added

## How It Works

### 1. **Permission Request**
When users first access the app, they can enable notifications through the settings screen.

### 2. **Service Worker Registration**
The app automatically registers a service worker to handle notifications.

### 3. **Activity Logging**
When any user logs an activity (feed, walk, let out), the app:
- Saves the activity to the database
- Sends a notification to all users with permission granted
- Shows a success toast to the user who logged the activity

### 4. **Notification Display**
Users receive notifications with:
- Activity type (Feeding, Walking, Let Out)
- Time period (Morning, Afternoon, Evening)
- Who completed the activity
- Click actions to view the app

## Setup Instructions

### 1. **Icons Required**
Place the following icon files in the `public` directory:
```
public/
├── icon-72x72.png
├── icon-96x96.png
├── icon-128x128.png
├── icon-144x144.png
├── icon-152x152.png
├── icon-192x192.png
├── icon-384x384.png
└── icon-512x512.png
```

### 2. **Manifest File**
The `public/manifest.json` file is already configured with:
- App name and description
- Icon references
- PWA settings
- App shortcuts for quick actions

### 3. **Service Worker**
The `public/sw.js` file handles:
- Push notification events
- Notification click actions
- Background sync
- Cache management

## Usage

### **For Users**

1. **Enable Notifications**:
   - Go to Settings
   - Find "Notification Settings"
   - Toggle "Enable Notifications"
   - Grant permission when prompted

2. **Receive Notifications**:
   - Notifications appear when activities are logged
   - Click notifications to open the app
   - Use "Test Notification" to verify setup

3. **Manage Settings**:
   - Toggle notifications on/off
   - View permission status
   - Get help for blocked permissions

### **For Developers**

1. **Testing Notifications**:
   ```typescript
   // Send a test notification
   await notificationService.sendLocalNotification(
     'Test Title',
     'Test message',
     { type: 'test' }
   );
   ```

2. **Checking Permission Status**:
   ```typescript
   const status = notificationService.getPermissionStatus();
   // Returns: 'granted' | 'denied' | 'default'
   ```

3. **Sending Activity Notifications**:
   ```typescript
   // Automatically called when activities are logged
   await notificationService.sendNotificationToAll(
     'Feeding Completed',
     'John completed feeding for morning',
     { activityType: 'feed', timePeriod: 'morning' }
   );
   ```

## Browser Support

### **Supported Browsers**
- Chrome (Desktop & Mobile)
- Firefox (Desktop & Mobile)
- Safari (iOS 16.4+)
- Edge (Desktop & Mobile)

### **Requirements**
- HTTPS connection (required for service workers)
- Modern browser with service worker support
- User permission granted

## Production Deployment

### **For Real Push Notifications**

To implement server-to-client push notifications:

1. **Set up a Push Service**:
   - Firebase Cloud Messaging (FCM)
   - Web Push Protocol
   - Custom push service

2. **Generate VAPID Keys**:
   ```bash
   # Generate VAPID keys for web push
   npm install web-push
   npx web-push generate-vapid-keys
   ```

3. **Server Implementation**:
   - Store user subscriptions in database
   - Send push notifications from server
   - Handle delivery receipts

4. **Client Updates**:
   - Subscribe to push notifications
   - Store subscription in database
   - Handle push events

### **Environment Variables**
```env
# Add to your environment variables
NEXT_PUBLIC_VAPID_PUBLIC_KEY=your_vapid_public_key
VAPID_PRIVATE_KEY=your_vapid_private_key
```

## Troubleshooting

### **Common Issues**

1. **Notifications Not Working**:
   - Check browser permissions
   - Verify HTTPS connection
   - Check service worker registration

2. **Permission Denied**:
   - Guide users to browser settings
   - Show help text in notification settings
   - Provide manual enable instructions

3. **Service Worker Not Registering**:
   - Check file path (`/sw.js`)
   - Verify HTTPS requirement
   - Check browser console for errors

### **Debug Commands**
```javascript
// Check service worker status
navigator.serviceWorker.getRegistrations().then(registrations => {
  console.log('Service Workers:', registrations);
});

// Check notification permission
console.log('Permission:', Notification.permission);

// Test notification
new Notification('Test', { body: 'Test message' });
```

## Security Considerations

1. **Permission Management**: Only request when needed
2. **HTTPS Required**: Service workers require secure connection
3. **User Control**: Allow users to disable notifications
4. **Data Privacy**: Don't send sensitive data in notifications

## Future Enhancements

1. **Scheduled Notifications**: Remind users of upcoming activities
2. **Custom Notification Sounds**: Different sounds for different activities
3. **Rich Notifications**: Include images and more detailed information
4. **Notification History**: Track and display notification history
5. **Cross-Device Sync**: Sync notification preferences across devices

## Support

For issues or questions about PWA notifications:
1. Check browser console for errors
2. Verify all icon files are present
3. Test on different browsers
4. Check HTTPS requirement
5. Review permission settings 