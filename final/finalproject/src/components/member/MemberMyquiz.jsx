import { useAtom } from "jotai";
import { loginIdState, loginNicknameState } from "../../utils/jotai";
import { useCallback, useEffect, useMemo, useState } from "react";
import axios from "axios";
import { Link } from "react-router-dom";
import { FaChartBar } from "react-icons/fa";
import "./Pagenation.css"

export default function MemberMypage(){
    const [loginId, setLoginId] = useAtom(loginIdState);
    const [loginNickname, setLoginNickname] = useAtom(loginNicknameState);
    
    //state
    const [answerQuizList, setAnswerQuizList] = useState([]);
    const [answerQuizRate, setAnswerQuizRate] = useState([]);
    const [addQuizList, setAddQuizList] = useState([]);
    
    const [answerPage, setAnswerPage] = useState(1);
    const [answerTotalPage, setAnswerTotalPage] = useState(1);
    const [addPage, setAddPage] = useState(1);
    const [addPageData, setAddPageData] = useState({
        page : 1,size : 10,  totalCount : 0, totalPage : 0, blockStart : 1, blockFinish : 1
    });

    //callback 
    const loadData = useCallback(async()=>{
        const answerList = await axios.get(`/member/myanswerquiz/${loginId}`);
        setAnswerQuizList(answerList.data);
        const addList = await axios.get(`/member/myaddquiz/${loginId}/${addPage}`);
        setAddQuizList(addList.data.list);
        setAddPageData(addList.data.pageVO);
        const rateList = await axios.get(`/member/myanswerRate/${loginId}`);
        setAnswerQuizRate(rateList.data);
    },[loginId, addPage]);

    // 페이지네이션 - 이전 버튼
    const movePrevBlock = useCallback(()=>{
        const prevPage = addPageData.blockStart - 1;
        setAddPage(prevPage < 1 ? 1 : prevPage);
        }
    )
    // 페이지네이션 - 다음 버튼
    const moveNextBlock = useCallback(()=>{
        const nextPage = addPageData.blockFinish + 1;
        setAddPage(
            nextPage > addPageData.totalPage ? addPageData.totalPage : nextPage
        );
        }
    )
    // 페이지네이션 - 페이지 계산
    const pageNumbers=useMemo(()=>{
        if( !addPageData.totalPage) return [];
        return Array.from(
            { length: addPageData.blockFinish - addPageData.blockStart + 1 },
            (_, i) => addPageData.blockStart + i
        );
    }, [addPageData.blockFinish, addPageData.blockStart, addPageData.blockTotalPage]);


   
    useEffect(()=>{
        loadData();
    },[loadData]);

    
    return(<>

        <h1 className="text-center mt-4"> {loginNickname}님의 퀴즈</h1>
        
        {/* 나의 퀴즈 기록 통계 */}
        <div className="card border-0 shadow-sm quiz-dark-card">
            <div className="card-header fw-bold border-0 stats-header-dark text-center p-3 fs-5">
                <FaChartBar className="me-2" />
                나의 퀴즈 기록
            </div>
            <div className="card-body">
                <div className="row text-center text-light">
                    <div className="col-5">
                        <span className="fs-5">콘텐츠</span>
                    </div>
                    <div className="col-2">
                        <span className="fs-5">정답</span>
                    </div>
                    <div className="col-2">
                        <span className="fs-5">오답</span>
                    </div>
                    <div className="col-3">
                        <span className="fs-5">정답률</span>
                    </div>
                </div>
                <hr/>
                {answerQuizRate.map((answerQuizRate,index)=>(
                <div className="row text-center mt-2" key={index}>
                    <div className="col-5 text-truncate">
                        <Link className="quiz-link" to={`/contents/detail/${answerQuizRate.quizContentsId}`}>{answerQuizRate.contentsTitle}</Link>
                    </div>
                    <div className="col-2">
                        {answerQuizRate.correctCount}
                    </div>
                    <div className="col-2">
                        {answerQuizRate.wrongCount}
                    </div>
                    <div className="col-3 p-0 fs-bold rate-bar">
                        <div className="rate-fill fs-6 text-dark" style={{ width: `${answerQuizRate.correctRate * 100}%` }}>
                        </div>
                        <span className="rate-text">
                            {(answerQuizRate.correctRate * 100).toFixed(2)}%
                        </span>
                    </div>
                </div>
                ))}
            </div>
        </div>


        <div className="mt-4 card quiz-dark-card text-center">

            <div className="card-header fw-bold border-0 stats-header-dark p-3 fs-5">
                내가 푼 퀴즈
            </div>
            <div className="table-responsive">
            <table className="table">
                <thead >
                    <tr className="text-truncate">
                        <th  className="quiz-table-thead">콘텐츠</th>
                        <th  className="quiz-table-thead">문제</th>
                        <th  className="quiz-table-thead quiz-table-thead-ex">정답여부</th>
                        <th  className="quiz-table-thead quiz-table-thead-ex">정답률</th>
                    </tr>
                </thead>
                <tbody >
                    {answerQuizList.map((answerQuiz)=>(
                        <tr key={answerQuiz.quizLogQuizId}>
                            <td className="quiz-normal text-truncate">
                                <Link className="quiz-link" to={`/contents/detail/${answerQuiz.quizContentsId}`}>{answerQuiz.contentsTitle}</Link>
                            </td>
                            <td className="text-truncate quiz-question">
                                <Link className="quiz-link text-white" to={`/member/mypage/quiz/detail/${answerQuiz.quizLogQuizId}`}>{answerQuiz.quizQuestion}</Link>
                            </td>
                            {answerQuiz.quizLogIsCorrect==="Y" ? (
                                <td className="quiz-option quiz-correct">O</td>
                            ) : (
                                <td className="quiz-option quiz-wrong">X</td>
                            )}
                            <td className="rate-bar ">
                                <div className="rate-fill fs-6d-flex text-nowrap" style={{ width: `${answerQuiz.correctRate * 100}%` }}>{(answerQuiz.correctRate * 100).toFixed(2)}%</div>
                                <span className="rate-text"></span>
                            </td>
                        </tr>
                    ))}
                    </tbody>
            </table>
            </div>

    </div>

        <div className="mt-4 card quiz-dark-card text-center">
            <div className="card-header fw-bold border-0 p-3 fs-5">
                내가 등록한 퀴즈
            </div>
             {/* 페이지네이션 */}
            <div className ="row mt-1">
                <div className="col-6 offset-3">
                     <nav aria-label="Page navigation">
                        <ul className="pagination">
                            {/* 이전 버튼 */}
                            <li className="page-item">
                                <button className="page-link" disabled={addPageData.blockStart === 1}
                                        onClick={movePrevBlock}>◀</button>
                            </li>
                            {/* 페이지 번호 */}
                                    {pageNumbers.map(pageNum=>(
                                    <li key={pageNum} className={`page-item ${addPage === pageNum ? "active" : ""}`}>
                                        <button className="page-link" onClick={() => setAddPage(pageNum)}>
                                            {pageNum}
                                        </button>
                                    </li>
                                    ))}
                            {/* 다음 버튼 */}
                            <li className="page-item">
                                <button className="page-link" disabled={addPageData.blockFinish >= addPageData.totalPage}
                                        onClick={moveNextBlock}>▶</button>
                            </li>
                        </ul>
                    </nav>
                </div>
            </div>
            <div className="table-responsive">
                <table className="table">
                    <thead>
                        <tr className="text-truncate quiz-table-thead">
                            <th className="quiz-table-thead">문제</th>
                            <th className="quiz-table-thead">풀이횟수</th>
                            <th className="quiz-table-thead quiz-table-thead-ex">보기</th>
                            <th className="quiz-table-thead quiz-table-thead-ex">정답률</th>
                        </tr>
                    </thead>
                    <tbody >
                        {addQuizList.map((addQuiz)=>(
                            <tr key={addQuiz.quizId}>
                                <td className="text-truncate quiz-question">
                                   <Link className="quiz-link fs-5" to={`/contents/detail/${addQuiz.quizContentsId}`}> [ {addQuiz.contentsTitle} ]</Link> 
                                    <br/>
                                    <Link className="quiz-link fs-6 text-white" to={`/member/mypage/quiz/detail/${addQuiz.quizId}`}> {addQuiz.quizQuestion}</Link> 
                                </td>
                                <td className="quiz-normal">{addQuiz.quizSolveCount}</td>
                                <td className={`text-truncate ${addQuiz.quizAnswer==="1" ? "quiz-answer" : "quiz-option"}`}>{addQuiz.quizQuestionOption1}</td>
                                <td className={`text-truncate ${addQuiz.quizAnswer==="2" ? "quiz-answer" : "quiz-option"}`}>{addQuiz.quizQuestionOption2}</td>
                                    {addQuiz.quizQuestionType === "MULTI" && (
                                            <>
                                                <td className={`text-truncate ${addQuiz.quizAnswer==="3" ? "quiz-answer" : "quiz-option"}`}>{addQuiz.quizQuestionOption3}</td>
                                                <td className={`text-truncate ${addQuiz.quizAnswer==="4" ? "quiz-answer" : "quiz-option"}`}>{addQuiz.quizQuestionOption4}</td>
                                            </>
                                        )}
                                <td className="quiz-normal">{(addQuiz.correctRate * 100).toFixed(2)}%</td>
                            </tr>
                    ))}
                    </tbody>
            </table>
            </div>

        </div>

</>)
}