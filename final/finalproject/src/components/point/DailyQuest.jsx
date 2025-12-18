import React, { useEffect, useState, useCallback } from 'react';
import { toast } from "react-toastify";
import axios from "axios";
import { useAtomValue } from "jotai";
import { loginIdState } from "../../utils/jotai";

// props로 setTab 외에 포인트 갱신 함수(예: refreshPoint)가 있다면 받아오세요
export default function DailyQuest({ setTab, refreshPoint }) {
    const loginId = useAtomValue(loginIdState);
    const [quests, setQuests] = useState([]);
    const [timeLeft, setTimeLeft] = useState("");

    // 1. 자정까지 남은 시간 계산 함수
    const calculateTimeLeft = useCallback(() => {
        const now = new Date();
        const midnight = new Date();
        midnight.setHours(24, 0, 0, 0); 
        const diff = midnight - now;

        const hours = Math.floor((diff / (1000 * 60 * 60)) % 24);
        const minutes = Math.floor((diff / 1000 / 60) % 60);
        const seconds = Math.floor((diff / 1000) % 60);

        return `${String(hours).padStart(2, "0")}:${String(minutes).padStart(2, "0")}:${String(seconds).padStart(2, "0")}`;
    }, []);

    // 2. 타이머 갱신
    useEffect(() => {
        setTimeLeft(calculateTimeLeft());
        const timer = setInterval(() => {
            setTimeLeft(calculateTimeLeft());
        }, 1000);
        return () => clearInterval(timer);
    }, [calculateTimeLeft]);

    // 3. 퀘스트 목록 로드
    const loadQuests = useCallback(async () => {
        if (!loginId) return;
        try {
            const resp = await axios.get("/point/quest/list");
            setQuests(resp.data);
        } catch (e) { console.error("퀘스트 로드 실패", e); }
    }, [loginId]);

    useEffect(() => { loadQuests(); }, [loadQuests]);

    // 4. 바로가기/퀴즈 클릭 처리
    const handleQuestClick = async (quest) => {
        if (quest.done) return;

        if (quest.action === "quiz") {
            try {
                const resp = await axios.get("/point/quest/quiz/random");
                const { quizQuestion, quizAnswer } = resp.data;

                const userAnswer = window.prompt(`[영화/애니 퀴즈]\n\n${quizQuestion}`);
                if (!userAnswer) return;

                const checkResp = await axios.post("/point/quest/quiz/check", { 
                    answer: userAnswer,
                    correctAnswer: quizAnswer 
                });

                if (checkResp.data === "success") {
                    toast.success("🎉 정답입니다! 퀘스트가 업데이트되었습니다.");
                    loadQuests(); 
                } else {
                    toast.error("오답입니다! 다시 시도해보세요.");
                }
            } catch (e) {
                toast.error("문제를 불러오는 데 실패했습니다.");
            }
        } 
        else if (quest.action === "roulette") {
            setTab("roulette");
            toast.info("🎰 룰렛 탭으로 이동합니다!");
        } 
        else if (quest.type === "LIKE") {
            toast.info("게시판으로 이동합니다. 좋아요를 눌러보세요!");
            window.location.href = "/board/list";
        } 
        else if (quest.type === "REVIEW") {
            toast.info("리뷰 작성을 위해 전체 리스트로 이동합니다!");
            window.location.href = "/contents/genreList/listByGenre/전체";
        }
    };

    // 5. 보상 받기 (★포인트 새로고침 로직 추가★)
    const handleClaim = async (type) => {
        try {
            const resp = await axios.post("/point/quest/claim", { type: type });
            if (resp.data.startsWith("success")) {
                const reward = resp.data.split(":")[1];
                toast.success(`보상이 지급되었습니다! +${reward}P 💰`);
                
                // [변경 포인트]
                // 1. 퀘스트 UI 갱신 (받기 버튼 -> 완료 문구로 변경)
                loadQuests(); 
                
                // 2. 헤더나 상단바의 포인트를 새로고침하기 위한 알림
                // 방법 A: 상위 컴포넌트에서 전달받은 함수 호출 (가장 추천)
                if(typeof refreshPoint === 'function') {
                    refreshPoint();
                }

                // 방법 B: 전역 커스텀 이벤트를 발생시켜 Header 등에서 듣게 함
                window.dispatchEvent(new CustomEvent("pointChanged"));
                
            } else {
                toast.warning(resp.data.split(":")[1]);
            }
        } catch (e) { toast.error("보상 수령 실패"); }
    };

    return (
        <div className="quest-card">
            <div className="d-flex justify-content-between align-items-center mb-3">
                <h5 className="fw-bold text-white mb-0">📜 일일 퀘스트</h5>
                <span className="badge bg-dark border border-secondary text-warning" style={{fontSize:'0.8rem', fontFamily:'monospace'}}>
                    ⏳ Reset {timeLeft}
                </span>
            </div>

            <div className="quest-list">
                {quests.map((q, index) => (
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