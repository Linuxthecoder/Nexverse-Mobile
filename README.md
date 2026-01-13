🚀 NEXVERSE MOBILE APP | TERMUX DEPLOYMENT GUIDE

─── [ STEP 1: PREPARE ENVIRONMENT ] ───
1. Open Termux and update system:
   pkg update && pkg upgrade -y

2. Install Git and Node.js:
   pkg install git nodejs -y

3. Clone the repository:
   git clone https://github.com/Linuxthecoder/Nexverse-Mobile-app-.git


─── [ STEP 2: BACKEND SETUP (Tab 1) ] ───
1. Navigate to backend folder:
   cd Nexverse-Mobile-app-/backend

2. Install dependencies:
   npm install

3. Update security packages:
   npm update jwa jws jsonwebtoken

4. Start the Backend Server:
   npm run dev

   (⚠️ KEEP THIS TERMINAL OPEN)


─── [ STEP 3: FRONTEND SETUP (Tab 2) ] ───
*Swipe from the left edge → Select 'New Session'*

1. Navigate to mobile app folder:
   cd Nexverse-Mobile-app-/NexverseMoible

2. Install dependencies:
   npm install

⚠️ CRITICAL CONFIGURATION:
   Before starting, edit your config file.
   Change 'localhost' to your mobile IP Address.
   (Example: http://192.168.1.XXX:5001)

3. Start the Expo App:
   npx expo start


_________ BOOM: SYSTEM ONLINE _________
