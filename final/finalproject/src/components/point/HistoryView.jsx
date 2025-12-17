import { useEffect, useState, useCallback } from "react";
import axios from "axios";
import "./HistoryView.css"; 

export default function HistoryView() {
    const [historyList, setHistoryList] = useState([]);
    
    // 페이지네이션 상태
    const [page, setPage] = useState(1);
    const [totalPage, setTotalPage] = useState(0);
    const [totalCount, setTotalCount] = useState(0);

    // 필터 상태
    const [filterType, setFilterType] = useState("all"); 

    // 데이터 로드
    const loadHistory = useCallback(async () => {
        try {
            // 백엔드 컨트롤러 경로에 맞춰 호출 (예: /point/history?page=1&type=all)
            // 주의: 백엔드 Controller 주소가 /point/main/store 라면 경로 확인 필요
            // 만약 HistoryController가 따로 없다면 생성하거나 경로를 맞춰야 합니다.
            const resp = await axios.get(`/point/history?page=${page}&type=${filterType}`);
            const data = resp.data;
            
            setHistoryList(data.list);
            setTotalPage(data.totalPage);
            setTotalCount(data.totalCount);
        } catch (e) {
            console.error(e);
        }
    }, [page, filterType]);

    useEffect(() => {
        loadHistory();
    }, [loadHistory]);

    // 필터 변경
    const handleFilterChange = (type) => {
        setFilterType(type);
        setPage(1); 
    };

    const handlePageChange = (newPage) => {
        if (newPage >= 1 && newPage <= totalPage) {
            setPage(newPage);
        }
    };

    // [로직] 유형별 텍스트 매핑
    const getHistoryLabel = (item) => {
        // DTO에 reason이 있다면 사용, 없다면 trxType으로 추론
        if (item.pointHistoryReason) return item.pointHistoryReason;

        const type = item.pointHistoryTrxType;
        const amt = item.pointHistoryAmount;

        switch(type) {
            case "USE": return "아이템 구매/사용";
            case "GET": return amt > 0 ? "포인트 획득" : "사용";
            case "SEND": return "포인트 선물 보냄";
            case "RECEIVED": return "포인트 선물 받음";
            case "ADMIN": return "관리자 조정";
            default: return amt > 0 ? "포인트 적립" : "포인트 사용";
        }
    };

    // 날짜 포맷팅
    const formatDate = (dateString) => {
        if (!dateString) return "-";
        const d = new Date(dateString);
        return `${String(d.getMonth()+1).padStart(2,'0')}.${String(d.getDate()).padStart(2,'0')}`;
    };

    // 시간 포맷팅
    const formatTime = (dateString) => {
        if (!dateString) return "-";
        const d = new Date(dateString);
        return `${String(d.getHours()).padStart(2,'0')}:${String(d.getMinutes()).padStart(2,'0')}`;
    };

    // 페이지네이션 렌더링
    const renderPagination = () => {
        if (totalPage === 0) return null;
        const pageGroupSize = 5; 
        const currentGroup = Math.ceil(page / pageGroupSize); 
        const startPage = (currentGroup - 1) * pageGroupSize + 1;
        const endPage = Math.min(startPage + pageGroupSize - 1, totalPage);
        const pages = [];
        for (let i = startPage; i <= endPage; i++) pages.push(i);

        return (
            <div className="glass-pagination">
                <button 
                    className="glass-page-btn arrow" 
                    onClick={() => handlePageChange(startPage - 1)} 
                    disabled={startPage === 1}
                >
                    &lt;
                </button>
                {pages.map(p => (
                    <button 
                        key={p} 
                        className={`glass-page-btn ${p === page ? 'active' : ''}`} 
                        onClick={() => handlePageChange(p)}
                    >
                        {p}
                    </button>
                ))}
                <button 
                    className="glass-page-btn arrow" 
                    onClick={() => handlePageChange(endPage + 1)} 
                    disabled={endPage === totalPage}
                >
                    &gt;
                </button>
            </div>
        );
    };

    return (
        <div className="history-glass-wrapper">
            
            {/* 1. 상단 헤더 & 필터 */}
            <div className="history-header-glass">
                <div className="header-title-box">
                    <h4 className="title-glass">📜 Transaction Log</h4>
                    <span className="total-cnt-glass">Total: {totalCount} records</span>
                </div>
                
                {/* 탭 스타일 필터 */}
                <div className="glass-filter-group">
                    {[
                        { id: 'all', label: '전체' },
                        { id: 'earn', label: '획득 (+)' },
                        { id: 'use', label: '사용 (-)' },
                    ].map(btn => (
                        <button 
                            key={btn.id}
                            className={`glass-filter-btn ${filterType === btn.id ? 'active' : ''}`}
                            onClick={() => handleFilterChange(btn.id)}
                        >
                            {btn.label}
                        </button>
                    ))}
                </div>
            </div>

            {/* 2. 리스트 컨테이너 */}
            <div className="history-list-frame">
                {/* 헤더 행 */}
                <div className="list-header-row">
                    <span className="col-w-date">DATE</span>
                    <span className="col-w-type">TYPE</span>
                    <span className="col-w-desc">DESCRIPTION</span>
                    <span className="col-w-amount">AMOUNT</span>
                </div>

                {/* 데이터 행 */}
                <div className="list-body-scroll">
                    {historyList.length === 0 ? (
                        <div className="empty-history">
                            <div className="empty-icon">📁</div>
                            <span>기록이 존재하지 않습니다.</span>
                        </div>
                    ) : (
                        historyList.map((item) => {
                            const isPositive = item.pointHistoryAmount > 0;
                            const amountClass = isPositive ? "amt-plus" : "amt-minus";
                            const label = getHistoryLabel(item);

                            return (
                                // ★ 수정됨: pointHistoryNo -> pointHistoryId
                                <div className="history-row" key={item.pointHistoryId}>
                                    {/* 날짜 */}
                                    <div className="col-w-date">
                                        {/* ★ 수정됨: pointHistoryDate -> pointHistoryCreatedAt */}
                                        <div className="row-date">{formatDate(item.pointHistoryCreatedAt)}</div>
                                        <div className="row-time">{formatTime(item.pointHistoryCreatedAt)}</div>
                                    </div>

                                    {/* 타입 뱃지 */}
                                    <div className="col-w-type">
                                        <span className={`type-badge ${isPositive ? 'type-earn' : 'type-use'}`}>
                                            {item.pointHistoryTrxType || (isPositive ? 'EARN' : 'USE')}
                                        </span>
                                    </div>

                                    {/* 설명 */}
                                    <div className="col-w-desc">
                                        {label}
                                    </div>

                                    {/* 금액 */}
                                    <div className={`col-w-amount ${amountClass}`}>
                                        {isPositive ? '+' : ''}
                                        {item.pointHistoryAmount.toLocaleString()}
                                    </div>
                                </div>
                            );
                        })
                    )}
                </div>
            </div>

            {/* 3. 페이지네이션 */}
            {renderPagination()}
        </div>
    );
}