
칼럼 :: boardWriter
키워드 :: loginId


import { useNavigate } from "react-router-dom";
import "./Member.css";
import { useCallback, useEffect, useState } from "react";
import Pagination from "../Pagination";
import axios from "axios";



export default function MemberMyBoard(){
        const navigate = useNavigate();
    
        //state
        const [boardList, setBoardList] = useState([]);
        const [titles, setTitles] = useState({});
        const [page, setPage] = useState(1);
        const [pageData, setPageData] = useState({
            page: 1, size: 10, totalCount: 0, totalPage: 0, blockStart: 1, blockFinish: 1
        });

    //effect
    useEffect(() => {
        loadBoard();
    }, [page]);

    useEffect(() => {
        if (boardList.length > 0) {
            loadAllTitles();
        }
    }, [boardList]);

    const formatWtime = (dateString) => {
        const date = new Date(dateString);
        const mm = String(date.getMonth() + 1).padStart(2, "0");
        const dd = String(date.getDate()).padStart(2, "0");
        return `${mm}/${dd}`
    };

    const loadBoard = useCallback(async () => {
        const { data } = await axios.get(`/board/page/${page}`);
        console.log(data);
        const formattedData = data.list.map(board => ({
            ...board,
            boardWtime: formatWtime(board.boardWtime)
        }));
        setBoardList(formattedData);
        setPageData(data.pageVO);
    }, [page]);


    //render
    return(<>
    <div className="container mt-5">
    {/* 게시글 목록 */}
        <div className="shadow-sm border-0 rounded-4 overflow-hidden mt-4">
            <div className="table-responsive">
                <table className="table table-dark table-hover text-center align-middle mb-0 text-white text-nowrap" style={{ borderColor: "#495057" }}>
                    <thead className="text-white">
                        <tr>
                            <th className="py-3" style={{ width: "15%" }}>컨텐츠</th>
                            <th className="py-3 text-start ps-4" style={{ width: "50%" }}>제목</th>
                            <th className="py-3">조회수</th>
                            <th className="py-3" style={{ width: "15%" }}>작성자</th>
                            <th className="py-3" style={{ width: "15%" }}>날짜</th>
                        </tr>
                    </thead>
                    <tbody>
                        {boardList.map((board) => (
                            <tr
                                key={board.boardNo}
                                onClick={() => navigate(`/board/${board.boardNo}`)}
                                style={{ cursor: "pointer", transition: "all 0.2s" }}
                                className="board-row"
                            >
                                <td className="py-3 text-secondary">
                                    {board.boardContentsId ? (
                                        <span className="badge bg-secondary bg-opacity-25 text-light fw-normal border border-secondary border-opacity-25">
                                            {titles[board.boardContentsId] || "Loading..."}
                                        </span>
                                    ) : (
                                        <span className="text-muted">-</span>
                                    )}
                                </td>
                                <td className="py-3 text-start ps-4 fw-medium">
                                    {board.boardTitle}
                                    {/* 댓글 수 뱃지  */}
                                    {board.boardReplyCount > 0 && (
                                        <span className="ms-2 text-primary small fw-bold">
                                            [{board.boardReplyCount}]
                                        </span>
                                    )}
                                    {/* 공지사항 뱃지 */}
                                    {board.boardNotice === 'Y' && (
                                        <span className="ms-2 badge bg-danger">공지</span>
                                    )}
                                </td>
                                <td className="py-3 text-light opacity-75">{board.boardViewCount}</td>
                                <td className="py-3 text-light opacity-75">{board.boardWriter}</td>
                                <td className="py-3 text-light opacity-75">{board.boardWtime}</td>
                            </tr>
                        ))}
                        {boardList.length === 0 && (
                            <tr>
                                <td colSpan="4" className="py-5 text-muted">게시글이 없습니다.</td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>
        </div>

        {/* 페이지네이션 */}
        <div className="row mt-5">
            <div className="col d-flex justify-content-center">
                <Pagination
                    page={page}
                    totalPage={pageData.totalPage}
                    blockStart={pageData.blockStart}
                    blockFinish={pageData.blockFinish}
                    onPageChange={setPage}
                />
            </div>
        </div>
    </div>
    
    
    </>)
}