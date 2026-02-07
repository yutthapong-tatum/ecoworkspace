import { dataManager } from '../data.js';

export function renderAdminDashboard(container) {
  const render = () => {
    const rooms = dataManager.getRooms();

    container.innerHTML = `
        <div class="container">
          <header class="flex-row" style="justify-content: space-between; margin-bottom: 40px; padding-top: 20px;">
            <div>
              <h2 class="text-h2">Dashboard</h2>
              <p class="text-body">Overview of space utilization.</p>
            </div>
            <div class="flex-row gap-md">
               <button class="glass-btn" style="background: rgba(255,255,255,0.2);">Download Report</button>
               <button class="glass-btn">Settings</button>
            </div>
          </header>

          <!-- Analytics Cards -->
          <div class="grid-cols-2" style="grid-template-columns: repeat(3, 1fr); margin-bottom: 40px;">
             <div class="glass-card">
               <h3 class="text-h3">Occupancy</h3>
               <p class="text-h1" style="color: var(--success);">
                 ${(() => {
        const total = rooms.length;
        const occupied = rooms.filter(r => r.status === 'occupied').length;
        return Math.round((occupied / total) * 100);
      })()}%
               </p>
               <p class="text-sm">${rooms.filter(r => r.status === 'occupied').length} rooms currently active</p>
             </div>
             <div class="glass-card">
               <h3 class="text-h3">Upcoming</h3>
               <p class="text-h1" style="color: var(--warning);">
                 ${(() => {
        const users = dataManager.getUsers();
        return users.current.bookings.length;
      })()}
               </p>
               <p class="text-sm">Total reservations in system</p>
             </div>
             <div class="glass-card">
               <h3 class="text-h3">System Status</h3>
               <p class="text-h1" style="color: var(--info);">Active</p>
               <p class="text-sm">Connectivity: High</p>
             </div>
          </div>

          <!-- Admin Grid Layout (Side-by-Side on Desktop) -->
          <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(400px, 1fr)); gap: 2rem; margin-bottom: 40px;">

            <!-- Left: Room Management -->
            <div class="glass-panel" style="padding: 2.5rem;">
              <div class="flex-row" style="justify-content: space-between; margin-bottom: 20px;">
                <h3 class="text-h3">Room Management</h3>
                <input type="text" class="glass-input" style="width: 200px;" placeholder="Filter rooms..." />
              </div>

              <div style="overflow-x: auto;">
                <table style="width: 100%; border-collapse: collapse;">
                  <thead>
                    <tr style="border-bottom: 1px solid rgba(255,255,255,0.1);">
                      <th style="text-align: left; padding: 15px;">Name</th>
                      <th style="text-align: left; padding: 15px;">Status</th>
                      <th style="text-align: right; padding: 15px;">Action</th>
                    </tr>
                  </thead>
                  <tbody>
                    ${rooms.map(room => `
                      <tr style="border-bottom: 1px solid rgba(255,255,255,0.05);">
                        <td style="padding: 15px;">
                            <strong>${room.name}</strong><br>
                            <span class="text-sm">#${room.id}</span>
                        </td>
                        <td style="padding: 15px;">
                          <span style="padding: 4px 10px; border-radius: 20px; background: ${room.status === 'available' ? 'rgba(74, 222, 128, 0.2)' : 'rgba(248, 113, 113, 0.2)'}; color: ${room.status === 'available' ? '#4ade80' : '#f87171'}; font-weight: 700; font-size: 0.8rem;">
                            ${room.status.toUpperCase()}
                          </span>
                        </td>
                        <td style="padding: 15px; text-align: right;">
                          <button class="glass-btn btn-clear" data-id="${room.id}" style="padding: 6px 12px; font-size: 0.8rem; ${room.status === 'available' ? 'display: none;' : 'background: rgba(248, 113, 113, 0.8); color: white;'}">Clear</button>
                        </td>
                      </tr>
                    `).join('')}
                  </tbody>
                </table>
              </div>
            </div>

            <!-- Right: Recent Activity Log (Detailed) -->
            <div class="glass-panel" style="padding: 2.5rem; display: flex; flex-direction: column;">
               <h3 class="text-h3" style="margin-bottom: 1.5rem;">Recent Booking Activity</h3>
               <div style="flex: 1; overflow-y: auto; max-height: 400px; padding-right: 5px;">
                  <table style="width: 100%; border-collapse: collapse;">
                     <thead style="position: sticky; top: 0; background: rgba(30, 41, 59, 1); z-index: 1;">
                        <tr style="border-bottom: 1px solid rgba(255,255,255,0.1);">
                           <th style="text-align: left; padding: 12px;">User / Room</th>
                           <th style="text-align: left; padding: 12px;">Time / Date</th>
                           <th style="text-align: center; padding: 12px;">PIN</th>
                           <th style="text-align: right; padding: 12px;">Status</th>
                        </tr>
                     </thead>
                     <tbody>
                        ${(() => {
        const allBookings = [];

        // Pull merged/ticket data from each room's bookings
        rooms.forEach(room => {
          if (!room.bookings) return;

          // Group by userName and date
          const userDateGroups = {};
          room.bookings.forEach(b => {
            const key = `${b.userName || 'Unknown User'}-${b.date}`;
            if (!userDateGroups[key]) userDateGroups[key] = [];
            userDateGroups[key].push(b);
          });

          // Merge contiguous blocks and extract PIN/Status
          Object.values(userDateGroups).forEach(slots => {
            const parseTime = (str) => parseInt(str.split('-')[0].trim().replace(':', ''));
            const getEndTime = (str) => parseInt(str.split('-')[1].trim().replace(':', ''));

            slots.sort((a, b) => parseTime(a.time) - parseTime(b.time));

            if (slots.length > 0) {
              let current = { ...slots[0] };
              // Use the PIN/Status from the first slot (assuming uniformity for the block)
              current.pin = current.pin || '----';
              current.status = current.status || 'Confirmed';

              for (let i = 1; i < slots.length; i++) {
                const next = slots[i];
                if (parseTime(next.time) === getEndTime(current.time)) {
                  current.time = `${current.time.split('-')[0].trim()} - ${next.time.split('-')[1].trim()}`;
                } else {
                  allBookings.push({ ...current, roomName: room.name });
                  current = { ...next };
                  current.pin = current.pin || '----';
                  current.status = current.status || 'Confirmed';
                  current.avatar = current.avatar || next.avatar;
                }
              }
              allBookings.push({ ...current, roomName: room.name });
            }
          });
        });

        // Sort by Date (desc)
        const sorted = [...allBookings].sort((a, b) => b.date.localeCompare(a.date) || b.time.localeCompare(a.time));

        if (sorted.length === 0) return '<tr><td colspan="4" style="text-align:center; padding: 20px; opacity: 0.5;">No recent data</td></tr>';

        return sorted.map(b => `
                            <tr style="border-bottom: 1px solid rgba(255,255,255,0.05);">
                              <td style="padding: 12px; font-size: 0.9rem; display: flex; align-items: center; gap: 10px;">
                                  <img src="${b.avatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(b.userName || 'Unknown')}&background=random&color=fff`}" alt="${b.userName}" style="width: 32px; height: 32px; border-radius: 50%; border: 2px solid rgba(255,255,255,0.2);" />
                                  <div>
                                    <div style="font-weight: 600;">${b.userName || 'Unknown'}</div>
                                    <div style="font-size: 0.8rem; opacity: 0.7;">${b.roomName}</div>
                                  </div>
                              </td>
                              <td style="padding: 12px; font-size: 0.9rem;">
                                  <div>${b.time}</div>
                                  <div style="font-size: 0.8rem; opacity: 0.6;">${b.date}</div>
                              </td>
                              <td style="padding: 12px; font-size: 0.9rem; text-align: center; font-family: monospace; letter-spacing: 1px; color: #fbbf24;">
                                  ${b.pin || '****'}
                              </td>
                              <td style="padding: 12px; text-align: right;">
                                ${(() => {
            // Dynamic Status Logic (Same as Tablet)
            const now = new Date();
            const todayStr = now.toISOString().split('T')[0];
            let displayStatus = b.status === 'checked-in' ? 'Checked In' : 'Booked';
            let statusColor = b.status === 'checked-in' ? '#4ade80' : '#3b82f6'; // Green vs Blue
            let bg = b.status === 'checked-in' ? 'rgba(74, 222, 128, 0.1)' : 'rgba(59, 130, 246, 0.1)';

            if (b.status === 'confirmed' && b.date === todayStr) {
              const currentTotal = now.getHours() * 60 + now.getMinutes();
              const [startStr] = b.time.split('-').map(s => s.trim());
              const startH = parseInt(startStr.split(':')[0]);
              const startM = parseInt(startStr.split(':')[1]);
              const startTotal = startH * 60 + startM;

              // If within 15 mins start window
              if (currentTotal >= startTotal && currentTotal < startTotal + 15) {
                displayStatus = 'Waiting Info';
                statusColor = '#fbbf24'; // Amber
                bg = 'rgba(251, 191, 36, 0.1)';
              } else if (currentTotal > startTotal + 15) {
                displayStatus = 'Late / No Show'; // Should be auto-released but if lag
                statusColor = '#f87171'; // Red
                bg = 'rgba(248, 113, 113, 0.1)';
              }
            }

            return `
                                    <span style="font-size: 0.75rem; padding: 2px 8px; border-radius: 4px; background: ${bg}; color: ${statusColor}; border: 1px solid ${statusColor}44;">
                                      ${displayStatus}
                                    </span>`;
          })()}
                              </td>
                            </tr>
                          `).join('');
      })()}
                     </tbody>
                  </table>
               </div>
            </div>

          </div>

        </div>
      `;

    // Attach Listeners
    container.querySelectorAll('.btn-clear').forEach(btn => {
      btn.addEventListener('click', (e) => {
        const id = parseInt(e.target.dataset.id);
        if (confirm('Force clear this room?')) {
          dataManager.clearRoom(id);
          render();
        }
      });
    });
  };

  render();
}
