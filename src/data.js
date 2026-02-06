// Helper for dynamic dates - Use Local Time Construction
const getTodayStr = () => {
    const d = new Date();
    const year = d.getFullYear();
    const month = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
};
const getTomorrowStr = () => {
    const d = new Date();
    d.setDate(d.getDate() + 1);
    const year = d.getFullYear();
    const month = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
};

const TODAY = getTodayStr();
const TOMORROW = getTomorrowStr();

// Initial Data
const defaultRooms = [
    {
        id: 1001,
        name: "Goku",
        type: "Pod",
        capacity: 1,
        facilities: ["Soundproof", "Power"],
        status: "available",
        image: "https://images.unsplash.com/photo-1519389950473-47ba0277781c?auto=format&fit=crop&w=600&q=80",
        bookings: [
            { date: TODAY, time: "10:00 - 11:00" },
            { date: TODAY, time: "14:00 - 15:00" }
        ]
    },
    {
        id: 1002,
        name: "Vegeta",
        type: "Pod",
        capacity: 1,
        facilities: ["Soundproof", "Monitor"],
        status: "occupied",
        image: "https://images.unsplash.com/photo-1554104707-a76b270e4bbb?auto=format&fit=crop&w=600&q=80",
        bookings: [
            { date: TODAY, time: "09:00 - 17:00" } // Full day
        ]
    },
    {
        id: 1003,
        name: "Piccolo",
        type: "Meeting Room",
        capacity: 4,
        facilities: ["TV", "Whiteboard"],
        status: "available",
        image: "https://images.unsplash.com/photo-1577412647305-991150c7d163?auto=format&fit=crop&w=600&q=80",
        bookings: []
    },
    {
        id: 1004,
        name: "Gohan",
        type: "Meeting Room",
        capacity: 6,
        facilities: ["4K Screen", "Mac Mini"],
        status: "available",
        image: "https://images.unsplash.com/photo-1497215728101-856f4ea42174?auto=format&fit=crop&w=600&q=80",
        bookings: [
            { date: TOMORROW, time: "10:00 - 11:30" }
        ]
    },
    {
        id: 1005,
        name: "Frieza",
        type: "Conference",
        capacity: 12,
        facilities: ["Projector", "Video Conf"],
        status: "occupied",
        image: "https://images.unsplash.com/photo-1542744173-8e7e53415bb0?auto=format&fit=crop&w=600&q=80",
        bookings: [
            { date: TODAY, time: "13:00 - 18:00" }
        ]
    },
    {
        id: 1006,
        name: "Shenron",
        type: "Event Space",
        capacity: 50,
        facilities: ["Stage", "Mic"],
        status: "available",
        image: "https://images.unsplash.com/photo-1505373877841-8d25f7d46678?auto=format&fit=crop&w=600&q=80",
        bookings: []
    }
];

const defaultUsers = {
    current: {
        name: "Alex Johnson",
        role: "Senior Designer",
        bookings: [
            {
                id: 501,
                roomId: 1001,
                roomName: "Goku",
                date: TODAY,
                time: "14:00 - 16:00",
                status: "confirmed"
            }
        ],
        avatar: "https://i.pravatar.cc/150?u=alex"
    }
};

// --- Data Manager for State Management & Persistence ---
class DataManager {
    constructor() {
        this.STORAGE_KEY_ROOMS = 'cw_rooms_v1';
        this.STORAGE_KEY_USERS = 'cw_users_v1';
        this.listeners = [];
        this.load();
    }

