import React, { useEffect, useState, useCallback } from 'react';
import { toast } from "react-toastify";
import axios from "axios";
import { useAtomValue } from "jotai";
import { loginIdState } from "../../utils/jotai";

export default function DailyQuest({ setTab }) {
    const loginId = useAtomValue(loginIdState);
    const [quests, setQuests] = useState([]);

    // 1. 퀘스트 목록 불러오기
    const loadQuests = useCallback(async () => {
        if (!loginId) return;
        try {
            const resp = await axios.get("/point/quest/list");
            setQuests(resp.data);
        } catch (e) {
            console.error("퀘스트 로드 실패", e);
        }
    }, [loginId]);

    // 초기 로드
    useEffect(() => { loadQuests(); }, [loadQuests]);

    // 2. 퀘스트 클릭 핸들러 (이동, 퀴즈 등)
    const handleQuestClick = async (quest) => {
        if (quest.done) return;

        if (quest.action === "roulette") {
            setTab("roulette");
            toast.info("🎰 룰렛 탭으로 이동합니다!");
        } 
        else if (quest.action === "quiz") {
            const answer = window.prompt("Q. 'I am your father' 명대사가 나오는 영화는?");
            if (answer && (answer.toLowerCase().includes("스타워즈") || answer.toLowerCase().includes("star wars"))) {
                toast.success("정답입니다! 진행도가 올라갑니다.");
                
                // ★ 서버에 진행도 업데이트 요청 (QUIZ 타입)
                await axios.post("/point/quest/progress", { type: "QUIZ" });
                loadQuests(); // 목록 갱신
            } else {
                toast.error("땡! 다시 시도해보세요. (힌트: 스OO즈)");
            }
        } 
        else {
            toast.info(`'${quest.title}' 페이지로 이동합니다. (구현 예정)`);
            // 여기에 리뷰 페이지 이동 로직 추가 등
        }
    };

    // 3. 보상 받기 핸들러
    const handleClaim = async (type) => {
        try {
            const resp = await axios.post("/point/quest/claim", { type: type });
            
            if (resp.data.startsWith("success")) {
                const reward = resp.data.split(":")[1];
                toast.success(`보상이 지급되었습니다! +${reward}P 💰`);
                loadQuests(); // 목록 갱신 (버튼 상태 변경됨)
                
                // ★ 중요: 상단 포인트 바 갱신을 위해 부모에게 알리거나, 
                // atom을 쓴다면 포인트 갱신 로직 필요 (여기선 생략)
            } else {
                toast.warning(resp.data.split(":")[1]);
            }
        } catch (e) {
            toast.error("보상 수령 실패");
        }
    };

    return (
        <div className="quest-card">
            <div className="d-flex justify-content-between align-items-center mb-3">
                <h5 className="fw-bold text-white mb-0">📜 일일 퀘스트</h5>
                <span className="badge bg-dark border border-secondary" style={{fontSize:'0.75rem'}}>Reset 00:00</span>
            </div>

            <div className="quest-list">
                {quests.map((q, index) => (
                    // 키값으로 type 사용 추천
                    <div key={q.type || index} className={`quest-item ${q.done ? 'done-bg' : ''}`}>
                        <div className="d-flex align-items-center">
                            <div className="quest-icon-box me-3">{q.icon}</div>
                            <div className="flex-grow-1">
                                <div className="d-flex justify-content-between align-items-center mb-1">
                                    <span className={`quest-title ${q.done ? 'text-decoration-line-through text-muted' : ''}`}>{q.title}</span>
                                    <span className="quest-reward text-warning fw-bold small">+{q.reward} P</span>
                                </div>
                                <div className="d-flex justify-content-between align-items-end">
                                    <small className="text-secondary me-2" style={{fontSize:'0.8rem'}}>{q.desc}</small>
                                    
                                    {/* 버튼 상태 처리 로직 */}
                                    {q.claimed ? (
                                        <span className="text-muted small">완료</span>
                                    ) : q.done ? (
                                        <button className="btn btn-xs btn-primary py-0 px-2 fw-bold" style={{fontSize:'0.75rem'}} onClick={() => handleClaim(q.type)}>받기</button>
                                    ) : (
                                        <span className="text-neon-mint small fw-bold">{q.current} / {q.target}</span>
                                    )}
                                </div>
                                <div className="progress mt-2" style={{height: '4px', backgroundColor: '#333'}}>
                                    <div className="progress-bar" style={{width: `${Math.min((q.current / q.target) * 100, 100)}%`, backgroundColor: q.done ? '#00d2d3' : '#e50914'}}></div>
                                </div>
                            </div>
                            {!q.done && (
                                <button className="btn btn-link text-secondary p-0 ms-2" onClick={() => handleQuestClick(q)} title="바로가기">🚀</button>
                            )}
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}