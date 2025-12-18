import React, { useEffect, useState, useCallback } from 'react';
import axios from 'axios';
import './PointRanking.css';

export default function PointRankingPage() {
    const [rankList, setRankList] = useState([]);
    const [keyword, setKeyword] = useState("");
    
    // ★ 페이지네이션 상태 추가
    const [page, setPage] = useState(1);
    const [totalPage, setTotalPage] = useState(0);

    // 데이터 로드 함수
    const loadRanking = useCallback(async () => {
        try {
            const resp = await axios.get("/point/ranking/total", {
                params: { 
                    keyword: keyword,
                    page: page,  // 현재 페이지 전송
                    size: 10     // 10개씩 보기
                }
            });
            // 서버에서 Map으로 { list, count, totalPage }를 줌
            setRankList(resp.data.list);
            setTotalPage(resp.data.totalPage);
        } catch (e) {
            console.error("랭킹 로드 실패", e);
        }
    }, [keyword, page]); // page가 바뀌면 다시 실행됨

    useEffect(() => {
        loadRanking();
    }, [loadRanking]);

    const handleSearch = () => {
        setPage(1); // 검색 시 1페이지로 초기화
        loadRanking();
    };

    const handleKeyPress = (e) => {
        if (e.key === 'Enter') handleSearch();
    };

    // 페이지 변경 함수
    const changePage = (newPage) => {
        if (newPage >= 1 && newPage <= totalPage) {
            setPage(newPage);
        }
    };

    return (
        <div className="ranking-bg-container">
            <div className="ranking-overlay">
                <div className="container py-5">
                    <h2 className="text-center fw-bold mb-4 text-glow">
                        ❄️ 무비/애니 명예의 전당 ❄️
                    </h2>

                    {/* 검색창 */}
                    <div className="search-section mb-4 text-center">
                        <div className="input-group search-box-glass d-inline-flex">
                            <input 
                                type="text" 
                                className="form-control"
                                placeholder="닉네임 검색..." 
                                value={keyword}
                                onChange={(e) => setKeyword(e.target.value)}
                                onKeyPress={handleKeyPress}
                            />
                            <button className="btn btn-snow" onClick={handleSearch}>검색</button>
                        </div>
                    </div>

                    {/* 랭킹 리스트 */}
                    <div className="ranking-glass-card mb-4">
                        <div className="ranking-header d-flex justify-content-between px-4 py-2 text-white-50 small">
                            <span>RANKING</span>
                            <span>USER</span>
                            <span>POINTS</span>
                        </div>
                        <div className="ranking-list">
                            {rankList.length > 0 ? (
                                rankList.map((user) => (
                                    <div key={user.memberId} className="rank-row d-flex align-items-center">
                                        <div className="rank-num">
                                            {user.ranking <= 3 ? (
                                                <span className={`medal medal-${user.ranking}`}></span>
                                            ) : user.ranking}
                                        </div>
                                        <div className="user-info flex-grow-1">
                                            <div className="user-nick text-white fw-bold">{user.nickname}</div>
                                            <div className="user-lvl text-info small">{user.level}</div>
                                        </div>
                                        <div className="user-pts text-warning fw-bold">
                                            {user.point.toLocaleString()} P
                                        </div>
                                    </div>
                                ))
                            ) : (
                                <div className="py-5 text-center text-white">데이터가 없어요! ⛄</div>
                            )}
                        </div>
                    </div>

                    {/* ★ 페이지네이션 UI (부트스트랩 스타일 + 커스텀) */}
                    {totalPage > 1 && (
                        <div className="d-flex justify-content-center">
                            <nav>
                                <ul className="pagination pagination-sm glass-pagination">
                                    <li className={`page-item ${page === 1 ? 'disabled' : ''}`}>
                                        <button className="page-link" onClick={() => changePage(page - 1)}>&laquo;</button>
                                    </li>
                                    
                                    {/* 페이지 번호 반복 */}
                                    {Array.from({ length: totalPage }, (_, i) => i + 1).map(p => (
                                        <li key={p} className={`page-item ${page === p ? 'active' : ''}`}>
                                            <button className="page-link" onClick={() => changePage(p)}>
                                                {p}
                                            </button>
                                        </li>
                                    ))}

                                    <li className={`page-item ${page === totalPage ? 'disabled' : ''}`}>
                                        <button className="page-link" onClick={() => changePage(page + 1)}>&raquo;</button>
                                    </li>
                                </ul>
                            </nav>
                        </div>
                    )}
                    
                </div>
            </div>
        </div>
    );
}