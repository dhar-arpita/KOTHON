import { useAuth } from '../context/AuthContext';
import Sidebar from '../components/Sidebar';
import { useState } from 'react';
import ChatWindow from '../components/ChatWindow';

export default function HomePage() {
  const { user } = useAuth();
  const [selectedRoom, setSelectedRoom] = useState(null);

  return (
    <div className="flex h-screen bg-[#111b21]">
        {/* Sidebar — mobile এ selectedRoom না থাকলে দেখাবে */}
        <div className={`
            w-full md:w-80 flex flex-col border-r border-[#2a3942]
            ${selectedRoom ? 'hidden md:flex' : 'flex'}
        `}>
            <Sidebar onRoomSelect={setSelectedRoom} selectedRoom={selectedRoom} />
        </div>

        {/* ChatWindow — mobile এ selectedRoom থাকলে দেখাবে */}
        <div className={`
            flex-1
            ${selectedRoom ? 'flex' : 'hidden md:flex'}
            flex-col
        `}>
            <ChatWindow
                room={selectedRoom}
                onBack={() => setSelectedRoom(null)}
                onRoomUpdate={setSelectedRoom}
            />
        </div>
    </div>
  );
}