# Pet Care App

A modern React Native web application for pet care services, featuring pet management, service booking, and a beautiful user interface.

## 🌟 Features

- 🐾 **Pet Management** - Add, edit, and manage multiple pets with photos (stored locally)
- 📅 **Service Booking** - Book pet care services (Pop In, Walking, Sitting, Grooming)
- 💾 **Local Storage** - All data persists in browser localStorage (no backend required)
- 🎨 **Modern UI** - Beautiful, intuitive interface with dark/light mode support
- 📱 **Responsive Design** - Works seamlessly on web browsers

## 🚀 Quick Start

### Prerequisites

- Node.js 18 or higher
- npm or yarn

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/YOUR_USERNAME/pet-care-app.git
   cd pet-care-app
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Start the development server**
   ```bash
   npm start
   ```

4. **Open in browser**
   - Press `w` to open in web browser
   - Or visit the URL shown in the terminal

## 📦 Available Services

- **Pop In** - $25 per visit
- **Walking** - $25 per walk
- **Sitting** - $75 per day
- **Grooming** - $50 per session

## 🛠️ Tech Stack

- **React Native** - Cross-platform framework
- **Expo** - Development platform
- **React Navigation** - Navigation library
- **React Native Vector Icons** - Icon library
- **date-fns** - Date formatting

## 📁 Project Structure

```
pet-care/
├── App.js                 # Main app component
├── app.json              # Expo configuration
├── netlify.toml          # Netlify deployment config
├── src/
│   ├── navigation/       # Navigation setup
│   ├── screens/          # App screens
│   │   ├── HomeScreen.js      # Booking form
│   │   ├── pets/              # Pet management
│   │   ├── bookings/          # Booking history
│   │   └── ProfileScreen.js   # User profile
│   ├── context/         # Theme context
│   └── utils/           # Helper functions
└── config/              # Configuration files
```

## 🌐 Deployment

### Deploy to Netlify

See [DEPLOYMENT.md](./DEPLOYMENT.md) for detailed deployment instructions.

**Quick deploy:**
1. Push code to GitHub
2. Connect repository to Netlify
3. Build command: `npm run build:web`
4. Publish directory: `web-build`
5. Deploy!

## 💾 Data Storage

The app uses browser `localStorage` to store:
- Pet information
- Booking history
- Theme preferences

**Note:** Data is stored locally in the browser and will persist until the user clears their browser data.

## 🎨 Features in Detail

### Booking System
- Select multiple services
- Choose date and time
- Enter address (with autocomplete suggestions)
- Phone number validation
- Email validation
- Save bookings to localStorage

### Pet Management
- Add pets with photos
- Edit pet information
- Delete pets
- View all pets in a list

### Theme Support
- Dark mode / Light mode toggle
- Persistent theme preference
- Smooth theme transitions

## 🔧 Development

### Available Scripts

- `npm start` - Start Expo development server
- `npm run web` - Start web development server
- `npm run build:web` - Build for web production
- `npm run android` - Run on Android
- `npm run ios` - Run on iOS

### Code Structure

- **Screens**: Individual screen components in `src/screens/`
- **Navigation**: Navigation setup in `src/navigation/`
- **Context**: Theme management in `src/context/`
- **Utils**: Helper functions in `src/utils/`

## 📝 Notes

- Authentication is currently disabled (app works without login)
- Firebase integration is optional (not required for basic functionality)
- Stripe payment integration is disabled (can be enabled if needed)
- All data is stored locally in the browser

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## 📄 License

This project is licensed under the MIT License.

## 🙏 Support

For issues and questions, please open an issue on the repository.
