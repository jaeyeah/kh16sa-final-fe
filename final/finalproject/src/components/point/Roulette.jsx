import React, { useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import { toast } from 'react-toastify';
import { useAtomValue } from "jotai";
import { loginIdState } from "../../utils/jotai";
import Swal from 'sweetalert2';
import './Roulette.css'; 

// 아이템 설정 (배경색 추가)
const ROULETTE_ITEMS = [
    { name: "1000 P", value: 1000, icon: "💰", color: "#f1c40f" }, // 0
    { name: "다음 기회에", value: 0, icon: "😢", color: "#34495e" }, // 1
    { name: "꽝", value: 0, icon: "❌", color: "#3498db" },        // 2
    { name: "꽝", value: 0, icon: "❌", color: "#2c3e50" },        // 3
    { name: "2000 P", value: 2000, icon: "💎", color: "#a366ff" }, // 4
    { name: "다음 기회에", value: 0, icon: "😢", color: "#34495e" }, // 5
];

export default function Roulette({ refreshPoint, setTab }) {
    const loginId = useAtomValue(loginIdState);
    const [isSpinning, setIsSpinning] = useState(false);
    const [rotation, setRotation] = useState(0);
    const [ticketCount, setTicketCount] = useState(0);

    const TICKET_ITEM_TYPE = "RANDOM_ROULETTE";

    const loadTicketCount = useCallback(async () => {
        if (!loginId) return;
        try {
            const resp = await axios.get("/point/main/store/inventory/my");
            const tickets = resp.data.filter(item => item.pointItemType === TICKET_ITEM_TYPE);
            const total = tickets.reduce((acc, curr) => acc + curr.inventoryQuantity, 0);
            setTicketCount(total);
        } catch (e) {
            console.error("티켓 조회 실패", e);
        }
    }, [loginId]);

    useEffect(() => {
        loadTicketCount();
    }, [loadTicketCount]);

    const handleSpin = async () => {
        if (isSpinning) return;
        if (ticketCount <= 0) {
            toast.warning("🎟️ 룰렛 이용권이 없습니다. 상점에서 구매해주세요!");
            return;
        }

        const confirmResult = await Swal.fire({
            title: 'LUCKY SPIN!',
            text: `이용권 1장을 사용하여 룰렛을 돌리시겠습니까?`,
            icon: 'question',
            showCancelButton: true,
            confirmButtonColor: '#f1c40f',
            cancelButtonColor: '#444',
            confirmButtonText: '돌리기',
            cancelButtonText: '취소',
            background: '#1a1a1a',
            color: '#fff'
        });

        if (!confirmResult.isConfirmed) return;

        setIsSpinning(true);

        try {
            const resp = await axios.post("/point/main/store/roulette");
            const resultIndex = resp.data; // 서버에서 오는 인덱스 (0~5)

            const segmentAngle = 360 / ROULETTE_ITEMS.length; // 60도
            const additionalSpins = 360 * 10; // 10바퀴 회전 효과
            
            // [계산] 현재 각도 초기화 + 10바퀴 + (인덱스에 해당하는 각도만큼 역회전하여 12시로 맞춤)
            const targetRotation = rotation + additionalSpins - (resultIndex * segmentAngle) - (rotation % 360);
            setRotation(targetRotation);

            setTimeout(async () => {
                const winItem = ROULETTE_ITEMS[resultIndex];
                
                if (winItem.value > 0) {
                    await Swal.fire({
                        title: `🎊 당첨을 축하합니다!`,
                        html: `<div style="font-size: 1.2rem; margin-bottom: 10px;">결과: <b>${winItem.name}</b></div>
                               <div style="color: #f1c40f;">${winItem.value} 포인트가 지급되었습니다!</div>`,
                        icon: 'success',
                        background: '#1a1a1a',
                        color: '#fff',
                        confirmButtonColor: '#f1c40f'
                    });
                } else {
                    await Swal.fire({
                        title: `아쉬워요!`,
                        text: `결과: ${winItem.name}`,
                        icon: 'info',
                        background: '#1a1a1a',
                        color: '#fff',
                        confirmButtonColor: '#3498db'
                    });
                }
                
                setIsSpinning(false);
                loadTicketCount();
                if (refreshPoint) refreshPoint();
            }, 4000);

        } catch (e) {
            console.error(e);
            toast.error("룰렛 서버 통신 중 오류가 발생했습니다.");
            setIsSpinning(false);
        }
    };

    return (
        <div className="roulette-wrapper">
            <div className="roulette-glass-card">
                <h2 className="roulette-title">🎰 LUCKY SPIN</h2>
                
                <div className="ticket-status-box">
                    <div className="ticket-badge">
                        🎟️ 보유 이용권: <b>{ticketCount}</b>장
                    </div>
                </div>

                <div className="wheel-outer">
                    <div className="wheel-indicator">▼</div>
                    <div 
                        className="wheel-main"
                        style={{ 
                            transform: `rotate(${rotation}deg)`,
                            transition: isSpinning ? 'transform 4s cubic-bezier(0.15, 0, 0, 1)' : 'none'
                        }}
                    >
                        {ROULETTE_ITEMS.map((item, index) => (
                            <div 
                                key={index} 
                                className="wheel-sec" 
                                style={{ 
                                    transform: `rotate(${index * 60}deg)`,
                                    backgroundColor: item.color
                                }}
                            >
                                <div className="sec-content">
                                    <span className="sec-icon">{item.icon}</span>
                                    <span className="sec-text">{item.name}</span>
                                </div>
                            </div>
                        ))}
                    </div>
                    <div className="wheel-center-pin">GO</div>
                </div>

                <div className="spin-action-area">
                    <button 
                        className={`btn-spin-glass ${ticketCount === 0 ? 'no-ticket' : ''}`}
                        onClick={handleSpin}
                        disabled={isSpinning || ticketCount === 0}
                    >
                        {isSpinning ? "행운을 비는 중..." : ticketCount > 0 ? "지금 돌리기" : "이용권 부족"}
                    </button>
                    
                    {ticketCount === 0 && !isSpinning && (
                        <div className="shop-link-hint" onClick={() => setTab('store')}>
                            🍿 상점에서 룰렛 이용권 구매하기 ➔
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}   