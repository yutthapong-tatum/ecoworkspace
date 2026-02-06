import { dataManager } from '../data.js';

export function renderTabletApp(container) {
  const render = () => {
    const users = dataManager.getUsers();
    // Simulate being mounted at "Goku" (ID: 1001)
    const currentRoom = dataManager.getRoom(1001);
    if (!currentRoom) return;

    const isAvailable = currentRoom.status === 'available';
    const statusColor = isAvailable ? '#4ade80' : '#f87171';
    const statusText = isAvailable ? 'AVAILABLE' : 'OCCUPIED';

    container.innerHTML = `
    <div style="width: 100%; height: 100vh; display: flex; ">
      
      <!-- Left Panel: Status -->
      <div style="flex: 1; background: ${isAvailable ? 'rgba(74, 222, 128, 0.2)' : 'rgba(248, 113, 113, 0.2)'}; backdrop-filter: blur(40px); display: flex; flex-direction: column; justify-content: center; align-items: center; border-right: 1px solid rgba(255,255,255,0.1);">
        <h1 style="font-size: 4rem; font-weight: 800; color: ${statusColor}; text-shadow: 0 0 20px ${statusColor}66;">${statusText}</h1>
        <h1 class="text-h1" style="font-size: 3rem; margin-bottom: 10px;">
          ${currentRoom.name} <span style="font-size: 1.5rem; opacity: 0.6; vertical-align: middle;">#${currentRoom.id}</span>
        </h1>
        <p class="text-h3" style="opacity: 0.7;">Until 2:00 PM</p>
        
        <button class="glass-btn" style="margin-top: 40px; font-size: 1.2rem; padding: 20px 40px;" onclick="document.getElementById('checkin-modal').classList.remove('hidden')">
          👉 Check In / Book
        </button>
      </div>

      <!-- Right Panel: Schedule -->
      <div style="width: 350px; background: rgba(0,0,0,0.2); padding: 40px;">
        <h3 class="text-h2">Today's Schedule</h3>
        <div style="margin-top: 20px; display: flex; flex-direction: column; gap: 16px;">
          
          <!-- Schedule Item -->
          <div class="glass-card" style="opacity: 0.5;">
            <div class="flex-row" style="justify-content: space-between;">
              <span style="font-weight: 600;">09:00 - 10:00</span>
              <span>✅ Done</span>
            </div>
            <p class="text-sm">Morning Cleaning</p>
          </div>

          <!-- Active Item -->
          <div class="glass-card" style="border-left: 4px solid ${statusColor}; background: rgba(255,255,255,0.1);">
             <div class="flex-row" style="justify-content: space-between;">
              <span style="font-weight: 600;">10:00 - 14:00</span>
              <span>👀 Now</span>
            </div>
            <p class="text-sm">Available for walk-in</p>
          </div>

           <!-- Future Item (Alex's Booking) -->
           <div class="glass-card">
             <div class="flex-row" style="justify-content: space-between;">
              <span style="font-weight: 600;">14:00 - 16:00</span>
              <span>Reserved</span>
            </div>
            <div class="flex-row gap-sm" style="margin-top: 8px;">
               <img src="${users.current.avatar}" style="width: 20px; height: 20px; border-radius: 50%;" />
               <p class="text-sm">${users.current.name}</p>
            </div>
          </div>
          
        </div>
      </div>

      <!-- CHECK-IN MODAL (7 Methods) -->
      <div id="checkin-modal" class="hidden" style="position: fixed; inset: 0; background: rgba(0,0,0,0.8); backdrop-filter: blur(10px); z-index: 1000; display: flex; align-items: center; justify-content: center;">
        <div class="glass-panel" style="width: 800px; padding: 40px; background: rgba(30, 41, 59, 0.9);">
          
          <div class="flex-row" style="justify-content: space-between; margin-bottom: 20px;">
             <h2 class="text-h1" style="margin: 0;">Confirm Room Access</h2>
             <button class="glass-btn" onclick="document.getElementById('checkin-modal').classList.add('hidden')">❌</button>
          </div>

          <div class="grid-cols-2" style="gap: 20px;">
            
            <!-- Method 1: QR -->
            <div class="glass-card flex-col flex-center" style="grid-row: span 2;">
              <div style="width: 200px; height: 200px; background: white; padding: 10px; border-radius: 12px;">
                 <img src="https://api.qrserver.com/v1/create-qr-code/?size=180x180&data=CheckIn-Room1" alt="QR Code" />
              </div>
              <p style="margin-top: 10px; text-align: center;">1. Scan via App</p>
            </div>

            <div class="flex-col gap-md">
              <!-- Method 2: PIN -->
              <button class="glass-btn" onclick="alert('Simulated: PIN Pad opens')">🔢 2. Enter PIN Code</button>
              
              <!-- Method 3: NFC -->
              <button class="glass-btn" onclick="alert('Simulated: Employee Card Tapped')">💳 3. Tap Employee Card</button>
              
              <!-- Method 4: Face ID -->
              <button class="glass-btn" onclick="alert('Simulated: Face Recognized')">🙂 4. Face Scan</button>
            </div>

            <div class="flex-col gap-md">
               <!-- Method 5: Proximity -->
               <button class="glass-btn" style="border: 1px solid #4ade80; color: #4ade80;">📡 5. Auto-Detect (BLE)</button>
               
               <!-- Method 6: Notification -->
               <button class="glass-btn" style="border: 1px solid #fbbf24; color: #fbbf24;">🔔 6. Sent Notification</button>

               <!-- Method 7: Voice -->
               <button class="glass-btn" style="border: 1px solid #f472b6; color: #f472b6;">🎙️ 7. Say "Check In"</button>
            </div>

          </div>
          
        </div>
      </div>

    </div>
  `;
  };

  render();

  // Auto-refresh every 2 seconds to check status (Polling for prototype simplicity)
  const interval = setInterval(render, 2000);
}
