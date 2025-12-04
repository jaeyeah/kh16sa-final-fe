import axios  from "axios";

//axios setting
axios.defaults.baseURL = "http://localhost:8080";//앞으로 모든 통신에 이 주소를 접두사로 추가
axios.defaults.timeout = 10000;//10000ms초가 넘어가면 통신 취소(상황에 따라 조절)

//axios interceptor
// - 서버로 요청을 보낼 때 "Frontend-Url" 이름으로 현재 URL을 전송 (카카오페이 결제 등에서 사용)
axios.interceptors.request.use((config)=>{ //config는 axios 설정
    config.headers["Fronted-Url"] = window.location.href;
    return config;
});