import { useAtom } from "jotai";
import { loginIdState } from "../../utils/jotai";
import "./MemberCustom.css"; 
import { NavLink, Outlet } from "react-router-dom";

export default function MemberMypage() {
  const [loginId] = useAtom(loginIdState);

  return (
    <div className="mypage-container-wide">
      {/* 상단 탭 네비게이션: 
          NavLink는 현재 경로와 일치할 때 자동으로 'active' 클래스를 부여합니다. 
      */}
      <nav className="mypage-tabs">
        <NavLink to={`/member/mypage/myinfo/${loginId}`} className="mypage-tab">
          내 정보
        </NavLink>
        <NavLink to={`/member/mypage/myBoard/${loginId}`} className="mypage-tab">
          게시글
        </NavLink>
        <NavLink to={`/member/mypage/mycontent/${loginId}`} className="mypage-tab">
          찜목록
        </NavLink>
        <NavLink to={`/member/mypage/myfavorite/${loginId}`} className="mypage-tab">
          인생작
        </NavLink>
        <NavLink to={`/member/mypage/myquiz/${loginId}`} className="mypage-tab">
          내 퀴즈
        </NavLink>
        <NavLink to={`/member/mypage/myreview/${loginId}`} className="mypage-tab">
          내 리뷰
        </NavLink>
      </nav>

      {/* 하위 컨텐츠 영역 (MemberMyinfo 등이 렌더링됨) */}
      <main className="mypage-content-area">
        <Outlet />
      </main>
    </div>
  );
}