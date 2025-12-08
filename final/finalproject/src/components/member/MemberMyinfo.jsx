import { useAtom } from "jotai"
import { loginIdState, loginLevelState } from "../../utils/jotai"
import { useEffect, useState } from "react";
import axios from "axios";
import "./MemberMypage.css";
import { Link, useParams } from "react-router-dom";



export default function MemberMyinfo(){
    const {loginId} = useParams();
    const [memberData, setMemberData] = useState({});
    //effect
    useEffect(()=>{
        if(loginId === null) return;
        axios.get(`/member/mypage/${loginId}`)
        .then(response=>{
            setMemberData(response.data);
        })
    },[]);
    return(<>
        <h1 className="text-center"> {loginId}님의 정보</h1>

        <div className="mypage-table-wrapper">
        <table className="table table-hover mypage-table">
            <tbody>
                <tr>
                    <td>아이디</td>
                    <td>{memberData.memberId}</td>
                </tr>
                <tr>
                    <td>닉네임</td>
                    <td>{memberData.memberNickname}</td>
                </tr>
                 <tr>
                    <td>등급</td>
                    <td>{memberData.memberLevel}</td>
                </tr>
                <tr>
                    <td>생년월일</td>
                    <td>{memberData.memberBirth}</td>
                </tr>
                <tr>
                    <td>전화번호</td>
                    <td>{memberData.memberContact}</td>
                </tr>
                                <tr>
                    <td>이메일</td>
                    <td>{memberData.memberEmail}</td>
                </tr>
                <tr>
                    <td>포인트</td>
                    <td>{memberData.memberPoint}</td>
                </tr>
            </tbody>
        </table>
        <div className="row mt-2">
            <div className="col">
                    <Link to={`/member/edit/${loginId}`} className="btn btn-secondary me-2">기본정보 수정</Link>
                    <Link to={`/member/password/${loginId}`} className="btn btn-secondary me-2">비밀번호 변경</Link>
                    <Link to="#" className="btn btn-danger">탈퇴</Link>
            </div>
        </div>
        </div>

    </>)
}