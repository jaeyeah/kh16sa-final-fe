import { useAtom } from "jotai";
import { loginIdState, loginNicknameState } from "../../utils/jotai";
import { useCallback, useEffect, useState } from "react";
import axios from "axios";
import { Link } from "react-router-dom";
import { FaChartBar } from "react-icons/fa";

export default function MemberMypage(){
    const [loginId, setLoginId] = useAtom(loginIdState);
    const [loginNickname, setLoginNickname] = useAtom(loginNicknameState);
    
    //state
    const [answerQuizList, setAnswerQuizList] = useState([]);
    const [answerQuizRate, setAnswerQuizRate] = useState([]);
    const [addQuizList, setAddQuizList] = useState([]);
    

    //callback 
    const loadData = useCallback(async()=>{
        const answerList = await axios.get(`/member/myanswerquiz/${loginId}`);
        setAnswerQuizList(answerList.data);
        const addList = await axios.get(`/member/myaddquiz/${loginId}`);
        setAddQuizList(addList.data);
        const rateList = await axios.get(`/member/myanswerRate/${loginId}`);
        setAnswerQuizRate(rateList.data);
    },[loginId]);

   
    useEffect(()=>{
        loadData();
    },[loadData]);

    
    return(<>
    <h1 className="text-center"> {loginNickname}님의 퀴즈</h1>
        
        {/* 나의 퀴즈 기록 통계 */}
        <div className="card border-0 shadow-sm quiz-dark-card">
            <div className="card-header fw-bold border-0 pt-3 stats-header-dark text-center">
                <FaChartBar className="me-2" />
                나의 퀴즈 기록
            </div>
            <div className="card-body">
                <div className="row text-center text-light">
                    <div className="col-5">
                        <h5>콘텐츠</h5>
                    </div>
                    <div className="col-2 ">
                        <h5>정답</h5>
                    </div>
                    <div className="col-2">
                        <h5>오답</h5>
                    </div>
                    <div className="col-3">
                        <h5 >정답률</h5>
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
                        <div className="col-3 fs-bold">
                            {answerQuizRate.correctRate*100} % 
                    </div>
                </div>
                ))}
            </div>
        </div>


        <div className="mt-4 card quiz-dark-card text-center">

            <div className="card-header fw-bold border-0 pt-3 stats-header-dark">
                내가 푼 퀴즈
            </div>
            <div className="table-responsive">
            <table className="table">
                <thead >
                    <tr className="text-truncate">
                        <th  className="quiz-table-thead">콘텐츠</th>
                        <th  className="quiz-table-thead">문제</th>
                        <th  className="quiz-table-thead quiz-table-thead-ex" >정답여부</th>
                        <th  className="quiz-table-thead">정답률</th>
                    </tr>
                </thead>
                <tbody >
                    {answerQuizList.map((answerQuiz)=>(
                        <tr key={answerQuiz.quizLogQuizId}>
                            <td className="quiz-normal text-truncate">
                                <Link className="quiz-link" to={`/contents/detail/${answerQuiz.quizContentsId}`}>{answerQuiz.contentsTitle}</Link>
                            </td>
                            <td className="text-truncate quiz-question">{answerQuiz.quizQuestion}</td>

                                {answerQuiz.quizLogIsCorrect==="Y" ? (
                                    <td className="quiz-option quiz-correct">O</td>
                                ) : (
                                    <td className="quiz-option quiz-wrong">X</td>
                                )}

                            <td className="quiz-normal"></td>
                        </tr>
                    ))}
                    </tbody>
            </table>
            </div>

    </div>

        <div className="mt-4 card quiz-dark-card text-center">
            <div className="card-header fw-bold border-0 pt-3 stats-header-dark">
                내가 등록한 퀴즈
            </div>
            <div className="table-responsive">
                <table className="table table-hover table-striped">
                    <thead>
                        <tr className="text-truncate quiz-table-thead">
                            <th className="quiz-table-thead">문제</th>
                            <th className="quiz-table-thead">풀이횟수</th>
                            <th className="quiz-table-thead quiz-table-thead-ex">보기</th>
                            <th className="quiz-table-thead">정답률</th>
                        </tr>
                    </thead>
                    <tbody >
                        {addQuizList.map((addQuiz)=>(
                            <tr key={addQuiz.quizId}>
                                <td className="text-truncate quiz-question">
                                   <Link className="quiz-link fs-4" to={`/contents/detail/${addQuiz.quizContentsId}`}> [ {addQuiz.contentsTitle} ]</Link> 
                                    <br/>
                                    {addQuiz.quizQuestion}
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
                                <td className="quiz-normal">{addQuiz.correctRate * 100}%</td>
                            </tr>
                    ))}
                    </tbody>
            </table>
            </div>
        </div>

</>)
}