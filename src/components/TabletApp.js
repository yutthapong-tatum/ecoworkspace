import { dataManager } from '../data.js';

export function renderTabletApp(container, roomId) {
  let interval = null;

  const renderSelection = () => {
    const rooms = dataManager.getRooms();
    container.innerHTML = `
      <div class="glass-panel" style="padding: 3rem; text-align: center; max-width: 600px; margin: 2rem auto;">
        <h2 class="text-h1">Select Room for Tablet</h2>
        <p class="text-body" style="margin-bottom: 2rem;">Choose which room this tablet is mounted at.</p>
        <div style="display: grid; grid-template-columns: repeat(auto-fill, minmax(150px, 1fr)); gap: 1rem;">
          ${rooms.map(room => `
            <button class="glass-btn" style="padding: 1rem;" onclick="window.location.hash='#tablet/${room.id}'">
              ${room.name}
            </button>
          `).join('')}
        </div>
        <button class="glass-btn" style="margin-top: 2rem; background: rgba(255,255,255,0.1);" onclick="window.location.hash='#'">
          Cancel
        </button>
      </div>
    `;
  }

  const renderRoomView = (roomId) => {

    // Check-In Handler (Defined once per room view)
    window.performCheckIn = () => {
      const room = dataManager.getRoom(parseInt(roomId));
      if (!room) return;

      // Re-calculate simple status to check interactability
      const now = new Date();
      const currentHour = now.getHours();

      // Lunch Break Check
      if (currentHour === 12) {
        alert("Cannot check in during Lunch Break (12:00-13:00).");
        return;
      }

      // Call DataManager
      const result = dataManager.checkIn(room.id);

      // Custom Toast Notification
      const toast = document.createElement('div');
      toast.style.cssText = `
            position: fixed; top: 30px; left: 50%; transform: translateX(-50%);
            background: ${result.success ? '#4ade80' : '#f87171'};
            color: #0f172a; padding: 12px 24px; border-radius: 50px;
            box-shadow: 0 10px 25px rgba(0,0,0,0.2); z-index: 9999;
            font-weight: 700; font-size: 1.1rem; opacity: 0; transition: opacity 0.3s;
            display: flex; align-items: center; gap: 10px;
        `;
      toast.innerHTML = `<span>${result.success ? '✅' : '❌'}</span> ${result.message}`;
      document.body.appendChild(toast);

      // Animate
      requestAnimationFrame(() => toast.style.opacity = '1');
      setTimeout(() => {
        toast.style.opacity = '0';
        setTimeout(() => toast.remove(), 300);

        // Force re-render if success
        if (result.success) {
          // Trigger a custom event or just wait for next interval?
          // Let's force a render call if we can access it, but 'render' is defined below.
          // Ideally, dataManager.save() triggers listeners if we adhered to that pattern.
          // For now, reload page hash which triggers re-render is simplest, 
          // OR just let the polling/data-listener handle it. 
          // Since we don't have direct access to 'render' function yet (hoisting?), 
          // we rely on the interval or data listener.
          // Actually, let's just dispatch a storage event to force updates if needed.
        }
      }, 3000);
    };

    const render = () => {
      try {
        const users = dataManager.getUsers();
        const currentRoom = dataManager.getRoom(parseInt(roomId));

        if (!currentRoom) {
          container.innerHTML = `
          <div class="glass-panel" style="padding: 2rem; text-align: center;">
            <h2 class="text-h2">Room Not Found</h2>
            <button class="glass-btn" onclick="window.location.hash='#tablet'">Back</button>
          </div>
        `;
          return;
        }

        // --- Logic: Status & Auto-Release ---
        // 1. Trigger Auto-Release Check
        const hasUpdates = dataManager.checkAutoRelease(currentRoom.id);
        if (hasUpdates) {
          setTimeout(render, 0);
          return;
        }

        // 2. Get Centralized Status
        const { status, color, sub, interactable } = dataManager.getRoomStatus(currentRoom.id);

        const statusText = status;
        const statusColor = color;
        const statusSub = sub;
        const isInteractable = interactable;

        const now = new Date();
        const currentHour = now.getHours();

        const isAvailable = (statusText === 'AVAILABLE');

        container.innerHTML = `
      <div style="width: 100%; height: 100vh; display: flex; ">
        
        <!-- Left Panel: Status & Actions -->
        <div style="flex: 1; background: ${statusColor}1A; backdrop-filter: blur(40px); display: flex; flex-direction: column; padding: 40px; border-right: 1px solid rgba(255,255,255,0.1); position: relative;">
          
          <div style="position: absolute; top: 20px; left: 20px;">
             <button class="glass-btn" style="font-size: 0.8rem; padding: 8px 15px;" onclick="window.location.hash='#tablet'">⚙️ Change Room</button>
          </div>

          <!-- Room Status Header -->
          <div style="text-align: center; margin-bottom: 40px; margin-top: 40px;">
            <h1 style="font-size: 5rem; font-weight: 800; color: ${statusColor}; text-shadow: 0 0 30px ${statusColor}44; margin: 0; line-height: 1;">${statusText}</h1>
            <h2 class="text-h1" style="font-size: 2.5rem; margin-top: 10px; margin-bottom: 5px;">
              ${currentRoom.name} <span style="font-size: 1.5rem; opacity: 0.6; vertical-align: middle;">#${currentRoom.id}</span>
            </h2>
            <p class="text-h3" style="opacity: 0.7;">${statusSub}</p>
          </div>
          

          <!-- 1.5 Ad-Hoc Booking (When Available) -->
          ${statusText === 'AVAILABLE' ? `
            <div style="flex: 0 0 auto; margin-bottom: 30px; display: flex; justify-content: center;">
                <button class="glass-btn" style="background: rgba(74, 222, 128, 0.2); border: 2px solid #4ade80; padding: 20px 40px; font-size: 1.5rem; font-weight: 700; display: flex; align-items: center; gap: 15px; box-shadow: 0 0 30px rgba(74, 222, 128, 0.2);" onclick="window.performAdhocBooking()">
                    <span>⚡ Book Now</span>
                    <span style="font-size: 1rem; opacity: 0.8; font-weight: 400;">(${currentHour}:00 - ${currentHour + 1}:00)</span>
                </button>
            </div>
          ` : ''}

          <!-- 7 Ways to Check In (Embedded Grid) -->
          <div style="flex: 1; display: flex; flex-direction: column; justify-content: center;">
            <h3 class="text-h3" style="text-align: center; margin-bottom: 20px; opacity: 0.8;">Choose Access Method</h3>
            
            <div style="display: grid; grid-template-columns: repeat(4, 1fr); gap: 15px;">
              
              <!-- 1. QR Scan (Prominent) -->
              <div class="glass-btn flex-col flex-center" style="grid-column: span 1; grid-row: span 2; padding: 10px; aspect-ratio: 1/1.2; background: rgba(255,255,255,0.05);">
                <div style="width: 100%; aspect-ratio: 1; background: white; padding: 5px; border-radius: 8px; margin-bottom: 10px;">
                   <img src="https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=CheckIn-Room-${currentRoom.id}" alt="QR Code" style="width: 100%; height: 100%; object-fit: contain;" />
                </div>
                <span class="text-sm" style="font-weight: 600;">Scan App</span>
              </div>

              <!-- Other Methods -->
              <button class="glass-btn flex-col flex-center" style="padding: 15px; gap: 8px;" onclick="window.performCheckIn()">
                <span style="font-size: 1.5rem;">🔢</span>
                <span class="text-sm">PIN Code</span>
              </button>
              
              <button class="glass-btn flex-col flex-center" style="padding: 15px; gap: 8px;" onclick="window.performCheckIn()">
                <span style="font-size: 1.5rem;">💳</span>
                <span class="text-sm">NFC Card</span>
              </button>
              
              <button class="glass-btn flex-col flex-center" style="padding: 15px; gap: 8px;" onclick="window.performCheckIn()">
                <span style="font-size: 1.5rem;">🙂</span>
                <span class="text-sm">Face ID</span>
              </button>

              <button class="glass-btn flex-col flex-center" style="padding: 15px; gap: 8px;" onclick="window.performCheckIn()">
                <span style="font-size: 1.5rem;">📡</span>
                <span class="text-sm">Auto-Detect</span>
              </button>

              <button class="glass-btn flex-col flex-center" style="padding: 15px; gap: 8px;" onclick="window.performCheckIn()">
                <span style="font-size: 1.5rem;">🔔</span>
                <span class="text-sm">Notify</span>
              </button>
              
              <button class="glass-btn flex-col flex-center" style="padding: 15px; gap: 8px;" onclick="window.performCheckIn()">
                <span style="font-size: 1.5rem;">🎙️</span>
                <span class="text-sm">Voice</span>
              </button>

            </div>
          </div>

        </div>

        <!-- Right Panel: Schedule -->
        <div style="width: 380px; background: rgba(0,0,0,0.2); padding: 40px; overflow-y: auto; border-left: 1px solid rgba(255,255,255,0.05);">
          <h3 class="text-h2" style="margin-bottom: 25px;">Today's Schedule</h3>
          <div style="display: flex; flex-direction: column; gap: 12px;">
            
            ${(() => {
            const now = new Date();
            const todayStr = now.toISOString().split('T')[0];
            // Get raw bookings
            const rawBookings = dataManager.getRoomBookings(currentRoom.id, todayStr);

            if (rawBookings.length === 0) {
              return '<div class="glass-card" style="opacity: 0.5; text-align: center; padding: 30px;">No bookings for today</div>';
            }

            // Group contiguous slots (Logic from AdminDashboard)
            const groupedBookings = [];
            const userGroups = {};

            rawBookings.forEach(b => {
              const key = `${b.userName}-${b.date}`; // Group by user per day
              if (!userGroups[key]) userGroups[key] = [];
              userGroups[key].push(b);
            });

            Object.values(userGroups).forEach(slots => {
              const parseTime = (str) => parseInt(str.split('-')[0].trim().replace(':', ''));
              const getEndTime = (str) => parseInt(str.split('-')[1].trim().replace(':', ''));

              slots.sort((a, b) => parseTime(a.time) - parseTime(b.time));

              if (slots.length > 0) {
                let current = { ...slots[0] };
                for (let i = 1; i < slots.length; i++) {
                  const next = slots[i];
                  if (getEndTime(current.time) === parseTime(next.time)) {
                    // Merge
                    const start = current.time.split('-')[0].trim();
                    const end = next.time.split('-')[1].trim();
                    current.time = `${start} - ${end}`;
                  } else {
                    groupedBookings.push(current);
                    current = { ...next };
                  }
                }
                groupedBookings.push(current);
              }
            });

            // Sort by start time
            groupedBookings.sort((a, b) => {
              return parseInt(a.time.replace(':', '')) - parseInt(b.time.replace(':', ''));
            });

            return groupedBookings.map(b => {
              // Determine status based on time range
              const [startStr, endStr] = b.time.split('-').map(s => s.trim());
              const startH = parseInt(startStr.split(':')[0]);
              const endH = parseInt(endStr.split(':')[0]);
              const currentH = now.getHours();

              const isPast = endH <= currentH;
              const isActive = currentH >= startH && currentH < endH;

              // Visuals
              const opacity = isPast ? '0.5' : '1';
              const activeStyle = isActive ? `border-left: 4px solid ${statusColor}; background: rgba(255,255,255,0.15);` : '';
              const statusLabel = isPast ? 'Completed' : (isActive ? 'In Progress' : 'Upcoming');

              // Avatar Determination
              const isCurrentUser = (b.userName === users.current.name);
              const avatarUrl = isCurrentUser
                ? users.current.avatar
                : `https://ui-avatars.com/api/?name=${encodeURIComponent(b.userName || 'Unknown')}&background=random&color=fff&size=64`;

              return `
                      <div class="glass-card" style="opacity: ${opacity}; ${activeStyle} padding: 15px;">
                        <div class="flex-row" style="justify-content: space-between; margin-bottom: 5px;">
                          <div style="font-weight: 700; font-size: 1.1rem;">${b.time}</div>
                          <span class="text-sm" style="opacity: 0.8;">${statusLabel}</span>
                        </div>
                        <div class="flex-row gap-sm" style="opacity: 0.9;">
                           <img src="${avatarUrl}" alt="${b.userName}" style="width: 28px; height: 28px; border-radius: 50%; border: 2px solid rgba(255,255,255,0.2);" />
                           <p class="text-body">${b.userName || users.current.name}</p>
                        </div>
                      </div>
                    `;
            }).join('');
          })()}
            
          </div>
        </div>
      </div>
      `;
      } catch (err) {
        console.error("Tablet Render Error:", err);
        container.innerHTML = `
            <div class="glass-panel" style="padding: 20px; color: #f87171; text-align: center;">
                <h2>⚠️ Error Loading View</h2>
                <p>${err.message}</p>
                <button class="glass-btn" onclick="window.location.reload()">Reload</button>
            </div>
        `;
      }
    };

    // Ad-Hoc Booking Handler
    window.performAdhocBooking = () => {
      const room = dataManager.getRoom(parseInt(roomId));
      if (!room) return;

      const now = new Date();
      const currentHour = now.getHours();
      const todayStr = now.toISOString().split('T')[0];
      const timeSlot = `${currentHour < 10 ? '0' : ''}${currentHour}:00 - ${currentHour + 1 < 10 ? '0' : ''}${currentHour + 1}:00`;

      if (!confirm(`Book ${room.name} for now (${timeSlot})?`)) return;

      const result = dataManager.bookRoom(room.id, todayStr, timeSlot);

      if (result === true) {
        dataManager.checkIn(room.id);

        const toast = document.createElement('div');
        toast.style.cssText = `
                position: fixed; top: 30px; left: 50%; transform: translateX(-50%);
                background: #4ade80; color: #0f172a; padding: 12px 24px; border-radius: 50px;
                box-shadow: 0 10px 25px rgba(0,0,0,0.2); z-index: 9999;
                font-weight: 700; font-size: 1.1rem; opacity: 1; transition: opacity 0.3s;
            `;
        toast.innerText = `✅ Booked & Checked In!`;
        document.body.appendChild(toast);
        setTimeout(() => toast.remove(), 3000);

        render();
      } else {
        alert(result.message || "Booking Failed");
      }
    };

    render();
    interval = setInterval(render, 5000);
  };

  if (!roomId) {
    renderSelection();
  } else {
    renderRoomView(roomId);
  }

  return () => {
    if (interval) {
      clearInterval(interval);
      console.log(`[TabletApp] Cleanup for room ${roomId}`);
    }
  };
}
