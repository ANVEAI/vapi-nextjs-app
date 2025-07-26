# VAPI Voice Bot Deployment System

## Overview

This Next.js application provides an improved bot creation and deployment system with automatic embed code generation and a 24-hour activation schedule with manual override capabilities.

## Key Features

### 🤖 Bot Creation
- **4-Step Wizard**: Easy bot configuration with validation
- **Knowledge Base Support**: Upload documents or provide URLs for RAG
- **Instant Embed Code**: Generated immediately upon bot creation
- **24-Hour Activation**: Bots are scheduled for activation within 24 hours

### 📋 Embed Code System
- **Immediate Generation**: Embed codes are created instantly
- **Smart Widget**: Shows pending status until activation
- **Responsive Design**: Works on all devices and screen sizes
- **Navigation Support**: Built-in website navigation capabilities

### ⚙️ Activation Management
- **Automatic Scheduling**: Bots activate automatically after 24 hours
- **Manual Override**: Admin panel for immediate activation
- **Status Tracking**: Real-time status updates (pending → activating → active)
- **Fallback Support**: Manual activation if automatic process fails

## How It Works

### 1. Bot Creation Process
```
User Creates Bot → Generate UUID → Create Embed Code → Schedule Activation → Show Embed Modal
```

### 2. Embed Code Structure
```html
<script defer src="http://localhost:3001/js/external-chatbot-voice.js" 
        data-chatbot-uuid="[BOT_UUID]" 
        data-language="en" 
        data-position="right" 
        data-theme="light">
</script>
```

### 3. Widget States
- **Pending**: Orange widget with tooltip "Voice bot activating within 24 hours"
- **Activating**: Blue widget with processing animation
- **Active**: Green widget with full voice functionality

### 4. Activation Timeline
```
Bot Created → Pending (24h) → Auto-Activation → Active
                    ↓
              Manual Override Available
```

## API Endpoints

### Bot Management
- `POST /api/bots/create` - Create new bot with embed code
- `GET /api/bots/create` - List user's bots
- `GET /api/bots/status/[uuid]` - Check bot activation status

### Admin Functions
- `POST /api/admin/activate-bot` - Manual bot activation/deactivation
- `GET /api/admin/activate-bot` - List bots for activation management

### Navigation Support
- `POST /api/vapi/navigation` - Log navigation commands

## User Experience

### For End Users (Website Visitors)
1. **Pending State**: See orange widget with "activating soon" message
2. **Active State**: Click widget to start voice conversation
3. **Navigation**: Say "open google.com" or "go to example.com" for navigation

### For Bot Creators
1. **Create Bot**: Use 4-step wizard to configure bot
2. **Get Embed Code**: Immediately receive embed code in modal
3. **Deploy Code**: Add to website HTML before `</body>` tag
4. **Wait for Activation**: Bot activates within 24 hours
5. **Manual Override**: Use Settings → Admin Panel if needed

## Technical Implementation

### Frontend Components
- `CreateBotModal.tsx` - 4-step bot creation wizard
- `BotEmbedModal.tsx` - Embed code display and instructions
- `AdminPanel.tsx` - Manual activation management
- `DashboardContent.tsx` - Main dashboard with bot management

### Backend Services
- Bot creation with UUID generation
- Embed code generation
- Activation scheduling
- Status tracking
- VAPI integration (when activated)

### JavaScript Widget
- `external-chatbot-voice.js` - Embeddable widget script
- Automatic status checking
- Responsive design
- Navigation command handling

## Deployment Checklist

### Production Setup
1. **Environment Variables**
   ```
   NEXT_PUBLIC_APP_URL=https://yourdomain.com
   VAPI_API_KEY=your_vapi_key
   CLERK_PUBLISHABLE_KEY=your_clerk_key
   CLERK_SECRET_KEY=your_clerk_secret
   ```

2. **Database Migration**
   - Replace in-memory storage with persistent database
   - Implement bot registry with proper schema
   - Add user-bot relationships

3. **VAPI Integration**
   - Configure proper VAPI assistant creation
   - Set up knowledge base integration
   - Implement voice configuration

4. **Automation**
   - Set up cron job for automatic activation
   - Implement email notifications
   - Add monitoring and logging

### Manual Activation Process
1. Navigate to Dashboard → Settings
2. Use Admin Panel to view pending bots
3. Click "Activate Now" for immediate activation
4. Monitor status changes in real-time

## Benefits Over Previous System

### ✅ Improvements
- **Instant Embed Codes**: No waiting for bot creation
- **Better UX**: Clear status indicators and instructions
- **Fallback System**: Manual activation if auto-process fails
- **Professional Appearance**: Polished embed modal and widget
- **Responsive Design**: Works on all devices
- **Status Tracking**: Real-time activation monitoring

### 🔧 Maintenance
- **24-Hour Buffer**: Allows time for manual intervention
- **Admin Controls**: Easy manual activation management
- **Error Handling**: Graceful fallbacks for failed activations
- **User Communication**: Clear messaging about activation timeline

## Support Workflow

### If Bot Doesn't Activate
1. Check Admin Panel for bot status
2. Use manual activation if needed
3. Verify VAPI integration
4. Contact technical support if issues persist

### Common Issues
- **Embed Code Not Working**: Check bot activation status
- **Widget Not Appearing**: Verify script placement in HTML
- **Voice Not Working**: Confirm bot is in "active" status
- **Navigation Issues**: Check navigation API endpoint

This system provides a robust, user-friendly bot deployment experience with professional embed codes and reliable activation management.
