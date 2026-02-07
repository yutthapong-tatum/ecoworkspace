import { dataManager } from '../data.js';

export function renderEmployeeApp(container) {
  let activeTab = 'home'; // 'home' | 'schedule' | 'profile'

  const render = () => {
    const users = dataManager.getUsers();
    const rooms = dataManager.getRooms();

    // Helper to filter upcoming bookings
    const getUpcomingBookings = () => {
      const now = new Date();
      const currentMinutes = now.getHours() * 60 + now.getMinutes();
      const todayStr = now.toISOString().split('T')[0]; // YYYY-MM-DD

      return users.current.bookings.filter(b => {
        // Assuming b.date is in YYYY-MM-DD format
        if (b.date > todayStr) return true; // Future date
        if (b.date < todayStr) return false; // Past date
        // Same day: check time
        // Assuming b.time is like "HH:MM - HH:MM"
        const [startH, startM] = b.time.split('-')[0].trim().split(':').map(Number);
        const startTotal = startH * 60 + startM;
        return startTotal > currentMinutes; // Future time on same day
      }).sort((a, b) => {
        // Sort by Date
        if (a.date !== b.date) return a.date.localeCompare(b.date);

        // Sort by Time
        const getMinutes = (timeStr) => {
          const [h, m] = timeStr.split('-')[0].trim().split(':').map(Number);
          return h * 60 + m;
        };
        return getMinutes(a.time) - getMinutes(b.time);
      });
    };

    // 1. Build Content based on Tab
    let mainContent = '';

    if (activeTab === 'home') {
      const upcomingBookings = getUpcomingBookings();

      mainContent = `
        <!-- Header -->
        <header style="padding: 10px 20px; display: flex; justify-content: space-between; align-items: center;">
            <div>
            <h2 style="font-size: 1.5rem; font-weight: 800; margin-bottom: 4px;">Hello, ${users.current.name.split(' ')[0]} 👋</h2>
            <p class="text-sm">Find your space for today.</p>
            </div>
            <img src="${users.current.avatar}" style="width: 40px; height: 40px; border-radius: 50%; border: 2px solid white;" />
        </header>

        <!-- Your Bookings Section (Horizontal Snippet) -->
        <div style="padding: 0 20px; margin-bottom: 10px;">
            <h3 class="text-h3" style="margin-bottom: 15px;">Your Upcoming Bookings</h3>
            <div class="no-scrollbar" style="display: flex; gap: 15px; overflow-x: auto; padding-bottom: 10px;">
            ${upcomingBookings.length > 0 ? upcomingBookings.slice(0, 5).map(booking => `
                <div class="glass-card" style="min-width: 260px; background: rgba(255, 255, 255, 0.1); border: 1px solid rgba(255,255,255,0.4);">
                <div class="flex-row" style="justify-content: space-between; margin-bottom: 10px;">
                    <span style="font-weight: 700; color: #fbbf24;">${booking.date}</span>
                    <span style="font-size: 0.8rem; background: rgba(74, 222, 128, 0.2); color: #4ade80; padding: 2px 8px; border-radius: 10px;">${booking.status}</span>
                </div>
                <h4 style="font-size: 1.1rem; font-weight: 600; margin-bottom: 4px;">
                    ${booking.roomName} <span style="font-size: 0.8rem; opacity: 0.6;">#${booking.roomId}</span>
                </h4>
                <p class="text-sm" style="opacity: 0.8;">🕒 ${booking.time}</p>
                <div style="display: flex; gap: 8px; margin-top: 12px;">
                    <button class="glass-btn btn-view-ticket" data-id="${booking.id}" style="flex: 1; padding: 8px; font-size: 0.8rem; background: rgba(255,255,255,0.2);">View Ticket</button>
                    <button class="glass-btn btn-cancel-booking" data-id="${booking.id}" style="flex: 0 0 auto; padding: 8px 12px; font-size: 0.8rem; background: rgba(248, 113, 113, 0.2); border: 1px solid rgba(248, 113, 113, 0.4); color: #fca5a5;">✕</button>
                </div>
                </div>
            `).join('') : '<p class="text-sm">No upcoming bookings.</p>'}
            </div>
        </div>

        <!-- Search / Filter -->
        <div style="padding: 0 20px; margin-bottom: 20px;">
            <input type="text" id="room-search" class="glass-input" placeholder="Search rooms..." />
            <div class="flex-row" style="margin-top: 10px; flex-wrap: wrap; gap: 8px; justify-content: flex-start;">
              <button class="glass-btn filter-btn" data-filter="all" style="padding: 5px 10px; font-size: 0.75rem; background: rgba(255,255,255,0.3);">All</button>
              <button class="glass-btn filter-btn" data-filter="available" style="padding: 5px 10px; font-size: 0.75rem; background: transparent; border: 1px solid rgba(255,255,255,0.2);">Available</button>
              <button class="glass-btn filter-btn" data-filter="cap-1-10" style="padding: 5px 10px; font-size: 0.75rem; background: transparent; border: 1px solid rgba(255,255,255,0.2);"><10 Pax</button>
              <button class="glass-btn filter-btn" data-filter="cap-10-20" style="padding: 5px 10px; font-size: 0.75rem; background: transparent; border: 1px solid rgba(255,255,255,0.2);">10-20 Pax</button>
              <button class="glass-btn filter-btn" data-filter="cap-20+" style="padding: 5px 10px; font-size: 0.75rem; background: transparent; border: 1px solid rgba(255,255,255,0.2);">20+ Pax</button>
              <button class="glass-btn filter-btn" data-filter="Meeting" style="padding: 5px 10px; font-size: 0.75rem; background: transparent; border: 1px solid rgba(255,255,255,0.2);">Meeting</button>
            </div>
        </div>

        <!-- Room List -->
        <div style="padding: 0 20px; display: flex; flex-direction: column; gap: 20px;">
            ${rooms.map(room => `
            <div class="glass-card room-item" data-type="${room.type}" data-status="${room.status}" data-capacity="${room.capacity}">
                <div style="height: 140px; border-radius: 12px; background-image: url('${room.image}'); background-size: cover; background-position: center; margin-bottom: 12px; position: relative;">
                <div style="position: absolute; top: 10px; right: 10px; padding: 4px 8px; border-radius: 20px; background: ${room.status === 'available' ? 'rgba(74, 222, 128, 0.9)' : 'rgba(248, 113, 113, 0.9)'}; font-size: 0.7rem; font-weight: 700; color: #1e293b;">
                    ${room.status === 'available' ? 'AVAILABLE' : 'OCCUPIED'}
                </div>
                </div>
                
                <div class="flex-row" style="justify-content: space-between; margin-bottom: 4px;">
                <h3 class="text-h3" style="margin: 0;">
                    ${room.name} <span style="font-size: 0.9rem; opacity: 0.6; font-weight: 400;">#${room.id}</span>
                </h3>
                <span class="text-sm">👥 ${room.capacity}</span>
                </div>
                
                <p class="text-sm" style="margin-bottom: 12px; opacity: 0.8;">
                ${room.facilities.join(' • ')}
                </p>

                <button class="glass-btn btn-book" data-id="${room.id}" style="width: 100%;">
                ${room.status === 'available' ? 'Book Now' : 'Book Future Slot'}
                </button>
            </div>
            `).join('')}
        </div>
        `;
    } else if (activeTab === 'schedule') {
      const myBookings = users.current.bookings || [];
      mainContent = `
         <header style="padding: 10px 20px; margin-bottom: 20px;">
            <h2 class="text-h2">📅 My Schedule</h2>
            <p class="text-sm">Upcoming meetings and desk reservations.</p>
         </header>
         <div style="padding: 0 20px; display: flex; flex-direction: column; gap: 15px;">
            ${myBookings.length > 0 ? myBookings.map(booking => `
                <div class="glass-card" style="display: flex; gap: 15px; align-items: center;">
                   <div style="text-align: center; padding-right: 15px; border-right: 1px solid rgba(255,255,255,0.1);">
                      <div style="font-size: 1.5rem; font-weight: bold; color: #fbbf24;">${new Date(booking.date).getDate()}</div>
                       <div style="font-size: 0.8rem; text-transform: uppercase;">${new Date(booking.date).toLocaleDateString('en-US', { month: 'short' })}</div>
                   </div>
                   <div style="flex: 1;">
                      <h4 class="text-h3" style="margin-bottom: 4px;">${booking.roomName}</h4>
                      <p class="text-sm" style="opacity: 0.7; margin-bottom: 8px;">⏰ ${booking.time}</p>
                       <div style="display: flex; gap: 8px;">
                          <button class="glass-btn btn-view-ticket" data-id="${booking.id}" style="padding: 4px 10px; font-size: 0.75rem;">Ticket</button>
                           <button class="glass-btn btn-cancel-booking" data-id="${booking.id}" style="padding: 4px 10px; font-size: 0.75rem; background: rgba(248, 113, 113, 0.2); border-color: rgba(248, 113, 113, 0.4);">Cancel</button>
                       </div>
                   </div>
                </div>
            `).join('') : `<div class="glass-panel" style="text-align: center; padding: 40px;">No bookings found. Time to book a space!</div>`}
         </div>
        `;
    } else if (activeTab === 'profile') {
      mainContent = `
         <header style="padding: 10px 20px; margin-bottom: 20px;">
            <h2 class="text-h2">👤 My Profile</h2>
         </header>
         <div style="padding: 0 20px;">
            <div class="glass-panel" style="text-align: center; padding: 30px;">
                <img src="${users.current.avatar}" style="width: 100px; height: 100px; border-radius: 50%; border: 4px solid rgba(255,255,255,0.1); margin-bottom: 15px;" />
                <h3 class="text-h2">${users.current.name}</h3>
                <p class="text-sm" style="opacity: 0.6; margin-bottom: 25px;">Employee ID: 885921</p>
                
                <div style="display: flex; gap: 10px; justify-content: center;">
                    <button class="glass-btn" style="background: rgba(255, 255, 255, 0.1);" onclick="window.location.hash='#'">
                        🏠 Exit to Portal
                    </button>
                    <button class="glass-btn" style="background: rgba(239, 68, 68, 0.2); border-color: rgba(239, 68, 68, 0.4);" onclick="dataManager.reset()">
                        ⚠️ Reset App Data
                    </button>
                </div>
            </div>
         </div>
        `;
    }

    container.innerHTML = `
    <div style="max-width: 480px; width: 100%; margin: 0 auto; min-height: 100vh; padding-bottom: 20px;">
      
      ${mainContent}

      <!-- Custom Toast/Popup -->
      <div id="custom-popup" class="hidden" style="position: fixed; top: 50%; left: 50%; transform: translate(-50%, -50%); z-index: 9999; width: 90%; max-width: 320px;">
          <div class="glass-panel" style="background: rgba(20, 20, 25, 0.95); border: 1px solid rgba(255,255,255,0.1); padding: 25px; text-align: center; box-shadow: 0 20px 50px rgba(0,0,0,0.5);">
             <div id="popup-icon" style="font-size: 3rem; margin-bottom: 15px;">⚠️</div>
             <h3 id="popup-title" class="text-h2" style="margin-bottom: 10px;">Notice</h3>
             <p id="popup-message" class="text-sm" style="opacity: 0.8; margin-bottom: 25px; line-height: 1.5;"></p>
             <div id="popup-actions" style="display: flex; gap: 10px; justify-content: center;">
                 <button id="popup-cancel" class="glass-btn" style="flex: 1; background: rgba(255,255,255,0.1); display: none;">Cancel</button>
                 <button id="popup-confirm" class="glass-btn" style="flex: 1; background: #3b82f6;">OK</button>
             </div>
          </div>
      </div>


      <!-- Smart Bottom Nav (Restored & Auto-Hiding) -->
      <nav id="employee-nav" class="glass-panel" style="position: fixed; bottom: 20px; left: 50%; transform: translateX(-50%); width: 90%; max-width: 400px; padding: 10px 20px; display: flex; justify-content: space-between; z-index: 100; transition: transform 0.3s ease-in-out;">
        <div id="nav-home" style="font-size: 1.5rem; opacity: ${activeTab === 'home' ? '1' : '0.5'}; cursor: pointer; transition: opacity 0.2s;">🏠</div>
        <div id="nav-schedule" style="font-size: 1.5rem; opacity: ${activeTab === 'schedule' ? '1' : '0.5'}; cursor: pointer; transition: opacity 0.2s;">📅</div>
        <div id="nav-profile" style="font-size: 1.5rem; opacity: ${activeTab === 'profile' ? '1' : '0.5'}; cursor: pointer; transition: opacity 0.2s;">👤</div>
      </nav>

    <!-- Ticket Modal -->
    <div id="ticket-modal" class="hidden" style="position: fixed; inset: 0; background: rgba(0,0,0,0.85); backdrop-filter: blur(10px); z-index: 200; display: flex; align-items: center; justify-content: center; padding: 20px;">
        <div class="glass-panel" style="width: 100%; max-width: 350px; padding: 0; overflow: hidden; animation: slideUp 0.3s ease-out;">
            
            <div style="background: linear-gradient(135deg, #3b82f6 0%, #06b6d4 100%); padding: 20px; text-align: center; position: relative;">
                <h3 class="text-h2" style="margin: 0;">Access Ticket</h3>
                <p class="text-sm" style="opacity: 0.9;">Show this at the room scanner</p>
                <div onclick="document.getElementById('ticket-modal').classList.add('hidden')" style="position: absolute; top: 15px; right: 15px; background: rgba(0,0,0,0.2); width: 30px; height: 30px; border-radius: 50%; display: flex; align-items: center; justify-content: center; cursor: pointer;">✕</div>
            </div>

            <div style="padding: 30px 20px; display: flex; flex-direction: column; align-items: center; background: rgba(255,255,255,0.05);">
                
                <h2 id="ticket-room-name" class="text-h1" style="margin-bottom: 5px;">Goku</h2>
                <span id="ticket-room-id" style="font-size: 1.2rem; opacity: 0.7; margin-bottom: 20px;">#1001</span>

                <div style="background: white; padding: 15px; border-radius: 20px; margin-bottom: 20px;">
                    <img id="ticket-qr" src="" alt="QR Code" style="width: 180px; height: 180px;" />
                </div>

                <div class="glass-card" style="width: 100%; text-align: center;">
                    <p class="text-sm">Time Slot</p>
                    <h4 id="ticket-time" class="text-h3" style="color: #fbbf24;">14:00 - 16:00</h4>
                    <p id="ticket-date" class="text-sm" style="margin-top: 5px;">Today</p>
                    
                    <div style="margin-top: 15px; padding-top: 15px; border-top: 1px solid rgba(255,255,255,0.1);">
                        <p class="text-sm">Secret Code (PIN)</p>
                        <h4 id="ticket-pin" class="text-h1" style="color: #60a5fa; letter-spacing: 5px; margin-top: 5px;">----</h4>
                    </div>
                </div>

            </div>

            <div style="padding: 20px; text-align: center; border-top: 1px solid rgba(255,255,255,0.1);">
                <button class="glass-btn" style="width: 100%;">Save to Gallery</button>
            </div>
        </div>
    </div>

    <!-- Booking Modal -->
    <div id="booking-modal" class="hidden" style="position: fixed; inset: 0; background: rgba(0,0,0,0.85); backdrop-filter: blur(10px); z-index: 200; display: flex; align-items: center; justify-content: center; padding: 20px;">
        <div class="glass-panel" style="width: 100%; max-width: 350px; padding: 0; overflow: hidden; animation: slideUp 0.3s ease-out;">
            
            <div style="background: linear-gradient(135deg, #10b981 0%, #3b82f6 100%); padding: 20px; text-align: center; position: relative;">
                <h3 class="text-h2" style="margin: 0;">Book Room</h3>
                <p class="text-sm" style="opacity: 0.9;">Select your preferred slot</p>
                <div onclick="document.getElementById('booking-modal').classList.add('hidden')" style="position: absolute; top: 15px; right: 15px; background: rgba(0,0,0,0.2); width: 30px; height: 30px; border-radius: 50%; display: flex; align-items: center; justify-content: center; cursor: pointer;">✕</div>
            </div>

            <div style="padding: 20px; display: flex; flex-direction: column; gap: 15px; background: rgba(255,255,255,0.05); max-height: 70vh; overflow-y: auto;" class="no-scrollbar">
                
                <!-- Room Header -->
                <div class="text-center">
                    <div id="booking-room-image" style="width: 100%; height: 120px; border-radius: 12px; background-size: cover; background-position: center; margin-bottom: 15px;"></div>
                    <h2 id="booking-room-name" class="text-h1" style="margin-bottom: 5px;">Goku</h2>
                    <span id="booking-room-id" style="font-size: 1.2rem; opacity: 0.7;">#1001</span>
                </div>

                <!-- Room Details -->
                <div class="glass-card" style="padding: 12px; text-align: center; background: rgba(255,255,255,0.05);">
                    <p style="font-size: 0.9rem; margin-bottom: 4px;">👥 Capacity: <span id="booking-room-capacity" style="font-weight: 700; color: #fbbf24;">4</span> People</p>
                    <p class="text-sm" style="opacity: 0.8;" id="booking-room-facilities">TV • Whiteboard</p>
                </div>

                <!-- Date Selection -->
                <div>
                    <label class="text-sm" style="display: block; margin-bottom: 8px;">Select Date</label>
                    <input type="date" id="booking-date" class="glass-input" style="width: 100%; color-scheme: dark;">
                </div>

                <!-- Time Selection -->
                <div>
                    <label class="text-sm" style="display: block; margin-bottom: 8px;">Select Time</label>
                    <div id="booking-time-slots" style="display: grid; grid-template-columns: repeat(3, 1fr); gap: 10px;">
                        <!-- Slots generated by JS -->
                    </div>
                    <input type="hidden" id="booking-time-selected" />
                </div>

            </div>

            <div style="padding: 20px; text-align: center; border-top: 1px solid rgba(255,255,255,0.1);">
                <button id="confirm-booking-btn" class="glass-btn" style="width: 100%; background: #10b981; border: none;">Confirm Booking</button>
            </div>
        </div>
    </div>

    </div>
  `;

    // Helper: Show Custom Popup
    const showPopup = (title, message, type = 'info', onConfirm = null) => {
      const popup = document.getElementById('custom-popup');
      const iconInfo = {
        'success': '✅',
        'error': '❌',
        'confirm': '❓',
        'info': 'ℹ️'
      };

      document.getElementById('popup-icon').textContent = iconInfo[type] || 'ℹ️';
      document.getElementById('popup-title').textContent = title;
      document.getElementById('popup-message').textContent = message;

      const btnCancel = document.getElementById('popup-cancel');
      const btnConfirm = document.getElementById('popup-confirm');

      // Reset Buttons
      btnCancel.style.display = 'none';
      btnConfirm.textContent = 'OK';
      btnConfirm.style.background = '#3b82f6'; // Blue default

      // Specifc Type Styles
      if (type === 'error') btnConfirm.style.background = '#ef4444';
      if (type === 'success') btnConfirm.style.background = '#10b981';

      if (type === 'confirm') {
        btnCancel.style.display = 'block';
        btnConfirm.textContent = 'Yes, Confirm';
        btnConfirm.style.background = '#ef4444'; // Destructive action usually

        btnConfirm.onclick = () => {
          popup.classList.add('hidden');
          if (onConfirm) onConfirm();
        };
        btnCancel.onclick = () => popup.classList.add('hidden');
      } else {
        // Simple Alert
        btnConfirm.onclick = () => popup.classList.add('hidden');
      }

      popup.classList.remove('hidden');
    };


    // Nav Logic
    const nav = document.getElementById('employee-nav');
    let lastScrollY = window.scrollY;
    let scrollTimeout;

    // Smart Auto-Hide/Show
    window.addEventListener('scroll', () => {
      const currentScrollY = window.scrollY;

      // Scrolling Down -> Hide
      if (currentScrollY > lastScrollY && currentScrollY > 50) {
        nav.style.transform = 'translate(-50%, 200%)'; // Move down out of view
      }
      // Scrolling Up -> Show
      else {
        nav.style.transform = 'translateX(-50%)'; // Reset to original
      }

      lastScrollY = currentScrollY;

      // Idle Timer: Show after 2 seconds of no scroll
      clearTimeout(scrollTimeout);
      scrollTimeout = setTimeout(() => {
        nav.style.transform = 'translateX(-50%)';
      }, 1500);
    });

    document.getElementById('nav-home').onclick = () => { activeTab = 'home'; render(); };
    document.getElementById('nav-schedule').onclick = () => { activeTab = 'schedule'; render(); };
    document.getElementById('nav-profile').onclick = () => { activeTab = 'profile'; render(); };
    let selectedRoomId = null;
    let selectedTimes = new Set();

    if (activeTab === 'home') {
      // Attach Event Listeners
      container.querySelectorAll('.btn-book').forEach(btn => {
        btn.addEventListener('click', (e) => {
          const id = parseInt(e.target.dataset.id);
          const rooms = dataManager.getRooms();
          const room = rooms.find(r => r.id === id);

          if (room) {
            // Open Modal Logic
            selectedRoomId = id;
            document.getElementById('booking-room-name').textContent = room.name;
            document.getElementById('booking-room-id').textContent = `#${room.id}`;
            document.getElementById('booking-room-image').style.backgroundImage = `url('${room.image}')`;
            document.getElementById('booking-room-capacity').textContent = room.capacity;
            document.getElementById('booking-room-facilities').textContent = room.facilities.join(' • ');

            // Set Default Date to Today
            const today = new Date().toISOString().split('T')[0];
            const dateInputEl = document.getElementById('booking-date');
            dateInputEl.value = today;
            dateInputEl.min = today; // Disable past dates

            document.getElementById('booking-modal').classList.remove('hidden');

            // Multi-Select Logic
            // selectedTimes is now shared in outer scope

            // Date Change Listener for reloading slots
            const updateSlots = () => {
              selectedTimes.clear(); // Reset selection on date change
              document.getElementById('booking-time-selected').value = ''; // Clear hidden input (unused now but good for safety)

              const dateEl = document.getElementById('booking-date');
              if (!dateEl) return;
              const dateVal = dateEl.value;

              // Helper to check collision
              const bookedSlots = dataManager.getRoomBookings(selectedRoomId, dateVal);
              const container = document.getElementById('booking-time-slots');
              container.innerHTML = ''; // Clear

              const times = [
                "08:00 - 09:00", "09:00 - 10:00", "10:00 - 11:00", "11:00 - 12:00",
                "13:00 - 14:00", "14:00 - 15:00", "15:00 - 16:00",
                "16:00 - 17:00", "17:00 - 18:00"
              ];

              // Helper to parse "HH:MM" to minutes
              const parseTime = (str) => {
                const [h, m] = str.split(':').map(Number);
                return h * 60 + m;
              };

              // Helper to parse "Start - End" string to Range
              const getRange = (timeStr) => {
                if (!timeStr || typeof timeStr !== 'string' || !timeStr.includes('-')) return null;
                const parts = timeStr.split('-').map(s => s.trim());
                if (parts.length !== 2) return null;
                const [startStr, endStr] = parts;
                // Guard against empty strings
                if (!startStr || !endStr) return null;

                return { start: parseTime(startStr), end: parseTime(endStr) };
              };

              // Robust Collision Check
              const now = new Date();
              const todayStr = now.toISOString().split('T')[0];
              const isToday = dateVal === todayStr;
              const currentMinutes = now.getHours() * 60 + now.getMinutes();

              times.forEach(slotTime => {
                const slotRange = getRange(slotTime);

                // 1. Check if Booked
                const isBooked = bookedSlots.some(booking => {
                  const bookingRange = getRange(booking.time);
                  if (!bookingRange || !slotRange) return false;
                  return (bookingRange.start < slotRange.end) && (bookingRange.end > slotRange.start);
                });

                // 2. Check if Past (if today)
                // Allow "Late Booking" for current slot (e.g. 13:20 for 13:00-14:00)
                // ONLY filter if the ENTIRE slot is in the past (End <= Now)
                const isPast = isToday && (slotRange.end <= currentMinutes);

                const btn = document.createElement('button');
                btn.textContent = slotTime.split(' - ')[0]; // Show Start time only
                btn.className = 'glass-btn';
                btn.style.padding = '8px';
                btn.style.fontSize = '0.9rem';
                btn.dataset.time = slotTime;

                if (isBooked || isPast) {
                  // Disabled Style
                  btn.style.border = '1px solid rgba(239, 68, 68, 0.5)'; // Red-500
                  btn.style.background = 'rgba(239, 68, 68, 0.2)';
                  btn.style.color = '#fca5a5'; // Red-300
                  btn.style.cursor = 'not-allowed';
                  btn.disabled = true;
                  if (isPast) {
                    btn.style.opacity = '0.5'; // Visually dim past slots
                    btn.style.borderColor = 'transparent';
                    btn.style.background = 'rgba(0,0,0,0.1)';
                    btn.style.color = 'rgba(255,255,255,0.3)';
                  }
                } else {
                  // Available / Green Style
                  const isSelected = selectedTimes.has(slotTime);
                  btn.style.border = isSelected ? '1px solid #10b981' : '1px solid rgba(74, 222, 128, 0.4)';
                  btn.style.background = isSelected ? 'rgba(74, 222, 128, 0.8)' : 'rgba(74, 222, 128, 0.1)';
                  btn.style.color = isSelected ? '#064e3b' : '#86efac';
                  btn.style.cursor = 'pointer';

                  btn.onclick = () => {
                    // Toggle Selection
                    if (selectedTimes.has(slotTime)) {
                      selectedTimes.delete(slotTime);
                      // Visual update
                      btn.style.background = 'rgba(74, 222, 128, 0.1)';
                      btn.style.color = '#86efac';
                      btn.style.border = '1px solid rgba(74, 222, 128, 0.4)';
                    } else {
                      selectedTimes.add(slotTime);
                      // Visual update
                      btn.style.background = 'rgba(74, 222, 128, 0.8)';
                      btn.style.color = '#064e3b';
                      btn.style.border = '1px solid #10b981';
                    }
                  };
                }

                container.appendChild(btn);
              });
            };

            // Remove old listeners by overwriting the onchange property
            // This is safer than replacing DOM nodes which might lose the current value
            const dateInput = document.getElementById('booking-date');
            dateInput.onchange = updateSlots;

            // Initial Call to render slots for the default date
            updateSlots();
          }
        });
      });

      // Modal Confirm Logic
      const confirmBtn = document.getElementById('confirm-booking-btn');
      if (confirmBtn) {
        confirmBtn.addEventListener('click', () => {
          if (!selectedRoomId) return;

          const date = document.getElementById('booking-date').value;


          if (!date || selectedTimes.size === 0) {
            showPopup('Missing Details', 'Please select a date and at least one time slot.', 'error');
            return;
          }

          // Format Date for display
          const dateObj = new Date(date);
          const dateStr = dateObj.toLocaleDateString('en-US', { weekday: 'short', day: 'numeric', month: 'short' });

          const rooms = dataManager.getRooms();
          const room = rooms.find(r => r.id === selectedRoomId);
          if (!room) return;

          // Convert Set to sorted Array
          const timeArray = Array.from(selectedTimes).sort();

          // Confirm before booking
          showPopup('Confirm Booking?', `Book ${room.name} on ${dateStr} for ${timeArray.length} slot(s)?\n\n${timeArray.map(t => t.split('-')[0]).join(', ')}`, 'confirm', () => {
            const result = dataManager.bookSlots(selectedRoomId, date, timeArray);

            // Robust Check
            const isSuccess = (result === true) || (result && result.success === true);

            if (isSuccess) {

              // ... (Confirm logic handled above) ... 
              // NOTE: The previous replacement might have nested things improperly. 
              // We need to ensure the structure is:
              // if (home) {
              //    querySelectorAll.forEach(btn => {
              //       btn.addEventListener(click, (e) => {
              //           ... open modal ...
              //           ... setup modal listeners once ...
              //       })
              //    })
              // }

              // To avoid duplication, let's keep the modal logic separate or distinct.
              // But for now, let's just close the block correctly.
              showPopup('Booked!', 'Your room has been successfully booked.', 'success');
              document.getElementById('booking-modal').classList.add('hidden');
              render(); // Re-render the UI to show updated bookings/availability
            } else {
              showPopup('Booking Failed', result.message || 'There was an issue with your booking.', 'error');
            }
          });
        });
      }

      // Search Logic
      const searchInput = document.getElementById('room-search');
      const roomItems = container.querySelectorAll('.room-item');

      if (searchInput) {
        searchInput.addEventListener('input', (e) => {
          const term = e.target.value.toLowerCase();
          roomItems.forEach(item => {
            const nameHeader = item.querySelector('h3');
            if (nameHeader) {
              const name = nameHeader.textContent.toLowerCase();
              if (name.includes(term)) {
                item.style.display = 'block';
              } else {
                item.style.display = 'none';
              }
            }
          });
        });
      }

      // Filter Logic
      const filterBtns = container.querySelectorAll('.filter-btn');
      filterBtns.forEach(btn => {
        btn.addEventListener('click', () => {
          // Reset UI
          filterBtns.forEach(b => {
            b.style.background = 'transparent';
            b.style.border = '1px solid rgba(255,255,255,0.2)';
          });
          // Highlight Active
          btn.style.background = 'rgba(255,255,255,0.3)';

          const filter = btn.dataset.filter;

          roomItems.forEach(item => {
            const type = item.dataset.type;
            const status = item.dataset.status;
            const capacity = parseInt(item.dataset.capacity);

            if (filter === 'all') {
              item.style.display = 'block';
            } else if (filter === 'available') {
              item.style.display = (status === 'available') ? 'block' : 'none';
            } else if (filter === 'cap-1-10') {
              item.style.display = (capacity >= 1 && capacity <= 10) ? 'block' : 'none';
            } else if (filter === 'cap-10-20') {
              item.style.display = (capacity > 10 && capacity <= 20) ? 'block' : 'none';
            } else if (filter === 'cap-20+') {
              item.style.display = (capacity > 20) ? 'block' : 'none';
            } else {
              // Category Filter
              item.style.display = (type.includes(filter)) ? 'block' : 'none';
            }
          });
        });
      });

    } // End if (activeTab === 'home')

    // Global Listeners (Ticket & Cancellation - works for Home & Schedule)
    container.querySelectorAll('.btn-view-ticket').forEach(btn => {
      btn.addEventListener('click', (e) => {
        // const bookingCard = e.target.closest('.glass-card'); // Not needed
        const id = e.target.dataset.id; // Keep as string
        const booking = users.current.bookings.find(b => b.id.toString() === id.toString());

        if (booking) {
          document.getElementById('ticket-room-name').textContent = booking.roomName;
          document.getElementById('ticket-room-id').textContent = `#${booking.roomId}`;
          document.getElementById('ticket-time').textContent = booking.time;
          document.getElementById('ticket-date').textContent = booking.date;
          document.getElementById('ticket-pin').textContent = booking.pin || '1234';
          document.getElementById('ticket-qr').src = `https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=booking-${booking.id}`;

          document.getElementById('ticket-modal').classList.remove('hidden');
        }
      });
    });

    // Cancel Booking Logic
    container.querySelectorAll('.btn-cancel-booking').forEach(btn => {
      btn.addEventListener('click', (e) => {
        const id = e.target.dataset.id;
        showPopup('Cancel Booking?', 'Are you sure you want to cancel this reservation? This cannot be undone.', 'confirm', () => {
          const success = dataManager.cancelBooking(id);
          if (success) {
            render(); // Refresh UI
            showPopup('Cancelled', 'Your booking has been successfully cancelled.', 'success');
          }
        });
      });
    });
  };

  render();
  // Ideally, subscribe to dataManager updates to auto-refresh when Admin changes things
  // But for now, simple interaction is enough.
}