    load() {
        try {
            let sRooms = localStorage.getItem(this.STORAGE_KEY_ROOMS);
            const sUsers = localStorage.getItem(this.STORAGE_KEY_USERS);

            if (!sRooms) {
                this.rooms = defaultRooms;
                this.save(); // Initialize storage
            } else {
                this.rooms = JSON.parse(sRooms);
            }

            // Auto-Migration: Convert old "Today" strings to actual date
            let migrated = false;
            if (Array.isArray(this.rooms)) {
                this.rooms.forEach(room => {
                    if (room.bookings) {
                        room.bookings.forEach(b => {
                            if (b.date === "Today") {
                                b.date = TODAY;
                                migrated = true;
                            }
                            if (b.date === "Tomorrow") {
                                b.date = TOMORROW;
                                migrated = true;
                            }
                            // Fix "Fri, Feb 6" legacy format
                            if (typeof b.date === 'string' && b.date.includes(',')) {
                                try {
                                    const currentYear = new Date().getFullYear();
                                    const d = new Date(`${b.date}, ${currentYear}`);
                                    if (!isNaN(d.getTime())) {
                                        const year = d.getFullYear();
                                        const month = String(d.getMonth() + 1).padStart(2, '0');
                                        const day = String(d.getDate()).padStart(2, '0');
                                        b.date = `${year}-${month}-${day}`;
                                        migrated = true;
                                    }
                                } catch (e) { }
                            }

                        });
                    }
                });
            } else {
                // Recover from bad structure
                this.rooms = defaultRooms;
                migrated = true;
            }

            if (migrated) this.save();

            this.users = sUsers ? JSON.parse(sUsers) : defaultUsers;
        } catch (e) {
            console.error("Data Load Error:", e);
            this.rooms = defaultRooms;
            this.users = defaultUsers;
            this.save(); // Reset to fresh state
        }
    }

    save() {
        localStorage.setItem(this.STORAGE_KEY_ROOMS, JSON.stringify(this.rooms));
        localStorage.setItem(this.STORAGE_KEY_USERS, JSON.stringify(this.users));
        this.notify();
    }

    subscribe(callback) {
        this.listeners.push(callback);
    }

    notify() {
        this.listeners.forEach(cb => cb());
    }

    // --- Actions ---

    getRooms() {
        return this.rooms;
    }

    getUsers() {
        return this.users;
    }

    getCurrentUser() {
        return this.users.current;
    }

    getRoom(id) {
        return this.rooms.find(r => r.id === id);
    }

    // Force Reload to fix issues with old data structures if needed
    reset() {
        localStorage.removeItem(this.STORAGE_KEY_ROOMS);
        localStorage.removeItem(this.STORAGE_KEY_USERS);
        location.reload();
    }

    getRoomBookings(roomId, date) {
        // Strict matching of YYYY-MM-DD
        const room = this.getRoom(roomId);
        if (!room || !room.bookings) return [];
        return room.bookings.filter(b => b.date === date);
    }

    // 1. Book a Room (Employee App)
    bookRoom(roomId, customDate, customTime) {
        const roomIndex = this.rooms.findIndex(r => r.id === roomId);
        if (roomIndex === -1) return false;
        const room = this.rooms[roomIndex];

        // Ensure bookings array exists
        if (!room.bookings) room.bookings = [];

        // Validation: Prevent Double Booking
        const isDoubleBooked = room.bookings.some(b => b.date === customDate && b.time === customTime);
        if (isDoubleBooked) {
            return { success: false, message: `Slot ${customTime} is already booked! Please choose another.` };
        }

        // Add booking to Room's record
        room.bookings.push({
            date: customDate,
            time: customTime
        });

        // Update Room Status if booking is literally "Right Now"? 
        // For now, simple availability toggle via filters is enough.
        // We do NOT change 'status' permanently to 'occupied' based on a future booking
        // because that blocks the room entirely.
        // We only mark it 'occupied' if the booking is active NOW.
        // For this prototype, we'll leave the manual status intact or update it.
        const todayStr = new Date().toISOString().split('T')[0];
        if (customDate === todayStr) {
            // Optional: Check if time matches current hour
            // room.status = 'occupied'; 
        }

        // Update User Bookings
        const pin = Math.floor(1000 + Math.random() * 9000); // 4-digit PIN
        const newBooking = {
            id: Date.now(),
            roomId: room.id,
            roomName: room.name,
            date: customDate,
            time: customTime,
            status: "confirmed",
            pin: pin
        };
        this.users.current.bookings.unshift(newBooking);

        this.save();
        return true;
    }

