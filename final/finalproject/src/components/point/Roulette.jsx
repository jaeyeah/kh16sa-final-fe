import React, { useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import { toast } from 'react-toastify';
import { useAtomValue } from "jotai";
import { loginIdState } from "../../utils/jotai";
import './Roulette.css'; 

export default function Roulette({ refreshPoint }) {
    const loginId = useAtomValue(loginIdState);
    const [isSpinning, setIsSpinning] = useState(false);
    const [rotation, setRotation] = useState(0);
    
    // 이용권 개수 관리
    const [ticketCount, setTicketCount] = useState(0);

    // ★ [중요] 백엔드/DB와 동일하게 이름 맞춤
    const TICKET_ITEM_TYPE = "RANDOM_ROULETTE"; 

    // 룰렛 아이템 (백엔드 로직과 순서가 같아야 함)
    // 0:1000P, 1:꽝, 2:500P, 3:RETRY, 4:2000P, 5:꽝
    const items = [
        { name: "1000 P", value: 1000 },
        { name: "꽝 😭", value: 0 },
        { name: "500 P", value: 500 },
        { name: "한번 더!", value: "RETRY" },
        { name: "2000 P", value: 2000 },
        { name: "꽝 😭", value: 0 },
    ];

    // 1. 내 인벤토리에서 이용권 개수 조회
    const loadTicketCount = useCallback(async () => {
        if (!loginId) return;
        try {
            const resp = await axios.get("/point/main/store/inventory/my");
            
            // "RANDOM_ROULETTE" 타입인 아이템만 필터링
            // DTO 필드명이 pointItemType인지 확인 필요 (여기선 pointItemType으로 가정)
            const tickets = resp.data.filter(item => item.pointItemType === TICKET_ITEM_TYPE);
            
            setTicketCount(tickets.length);
        } catch (e) { console.error(e); }
    }, [loginId, TICKET_ITEM_TYPE]);

    useEffect(() => {
        loadTicketCount();
    }, [loadTicketCount]);

    // 2. 룰렛 돌리기
    const handleSpin = async () => {
        if (isSpinning) return;

        if (ticketCount <= 0) {
            toast.warning("🎟️ 룰렛 이용권이 부족합니다! 스토어에서 구매해주세요.");
            return;
        }
        
        if (!window.confirm(`이용권 1장을 사용하여 돌리시겠습니까? (남은 수량: ${ticketCount}장)`)) return;

        setIsSpinning(true);

        try {
            // ★ [핵심 수정] 일반 사용(/inventory/use)이 아니라 룰렛 전용(/roulette) 호출
            // 서버가 티켓 차감 + 랜덤 결과 계산 + 포인트 지급을 모두 처리하고 "결과 인덱스"를 줍니다.
            const resp = await axios.post("/point/main/store/roulette");
            
            const resultIndex = resp.data; // 서버가 정해준 당첨 번호 (0~5)
            
            // --- 애니메이션 시작 ---
            const segmentAngle = 360 / 6; 
            const randomSpins = 360 * 5; // 최소 5바퀴 회전
            const targetRotation = randomSpins + (360 - (resultIndex * segmentAngle));

            setRotation(targetRotation);

            // 3. 결과 보여주기 (4초 후)
            setTimeout(async () => {
                const item = items[resultIndex];
                
                if (item.value === 0) {
                    toast.error("아쉽게도 꽝입니다... 😭");
                } else if (item.value === "RETRY") {
                    toast.info("한번 더 기회! (티켓이 차감되지 않았습니다)");
                } else {
                    toast.success(`축하합니다! ${item.name} 당첨! 🎉`);
                }
                
                setIsSpinning(false);
                loadTicketCount(); // 갱신
                if (refreshPoint) refreshPoint(); // 상단 포인트 갱신
            }, 4000);

        } catch (e) {
            console.error(e);
            // 서버 에러 메시지 표시
            const msg = e.response?.data?.message || "룰렛 실행 중 오류가 발생했습니다.";
            toast.error(msg);
            setIsSpinning(false);
        }
    };

    return (
        <div className="roulette-container">
            <h2 className="mb-2" style={{color:'#f1c40f', textShadow:'2px 2px 0 #000'}}>🎰 행운의 룰렛</h2>
            
            <div className="mb-4">
                <span className="badge bg-dark border border-warning text-warning fs-6 px-3 py-2">
                    🎟️ 보유 이용권: {ticketCount}장
                </span>
            </div>

            <div className="wheel-wrapper">
                <div className="wheel-marker"></div>
                <div 
                    className="wheel-board"
                    style={{ 
                        transform: `rotate(${rotation}deg)`,
                        transition: isSpinning ? 'transform 4s cubic-bezier(0.1, 0.7, 0.1, 1)' : 'none'
                    }}
                >
                    {items.map((item, index) => (
                        <div key={index} className={`wheel-label label-${index}`}>
                            <span className="label-text">{item.name}</span>
                        </div>
                    ))}
                </div>
                <div className="wheel-center-cap">★</div>
            </div>

            <button 
                className={`btn-spin ${ticketCount === 0 ? 'disabled' : ''}`}
                onClick={handleSpin}
                disabled={isSpinning || ticketCount === 0}
            >
                {isSpinning ? "..." : ticketCount > 0 ? "SPIN!" : "티켓 필요"}
            </button>
            
            {ticketCount === 0 && (
                <p className="text-secondary mt-2 small">스토어에서 이용권을 구매하세요!</p>
            )}
        </div>
    );
}