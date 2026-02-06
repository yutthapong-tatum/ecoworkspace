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

          <!-- Room Management -->
          <div class="glass-panel" style="padding: 20px;">
            <div class="flex-row" style="justify-content: space-between; margin-bottom: 20px;">
              <h3 class="text-h3">Room Management</h3>
              <input type="text" class="glass-input" style="width: 250px;" placeholder="Filter rooms..." />
            </div>

            <table style="width: 100%; border-collapse: collapse;">
              <thead>
                <tr style="border-bottom: 1px solid rgba(255,255,255,0.1);">
                  <th style="text-align: left; padding: 15px;">Name</th>
                  <th style="text-align: left; padding: 15px;">Type</th>
                  <th style="text-align: left; padding: 15px;">Capacity</th>
                  <th style="text-align: left; padding: 15px;">Status</th>
                  <th style="text-align: left; padding: 15px;">Booked By</th>
                  <th style="text-align: right; padding: 15px;">Actions</th>
                </tr>
              </thead>
              <tbody>
                ${rooms.map(room => `
                  <tr style="border-bottom: 1px solid rgba(255,255,255,0.05); transition: background 0.2s;">
                    <td style="padding: 15px;">
                        <strong>${room.name}</strong><br>
                        <span class="text-sm">#${room.id}</span>
                    </td>
                    <td style="padding: 15px; opacity: 0.8;">${room.type}</td>
                    <td style="padding: 15px;">${room.capacity}</td>
                    <td style="padding: 15px;">
                      <span style="padding: 4px 10px; border-radius: 20px; background: ${room.status === 'available' ? 'rgba(74, 222, 128, 0.2)' : 'rgba(248, 113, 113, 0.2)'}; color: ${room.status === 'available' ? '#4ade80' : '#f87171'}; font-weight: 700; font-size: 0.8rem;">
                        ${room.status.toUpperCase()}
                      </span>
                    </td>
                    <td style="padding: 15px;">
                        ${room.bookedBy ? `
                          <div class="flex-row gap-sm">
                              <img src="${room.bookedBy.avatar}" style="width: 24px; height: 24px; border-radius: 50%; border: 1px solid rgba(255,255,255,0.3);" />
                              <span class="text-sm" style="color:white;">${room.bookedBy.name}</span>
                          </div>
                        ` : '<span class="text-sm" style="opacity: 0.3;">-</span>'}
                    </td>
                    <td style="padding: 15px; text-align: right;">
                      <button class="glass-btn btn-clear" data-id="${room.id}" style="padding: 6px 12px; font-size: 0.8rem; ${room.status === 'available' ? 'display: none;' : 'background: rgba(248, 113, 113, 0.8); color: white;'}">🗑 Clear</button>
                    </td>
                  </tr>
                `).join('')}
              </tbody>
            </table>
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