    // 1.5 Cancel Booking
    cancelBooking(bookingId) {
        // Find booking in user list
        const bookingIndex = this.users.current.bookings.findIndex(b => b.id.toString() === bookingId.toString());
        if (bookingIndex === -1) return false;

        const booking = this.users.current.bookings[bookingIndex];

        // Remove from Room's records
        const room = this.getRoom(booking.roomId);
        if (room && room.bookings) {
            // Find and remove the specific slot
            const slotIndex = room.bookings.findIndex(b => b.date === booking.date && b.time === booking.time);
            if (slotIndex !== -1) {
                room.bookings.splice(slotIndex, 1);
            }
        }

        // Remove from User's records
        this.users.current.bookings.splice(bookingIndex, 1);

        this.save();
        return true;
    }



    // 1.2 Book Multiple Slots (Atomic)
    bookSlots(roomId, date, times) {
        if (!Array.isArray(times) || times.length === 0) return { success: false, message: "No times selected." };

        const roomIndex = this.rooms.findIndex(r => r.id === roomId);
        if (roomIndex === -1) return { success: false, message: "Room not found." };
        const room = this.rooms[roomIndex];
        if (!room.bookings) room.bookings = [];

        // 1. Validate ALL slots first (Atomic Check)
        const conflicts = [];
        times.forEach(time => {
            const isTaken = room.bookings.some(b => b.date === date && b.time === time);
            if (isTaken) conflicts.push(time);
        });

        if (conflicts.length > 0) {
            return { success: false, message: `Slots ${conflicts.join(', ')} are no longer available.` };
        }

        // 2. Book ALL slots (Granular for Room)
        times.forEach(time => {
            room.bookings.push({ date, time });
        });

        // 3. Smart Merge for User Ticket (User Friendly)
        // Parse times to verify continuity
        const parseTime = (str) => {
            const [start, end] = str.split('-').map(s => s.trim());
            return {
                original: str,
                start: parseInt(start.replace(':', '')),
                end: parseInt(end.replace(':', ''))
            };
        };

        const sortedTimes = times.map(parseTime).sort((a, b) => a.start - b.start);
        const mergedBookings = [];

        if (sortedTimes.length > 0) {
            let current = sortedTimes[0];

            for (let i = 1; i < sortedTimes.length; i++) {
                const next = sortedTimes[i];
                if (next.start === current.end) {
                    // Continuity detected: Merge
                    current.end = next.end;
                    // Update string representation roughly (e.g. 0900 -> 09:00)
                    // Or smarter: just keep reference to End string? 
                    // Let's reconstruct the string at the end or track start/end strings.
                } else {
                    // Gap detected: Push current and start new
                    mergedBookings.push(current);
                    current = next;
                }
            }
            mergedBookings.push(current);
        }

        // Helper to formatting integer time back to HH:MM
        const formatTime = (num) => {
            const str = num.toString().padStart(4, '0');
            return `${str.slice(0, 2)}:${str.slice(2)}`;
        };

        // Create User Bookings from Merged Blocks
        const newBookings = mergedBookings.map(block => {
            const timeStr = `${formatTime(block.start)} - ${formatTime(block.end)}`;
            const pin = Math.floor(1000 + Math.random() * 9000);
            return {
                id: Date.now().toString() + '-' + Math.floor(Math.random() * 1000),
                roomId: room.id,
                roomName: room.name,
                date: date,
                time: timeStr,
                status: "confirmed",
                pin: pin
            };
        });

        // Add to user in batch (reverse order to show newest first)
        this.users.current.bookings.unshift(...newBookings.reverse());

        this.save();
        return { success: true };
    }

    // 2. Clear/Clean Room (Admin)
    clearRoom(roomId) {
        const roomIndex = this.rooms.findIndex(r => r.id === roomId);
        if (roomIndex === -1) return;

        // Reset Room
        this.rooms[roomIndex].status = 'available';
        delete this.rooms[roomIndex].bookedBy;

        this.save();
    }

    // 3. Tablet Check-In (For Demo, we just confirm occupancy or toggle)
    checkIn(roomId) {
        // Simulation: For now just alert or ensure it is occupied
        // If we want real logic: check-in makes a 'reserved' room 'occupied'.
        // But our simple model just has available/occupied.
        // Let's say check-in validaties the booking.
        return true;
    }
}

export const dataManager = new DataManager();
