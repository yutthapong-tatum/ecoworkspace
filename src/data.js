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
        bookings: []
    },
    {
        id: 1002,
        name: "Vegeta",
        type: "Pod",
        capacity: 1,
        facilities: ["Soundproof", "Monitor"],
        status: "available", // Reset to available
        image: "https://images.unsplash.com/photo-1554104707-a76b270e4bbb?auto=format&fit=crop&w=600&q=80",
        bookings: [
            // Remove Vegeta Prince default booking to be clean
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
        bookings: []
    },
    {
        id: 1005,
        name: "Frieza",
        type: "Conference",
        capacity: 12,
        facilities: ["Projector", "Video Conf"],
        status: "available", // Reset to available
        image: "https://images.unsplash.com/photo-1542744173-8e7e53415bb0?auto=format&fit=crop&w=600&q=80",
        bookings: []
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
        avatar: "https://i.pravatar.cc/150?u=alex",
        bookings: [] // Clean start
    }
};

// --- Data Manager for State Management & Persistence ---
class DataManager {
    constructor() {
        this.STORAGE_KEY_ROOMS = 'cw_rooms_v2';
        this.STORAGE_KEY_USERS = 'cw_users_v2';
        this.listeners = [];
        this.load();
    }

    load() {
        try {
            let sRooms = localStorage.getItem(this.STORAGE_KEY_ROOMS);
            const sUsers = localStorage.getItem(this.STORAGE_KEY_USERS);

            if (!sRooms) {
                // Deep Copy to prevent memory reference issues
                this.rooms = JSON.parse(JSON.stringify(defaultRooms));
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

                            // Auto-populate missing avatars
                            if (!b.avatar) {
                                if (b.userName === this.users?.current?.name) {
                                    b.avatar = this.users.current.avatar;
                                } else {
                                    b.avatar = `https://ui-avatars.com/api/?name=${encodeURIComponent(b.userName || 'U')}&background=random`;
                                }
                                migrated = true;
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

            // Load Users (Deep Copy Default)
            this.users = sUsers ? JSON.parse(sUsers) : JSON.parse(JSON.stringify(defaultUsers));
        } catch (e) {
            console.error("Data Load Error:", e);
            this.rooms = JSON.parse(JSON.stringify(defaultRooms));
            this.users = JSON.parse(JSON.stringify(defaultUsers));
            this.save(); // Reset to fresh state
        }
    }

    // ... (save, subscribe, notify ...)

    save() {
        localStorage.setItem(this.STORAGE_KEY_ROOMS, JSON.stringify(this.rooms));
        localStorage.setItem(this.STORAGE_KEY_USERS, JSON.stringify(this.users));
        this.notify();
    }

    subscribe(callback) { this.listeners.push(callback); }
    notify() { this.listeners.forEach(cb => cb()); }

    // --- Centralized Configuration ---
    getAppConfig() {
        return {
            timeSlots: [
                "08:00 - 09:00", "09:00 - 10:00", "10:00 - 11:00", "11:00 - 12:00",
                "13:00 - 14:00", "14:00 - 15:00", "15:00 - 16:00",
                "16:00 - 17:00", "17:00 - 18:00"
            ],
            lunchBreak: { start: 12, end: 13 },
            checkInWindow: 15 // minutes
        };
    }

    // --- Actions ---

    getRooms() { return this.rooms; }
    getUsers() { return this.users; }
    getCurrentUser() { return this.users.current; }
    getRoom(id) { return this.rooms.find(r => r.id === id); }

    // --- Centralized Status Logic ---
    getRoomStatus(roomId) {
        const room = this.getRoom(roomId);
        if (!room) return { status: 'UNKNOWN', color: '#94a3b8', sub: 'Room not found', interactable: false };

        const now = new Date();
        const currentHour = now.getHours();
        const currentMinute = now.getMinutes();
        const currentTotalMinutes = currentHour * 60 + currentMinute;
        const todayStr = now.toISOString().split('T')[0];

        // 1. Check Lunch Break
        const { lunchBreak, checkInWindow } = this.getAppConfig();
        if (currentHour >= lunchBreak.start && currentHour < lunchBreak.end) {
            return { status: 'UNAVAILABLE', color: '#94a3b8', sub: 'Lunch Break (12:00 - 13:00)', interactable: false };
        }

        // 2. Check Active Bookings
        const activeBooking = room.bookings?.find(b => {
            if (b.date !== todayStr) return false;
            if (!b.time || typeof b.time !== 'string') return false; // Safety Check

            const parts = b.time.split('-');
            if (parts.length !== 2) return false; // Invalid format

            const [startStr, endStr] = parts.map(s => s.trim());

            // Validate time format
            if (!startStr.includes(':') || !endStr.includes(':')) return false;

            const startH = parseInt(startStr.split(':')[0]);
            const startM = parseInt(startStr.split(':')[1]);
            const endH = parseInt(endStr.split(':')[0]);
            const endM = parseInt(endStr.split(':')[1]);

            // Check for NaN
            if (isNaN(startH) || isNaN(startM) || isNaN(endH) || isNaN(endM)) return false;

            const startTotal = startH * 60 + startM;
            const endTotal = endH * 60 + endM;

            // Coverage: [Start, End)
            return currentTotalMinutes >= startTotal && currentTotalMinutes < endTotal;
        });

        if (activeBooking) {
            if (activeBooking.status === 'checked-in') {
                return {
                    status: 'OCCUPIED',
                    color: '#f87171', // Red
                    sub: `Occupied by ${activeBooking.userName}`,
                    interactable: false // Can't book, but maybe check-out/extend later
                };
            } else if (activeBooking.status === 'confirmed') {
                // Determine if late or waiting
                // Logic: It's active time, but not checked in.

                // If we are strictly implementing "Auto Release", this state only exists 
                // for the first 15 mins. After that, it should be released or "Late".
                return {
                    status: 'WAITING FOR CHECK-IN',
                    color: '#fbbf24', // Amber
                    sub: `Please check in within ${checkInWindow} mins`,
                    interactable: true // Can Check In
                };
            }
        }

        return {
            status: 'AVAILABLE',
            color: '#4ade80', // Green
            sub: 'Ready for use',
            interactable: true // Can Book
        };
    }

    // Force Reload to fix issues with old data structures if needed
    reset() {
        // Nuclear Option: Clear EVERYTHING
        // Remove all known keys explicitly first
        localStorage.removeItem('cw_rooms_v1');
        localStorage.removeItem('cw_users_v1');
        localStorage.removeItem('cw_rooms_v2');
        localStorage.removeItem('cw_users_v2');

        // Then clear everything else
        localStorage.clear();

        // Force hard reload (bypass cache)
        window.location.reload(true);
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

        // Validation: Prevent Double Booking (Overlap Check)
        const parseMinutes = (timeStr) => {
            const [h, m] = timeStr.split(':').map(Number);
            return h * 60 + m;
        };

        const [newStartStr, newEndStr] = customTime.split('-').map(s => s.trim());
        const newStart = parseMinutes(newStartStr);
        const newEnd = parseMinutes(newEndStr);

        const isDoubleBooked = room.bookings.some(b => {
            if (b.date !== customDate) return false;
            // Check overlap
            const [bStartStr, bEndStr] = b.time.split('-').map(s => s.trim());
            const bStart = parseMinutes(bStartStr);
            const bEnd = parseMinutes(bEndStr);

            // Overlap if (StartA < EndB) and (EndA > StartB)
            return (newStart < bEnd && newEnd > bStart);
        });

        if (isDoubleBooked) {
            return { success: false, message: `Time slot ${customTime} overlaps with an existing booking!` };
        }

        // Validation: Prevent User from Double Booking (Concurrent Bookings)
        // One user cannot be in two rooms at once.
        const hasUserConflict = this.users.current.bookings.some(ub => {
            if (ub.date !== customDate) return false;
            // status check? even if 'checked-in', they are busy. 
            // If 'confirmed' or 'checked-in', it's a conflict.

            const [uStartStr, uEndStr] = ub.time.split('-').map(s => s.trim());
            const uStart = parseMinutes(uStartStr);
            const uEnd = parseMinutes(uEndStr);

            return (newStart < uEnd && newEnd > uStart);
        });

        if (hasUserConflict) {
            return { success: false, message: "You already have a booking during this time!" };
        }

        // Add booking to Room's record
        room.bookings.push({
            date: customDate,
            time: customTime,
            userName: this.users.current.name,
            avatar: this.users.current.avatar
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
            pin: pin,
            avatar: this.users.current.avatar,
            createdAt: Date.now()
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

        // 1. Validation: Prevent Concurrent Bookings
        const userBookings = this.users.current.bookings || [];
        const hasConflict = times.some(newTime => {
            return userBookings.some(existing => {
                // Check date match first
                if (existing.date !== date) return false;

                // Check time overlap
                // Format is HH:MM - HH:MM
                const [newStart, newEnd] = newTime.split('-').map(t => parseInt(t.replace(':', '')));
                const [existStart, existEnd] = existing.time.split('-').map(t => parseInt(t.replace(':', '')));

                // Simple overlap check: (StartA < EndB) and (EndA > StartB)
                return (newStart < existEnd && newEnd > existStart);
            });
        });

        if (hasConflict) {
            return {
                success: false,
                message: "You already have a booking during this time slot."
            };
        }

        // 2. Book ALL slots (Granular for Room)
        times.forEach(time => {
            room.bookings.push({
                date,
                time,
                userName: this.users.current.name,
                avatar: this.users.current.avatar
            });
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
                pin: pin,
                avatar: this.users.current.avatar,
                createdAt: Date.now()
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

    // 3. Tablet Check-In & Auto-Release
    checkIn(roomId) {
        const room = this.getRoom(roomId);
        if (!room || !room.bookings) return false;

        const now = new Date();
        const currentTime = now.getHours() * 100 + now.getMinutes();
        const todayStr = now.toISOString().split('T')[0];

        // Find active booking for NOW that is 'confirmed'
        // Find active booking for NOW (or upcoming within 15 mins) that is 'confirmed'
        const activeBooking = room.bookings.find(b => {
            if (b.date !== todayStr) return false;
            const [startStr, endStr] = b.time.split('-').map(s => s.trim());

            const startH = parseInt(startStr.split(':')[0]);
            const startM = parseInt(startStr.split(':')[1]);
            const startTime = startH * 100 + startM;

            const endH = parseInt(endStr.split(':')[0]);
            const endM = parseInt(endStr.split(':')[1]);
            const endTime = endH * 100 + endM;

            // Buffer: Allow check-in 15 mins before start
            // Convert to minutes for easier calc
            const currentTotal = Math.floor(currentTime / 100) * 60 + (currentTime % 100);
            const startTotal = startH * 60 + startM;
            const endTotal = endH * 60 + endM;

            // Logic:
            // 1. Inside the slot: Start <= Now < End
            // 2. Early Arrival: Start - 15 <= Now < Start
            return (currentTotal >= startTotal - 15 && currentTotal < endTotal);
        });

        if (activeBooking && activeBooking.status === 'confirmed') {
            activeBooking.status = 'checked-in';
            // Also update user's record
            this.users.current.bookings.forEach(ub => {
                if (ub.roomId === roomId && ub.date === activeBooking.date && ub.time === activeBooking.time) {
                    ub.status = 'checked-in';
                }
            });
            this.save();
            return { success: true, message: `Welcome, ${activeBooking.userName}!` };
        }

        return { success: false, message: "No active booking found to check in." };
    }

    checkAutoRelease(roomId) {
        const room = this.getRoom(roomId);
        if (!room || !room.bookings) return;

        const now = new Date();
        const currentTotalMinutes = now.getHours() * 60 + now.getMinutes();
        const todayStr = now.toISOString().split('T')[0];
        let changed = false;

        // Filter out bookings that missed the 15-min window
        // Keep bookings that are:
        // 1. Not today
        // 2. Today but future
        // 3. Today, past start, but 'checked-in'
        // 4. Today, past start, 'confirmed', but within 15 mins of start

        const originalLength = room.bookings.length;
        room.bookings = room.bookings.filter(b => {
            if (b.date !== todayStr) return true; // Keep other dates
            if (b.status === 'checked-in') return true; // Keep checked-in

            const [startStr] = b.time.split('-').map(s => s.trim());
            const startHour = parseInt(startStr.split(':')[0]);
            const startMin = parseInt(startStr.split(':')[1]);

            const startTotalMinutes = startHour * 60 + startMin;
            const diff = currentTotalMinutes - startTotalMinutes;

            // If it's waiting (>0) and diff > 15 mins and still 'confirmed' -> DROP
            if (diff > 15 && b.status === 'confirmed') {

                // Smart Check: Late Booking Grace Period
                // If the booking was created RECENTLY (within last 15 mins), do NOT drop it yet.
                // This handles "Walk-up / Late" bookings (e.g. booking 13:00 at 13:20)
                if (b.createdAt) {
                    const createdMinsAgo = (Date.now() - b.createdAt) / 60000;
                    if (createdMinsAgo < 15) return true; // Keep it
                }

                // Remove from User's list too
                // DISABLED: User feedback indicates this is too aggressive.
                // Keeping booking active even if late.
                /* 
                this.users.current.bookings = this.users.current.bookings.filter(ub =>
                    !(ub.roomId === roomId && ub.date === b.date && ub.time === b.time)
                );
                return false; // Auto-Release
                */
            }
            return true;
        });

        if (room.bookings.length !== originalLength) {
            this.save();
            return true; // Signal visual update
        }
        return false;
    }
}

export const dataManager = new DataManager();

// Make dataManager globally accessible for inline onclick handlers
if (typeof window !== 'undefined') {
    window.dataManager = dataManager;
}
