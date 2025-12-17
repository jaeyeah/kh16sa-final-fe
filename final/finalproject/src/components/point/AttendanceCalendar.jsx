import React, { useState, useEffect } from "react";
import Calendar from "react-calendar";
import "react-calendar/dist/Calendar.css"; // 기본 CSS 로드
import moment from "moment";
import axios from "axios";
import { useAtomValue } from "jotai";
import { loginIdState } from "../../utils/jotai";
import { toast } from "react-toastify";
// CSS 파일 임포트가 필요하다면 여기에 추가 (예: import "./PointMain.css";)

// 요일 표시 에러 방지용 배열 (일, 월, 화...)
const weekDays = ["일", "월", "화", "수", "목", "금", "토"];

export default function AttendanceCalendar({ refreshTrigger }) {
    const loginId = useAtomValue(loginIdState);
    const [markDates, setMarkDates] = useState([]); // 출석한 날짜 목록

    // 1. 서버에서 출석 날짜 목록 가져오기
    useEffect(() => {
        if (!loginId) return;
        
        axios.get("/point/main/attendance/calendar")
            .then(resp => {
                setMarkDates(resp.data || []);
            })
            .catch(err => {
                console.error("달력 로드 실패:", err);
                toast.error("출석부 정보를 불러오지 못했습니다. 😥");
            });
            
    }, [loginId, refreshTrigger]); 

    // 2. 날짜 칸에 도장 찍기
    function tileContent({ date, view }) {
        if (view === "month") {
            const dateStr = moment(date).format("YYYY-MM-DD");
            
            if (markDates.includes(dateStr)) {
                return (
                    <div className="small-stamp">
                        참잘<br/>했어요
                    </div>
                );
            }
        }
        return null;
    }

    return (
        // [수정] bg-white 제거 -> CSS(.attendance-calendar-wrapper)가 다크 배경을 담당함
        <div className="attendance-calendar-wrapper">
            <h5 className="fw-bold mb-4 text-white">
                📅 <span className="text-primary">나의 출석부</span> 
                <span className="text-secondary ms-2" style={{fontSize: '0.9rem'}}>(매일 도장을 모아보세요!)</span>
            </h5>
            
            <Calendar
                className="custom-calendar"
                locale="ko-KR"
                calendarType="gregory"
                
                // 요일 이름 커스텀
                formatShortWeekday={(locale, date) => weekDays[date.getDay()]}
                
                // 날짜 숫자 포맷 (1일 -> 1)
                formatDay={(locale, date) => moment(date).format("D")}
                
                // 도장 렌더링
                tileContent={tileContent}
                
                // 상단 네비게이션 버튼 (<<, >>) 숨기기
                next2Label={null} 
                prev2Label={null}
                
                minDetail="year"
            />
        </div>
    );
}