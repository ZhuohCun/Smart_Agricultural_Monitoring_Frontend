<template>
  <el-container class="main-container">
    <el-main class="main">
      <el-card class="login-card">
        <h2 class="title">梁河县曩宋乡智慧农业自动化管理系统</h2>
        <el-form :model="form" ref="formRef" label-width="55rem" class="login-form" @submit.native.prevent>
          <div class="row">
            <div style="width:4rem;">用户名</div>
            <el-input v-model="form.username" placeholder="请输入用户名"></el-input>
          </div>
          <div class="row">
            <div style="width:4rem;">密码</div>
            <el-input
                v-model="form.password"
                type="password"
                placeholder="请输入密码"
            ></el-input>
          </div>
          <div class="row">
            <el-button type="primary" @click="handleLogin">登录</el-button>
          </div>
          <div class="row">
            <div v-if="errorMessage" class="error-message">{{ errorMessage }}</div>
          </div>
          <div class="row">
            <div class="error-message">株式会社　腾梁技研</div>
          </div>
        </el-form>
      </el-card>
    </el-main>
  </el-container>
</template>

<script>
import { ref } from 'vue';
import axios from 'axios';
import { ElMessage } from 'element-plus';
export default {
  data() {
    return {
      form: {
        username: '',
        password: '',
      },
      errorMessage: '',
    };
  },
  created() {
    this.verifyToken();
  },
  methods: {
    async verifyToken() {  //已登录直接跳转详情页面
      let islogged=false;
      let token = localStorage.getItem('jwt');
      if (token) {
        await axios
            .post('http://localhost:8080/api/auth/verifyToken', {token: token}, {
              headers: {
                'Content-Type': 'application/json',
              },
            })
            .then((response) => {
              if (response.data == '0') { //过期或无效
                islogged = true;
              } else {
                islogged = false;
              }
            })
            .catch((error) => {
              islogged = false
            });
        if (islogged === true) {
          this.$router.push('/detail');
        }
      }
    },
    handleLogin() {
      this.errorMessage = '';
      axios
          .post('http://localhost:8080/api/auth/login',{
            username: this.form.username,
            password: this.form.password,
          },{
            headers: {
              'Content-Type': 'application/json',
            },
          })
          .then((response) => {
            const data = response.data;
            if (data === 'error') {
              this.errorMessage = '登录失败：用户名或密码错误';
            } else {
              if(localStorage.getItem('jwt')){
                localStorage.removeItem('jwt');
              }
              localStorage.setItem('jwt', data);
              this.$router.push('/detail');
            }
          })
          .catch((error) => {
            this.errorMessage = '请求失败，请稍后重试。';
          });
    },
  },
};
</script>

<style scoped>
html, body {
  margin: 0;
  padding: 0;
  height: 100%;
  width: 100%;
}
.main{
  top: 0;
  left: 0;
  min-width: 100%;
  min-height: 100%;
  justify-content:center;
  align-items: center;
  position: fixed;
  display: flex;
}
.main-container {
  height: 100%;
  display: flex;
  position: fixed;
  min-width: 100%;
  min-height: 100%;
  justify-content: center;
  align-items: center;
}
.login-card {
  width: 100%;
  max-width: 55rem;
  max-height: 25rem;
  padding: 1rem;
  box-shadow: 0 0.4rem 1.2rem rgba(0, 0, 0, 0.1);
  border-radius: 0.8rem;
  background-color: #fff;
}

.title {
  text-align: center;
  margin-bottom: 1.5rem;
  font-size: 1.6rem;
  color: #333;
}
.row{
  min-width:50rem;
  min-height: 2rem;
  display: flex;
  flex-direction: row;
  justify-content: center;
  align-items: center;
}

.login-form {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  min-width: 50rem;
  row-gap: 2rem;
}

el-form-item {
  min-width: 50rem;
  margin-bottom: 2.5rem;
}

el-button {
  background-color: chartreuse;
}

el-input {
  padding: 1rem;
  border-radius: 0.4rem;
  border: 1px solid #dcdfe6;
  transition: border-color 0.3s;
  min-width: 30rem;
  max-width: 30rem;
}

el-button {
  padding: 1.2rem;
  font-size: 1rem;
  border-radius: 0.4rem;
  transition: background-color 0.3s;
}

@media (max-width: 500px) {
  .login-card {
    padding: 1.5rem;
  }
  .title {
    font-size: 1.4rem;
  }
}
</style>
