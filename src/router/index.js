import { createRouter, createWebHistory } from 'vue-router';
import LoginPage from '../Login.vue'; // 导入登录页组件
import DetailPage from '../Details.vue';
import axios from "axios"; // 导入下一个页面组件

// 配置路由规则
const router = createRouter({
    history: createWebHistory(import.meta.env.BASE_URL),
    routes: [
        {path:"/",name:"login",component:()=>LoginPage},
        {path:"/detail",name:"detail",component:()=>DetailPage},
    ]
})
let isloggedIn = false
router.beforeEach(async (to, from, next) => {  //路由守卫
    isloggedIn = false
    let token = localStorage.getItem('jwt')
    await axios
        .post('http://localhost:8080/api/auth/verifyToken', {token: token}, {
            headers: {
                'Content-Type': 'application/json',
            },
        })
        .then((response) => {
            if (response.data == '1' || response.data == '2') { //过期或无效
                localStorage.removeItem('jwt');
                isloggedIn = false;
            } else {
                isloggedIn = true;
            }
        })
        .catch((error) => {
            localStorage.removeItem('jwt');
            isloggedIn = false
        });
    if (to.name !== "login" && (!token || !isloggedIn)) {
        next("/"); // 返回登录页面的路由
    } else {
        next(); // 放行
    }
    isloggedIn = false;
});
export default router;
