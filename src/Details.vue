<template>
  <el-container class="container">
    <toppart>
      <h3>梁河县曩宋乡智慧农业大屏实时监控系统</h3>
      <h4>{{ this.current }}</h4>
    </toppart>
    <bodypart>
      <el-aside class="aside">
        <el-card class="card">
          <h3>智慧田地土质实时监测</h3>
          <div class="ghcontent">
            <div class="ghitem">
              <div class="upper"><el-component>智慧田地编号</el-component></div>
              <div class="lower"><el-component>{{this.ghname}}</el-component></div>
            </div>
            <div class="ghitem">
              <div class="upper"><el-component>占地面积</el-component></div>
              <div class="lower"><el-component>{{this.gharea}}亩</el-component></div>
            </div>
            <div class="ghitem" v-for="(item, index) in this.soilsensors">
              <div class="upper"><el-component>{{item.name}}</el-component></div>
              <div class="lowersa"><el-component>{{item.value}}{{item.unit}}</el-component><div class="condition" v-bind:style="item.color"><el-component>{{item.ccondition}}</el-component></div></div>
            </div>
          </div>
        </el-card>
        <el-card class="card">
          <h3>智慧田地环境实时监测</h3>
          <div class="encontent">
            <div class="enitem" v-for="(item, index) in this.ensensors">
              <div class="left">
                {{item.name}}
              </div>
              <div class="progress">
                <el-progress v-bind:percentage="item.percent*100" :width="100" type="circle" v-bind:color="item.color" :show-text="false"></el-progress>
              </div>
              <div class="right">
                {{item.value}}{{item.unit}}
              </div>
            </div>
          </div>
        </el-card>
      </el-aside>
      <el-main class="video">
        <el-card class="video-card">
          <h3>实时视频监控</h3>
          <div id="ezuikit-player" class="video-frame"></div>
          <div class="last">
            <el-button class="shot-button" type="primary" id="shot" @mouseover="handleShotover" @mouseleave="handleShotleave">拍照</el-button>
          </div>
        </el-card>
      </el-main>
    </bodypart>
  </el-container>
  <el-footer class="batchinfo">
      <h3>批次信息</h3>
      <el-table :data="this.batchTableData">
        <el-table-column
            prop="id"
            label="#"
            width="40">
        </el-table-column>
        <el-table-column
            prop="batch"
            label="批次"
            width="60">
        </el-table-column>
        <el-table-column
            prop="store"
            label="所属门店"
            width="90">
        </el-table-column>
        <el-table-column
            prop="name"
            label="产品名称"
            width="80">
        </el-table-column>
        <el-table-column
            prop="planttime"
            label="种植时间"
            width="100">
        </el-table-column>
        <el-table-column
            prop="pickuptime"
            label="采摘时间"
            width="100">
        </el-table-column>
        <el-table-column
            prop="antipestrate"
            label="除虫抑制率"
            width="100">
        </el-table-column>
        <el-table-column
            prop="prate"
            label="磷酸比例"
            width="80">
        </el-table-column>
      </el-table>
  </el-footer>
  <el-aside class="weather">
    <h3>实时天气预报</h3>
    <h4>曩宋智慧蔬菜种植基地</h4>
    <div class="wcontainer">
      <cityname>梁河</cityname>
      <div class="imgbox">
        <img src="/src/assets/cloudy.png"/>
        <el-progress :percentage="22/50*100" :width="400" type="circle" color="green" :show-text="false"></el-progress>
      </div>
      <h5>22℃</h5>
      <h6>多云18℃~23℃</h6>
      <h7>最近7天天气情况</h7>
      <div class="wtablebox">
        <div class="wtable" ref="lineChart">
        </div>
      </div>
    </div>
  </el-aside>
  <div v-show="this.isVisible" class="shotpanel" id="spanel" @mouseover="handleShotover" @mouseleave="handleShotleave">
    <div class="method" v-for="(item, index) in this.shots" @click="handleShot(index)"><p>{{item}}</p></div>
  </div>
</template>

<script>
import {defineComponent, reactive, ref,onMounted} from 'vue';
import VueECharts from 'vue-echarts';
import * as echarts from 'echarts';
import { ElContainer, ElHeader, ElMain } from 'element-plus';
import axios from "axios";
import EZUIKit from 'ezuikit-js';
import { EZUIKitPlayer } from "ezuikit-js";
let ghid="";
async function getVideotoken(){
  const responsegh = await axios.post('http://localhost:8080/api/greenhouse/getInfo',{ghid:null,token: localStorage.getItem('jwt')});
  if(responsegh.data==null){
    if(this.isAlert==0){
      localStorage.removeItem('jwt');
      this.isAlert = 1;
      alert("出错了，请重新登陆")
      this.$router.push('/');
    }
  }else {
    responsegh.data.forEach(item => {
      ghid=item.id;
    })    //假设只有1个大棚
  }
  const responsevdo = await axios.post('http://localhost:8080/api/videotoken/gettoken', {
    ghid: ghid,
    token: localStorage.getItem('jwt')
  });
  if (responsevdo.data == null) {
    if(this.isAlert==0){
      localStorage.removeItem('jwt');
      this.isAlert = 1;
      alert("出错了，请重新登陆")
      this.$router.push('/');
    }
  } else {
    return responsevdo.data;
  }
}
async function getVideourl(){
  const responseurl = await axios.post('http://localhost:8080/api/camera/geturl', {
    ghid: ghid,
    token: localStorage.getItem('jwt')
  });
  if (responseurl.data == null) {
    if(this.isAlert==0){
      localStorage.removeItem('jwt');
      this.isAlert = 1;
      alert("出错了，请重新登陆")
      this.$router.push('/');
    }
  } else {
    return responseurl.data;
  }
}
async function initializeplayer(){
  const player = new EZUIKit.EZUIKitPlayer({
    id: "ezuikit-player",
    accessToken:await getVideotoken(),
    url: await getVideourl(),
    width:document.body.clientWidth*(37.5/100),
    height:document.body.clientHeight*(56/100),
  });
}
export default defineComponent({

  name: 'App',
  components: {
    'vue-echarts': VueECharts,
    ElContainer,
    ElHeader,
    ElMain
  },
  data() {
    return {
      current:'',
      weatherData: [],
      accesstoken:'',
      ghid:'',
      ghname:'正在获取',
      gharea:'正在获取',
      batchTableData:[],
      soilsensors:[],
      ensensors:[],
      ispushed:0,
      cmrsn:"",
      shots:["流畅","高清","4CIF","1080P","400w"],
      paneldisplay:"flex",
      isVisible:false,
      isAlert:0,   //记录是否弹出过登陆过期错误，防止登陆过期后周期性任务不停弹窗
    };
  },
  async mounted() {
    this.getCurrentDnT ();
    this.getRecentWeather();
    await this.getAccesstoken();
    await this.getghinfo();
    this.getbatchinfo();
    this.getsinfo();
    initializeplayer();
    setInterval(this.getCurrentDnT,1000);  //1s刷新一次时间
    setInterval(this.getsinfo,30000);  //30s从后端刷新一次数据
  },
  methods: {
    getCurrentDnT (){
      const now = new Date();
      const weekdays = ["(日)", "(月)", "(火)", "(水)", "(木)", "(金)", "(土)"];
      const dayOfWeek = weekdays[now.getDay()];
      const year = now.getFullYear();
      const month = String(now.getMonth() + 1).padStart(2, '0');
      const day = String(now.getDate()).padStart(2, '0');
      const hours = String(now.getHours()).padStart(2, '0');
      const minutes = String(now.getMinutes()).padStart(2, '0');
      const seconds = String(now.getSeconds()).padStart(2, '0');
      this.current = `${year}/${month}/${day} ${dayOfWeek} ${hours}:${minutes}:${seconds}`;
    },
    formatDate(date) {
      const year = date.getFullYear();
      const month = (date.getMonth() + 1).toString().padStart(2, '0');  // 月份从0开始，所以需要加1
      const day = date.getDate().toString().padStart(2, '0');  // 确保日期是两位数
      return `${year}-${month}-${day}`;
    },
    async getRecentWeather(){
      const days = [];
      const currentDate = new Date();
      for (let i = 1; i <= 7; i++) {
        const day = new Date(currentDate);
        day.setDate(currentDate.getDate() - i);
        days.push(this.formatDate(day));
      }
      this.weatherData.push({   //天气信息写死
        date: days[0],
        weather: `多云`,
        lowTemp: `18`,
        highTemp:`25`,
      });
      this.weatherData.push({
        date: days[1],
        weather: `雨`,
        lowTemp: `11`,
        highTemp:`18`,
      });
      this.weatherData.push({
        date: days[2],
        weather: `晴`,
        lowTemp: `22`,
        highTemp:`28`,
      });
      this.weatherData.push({
        date: days[3],
        weather: `多云`,
        lowTemp: `15`,
        highTemp:`23`,
      });
      this.weatherData.push({
        date: days[4],
        weather: `风`,
        lowTemp: `14`,
        highTemp:`20`,
      });
      this.weatherData.push({
        date: days[5],
        weather: `雨`,
        lowTemp: `9`,
        highTemp:`16`,
      });
      this.weatherData.push({
        date: days[6],
        weather: `多云`,
        lowTemp: `15`,
        highTemp:`28`,
      });
      this.renderLineChart();
    },
    renderLineChart() {
      const dates = this.weatherData.map(item => item.date);
      const highTemps = this.weatherData.map(item => item.highTemp);
      const lowTemps = this.weatherData.map(item => item.lowTemp);
      const chartDom = this.$refs.lineChart;
      const myChart = echarts.init(chartDom);
      const minTemp = Math.min(...lowTemps) - 2;  // 最低温度再减去2
      const maxTemp = Math.max(...highTemps) + 2;  // 最高温度再加上2
      const i = Math.ceil((maxTemp-minTemp)/13);
      const option = {
        tooltip: {
          trigger: 'axis',
          formatter: (params) => {
            let result = `${params[0].name}<br>`;
            params.forEach(item => {
              result += `${item.seriesName}: ${item.value}°C<br>`;
            });
            return result;
          }
        },
        legend: {
          data: ['最高气温', '最低气温'],
          top: '5%',
          textStyle: {
            fontSize: 16
          }
        },
        xAxis: {
          type: 'category',
          boundaryGap: false,
          data: dates,
          axisLabel: {
            fontSize: 12,
            rotate: 45,
            interval: 0
          },
          axisTick: {
            show: true
          }
        },
        yAxis: {
          type: 'value',
          min: minTemp,
          max: maxTemp,
          interval: i,
          axisLabel: {
            formatter: '{value} °C',
            fontSize: 14,
          },
          boundaryGap: ['20%', '20%']
        },
        grid: {
          left: '13%',
          right: '4%',
          bottom: '19%',
          top: '15%'
        },
        series: [
          {
            name: '最高气温',
            type: 'line',
            data: highTemps,
            smooth: false,
            lineStyle: {
              color: '#ff6347'
            },
            label: {
              show: true,
              position: 'top',
              formatter: '{c}°C'
            },
          },
          {
            name: '最低气温',
            type: 'line',
            data: lowTemps,
            smooth: false,
            lineStyle: {
              color: '#1e90ff'
            },
            label: {
              show: true,
              position: 'top',
              formatter: '{c}°C'
            }
          }
        ]
      };
      myChart.setOption(option);
      window.addEventListener('resize', () => {
        myChart.resize();
      });
    },
    async getAccesstoken(){
      try {
        const response = await axios.post('http://localhost:8080/api/auth/getaccesstoken',{ghid:this.ghid,token: localStorage.getItem('jwt')});
        if(response.data==null){
          if(this.isAlert==0){
            localStorage.removeItem('jwt');
            this.isAlert = 1;
            alert("出错了，请重新登陆")
            this.$router.push('/');
          }
        }else {
          this.accesstoken = response.data;
        }
      } catch (error) {

      }
    },
    async getghinfo(){
      try {
        const response = await axios.post('http://localhost:8080/api/greenhouse/getInfo',{ghid:null,token: localStorage.getItem('jwt')});
        if(response.data==null){
          if(this.isAlert==0){
            localStorage.removeItem('jwt');
            this.isAlert = 1;
            alert("出错了，请重新登陆")
            this.$router.push('/');
          }
        }else {
          response.data.forEach(item => {
            this.ghid=item.id;
            this.ghname = item.name;
            this.gharea=item.area;
          })         //假设只有1个大棚
        }
      } catch (error) {

      }
    },
    async getbatchinfo(){
      try {
        const response = await axios.post('http://localhost:8080/api/batch/getInfo',{ghid:this.ghid,token: localStorage.getItem('jwt')});
        if(response.data==null){
          if(this.isAlert==0){
            localStorage.removeItem('jwt');
            this.isAlert = 1;
            alert("出错了，请重新登陆")
            this.$router.push('/');
          }
        }else {
          response.data.forEach(item => {
            this.batchTableData.push({
              id: item.id,
              batch: item.batch,
              store: item.store,
              planttime: item.planttime,
              pickuptime: item.pickuptime,
              antipestrate: item.antipestrate,
              prate: item.prate,
            });
          })
        }
      } catch (error) {
      }
    },
    async getsinfo() {
      try {
          const response = await axios.post('http://localhost:8080/api/device/getInfo', {
          ghid: this.ghid,
          token: localStorage.getItem('jwt')
        });
        if (response.data == '') {
          if(this.isAlert==0){
            localStorage.removeItem('jwt');
            this.isAlert = 1;
            alert("出错了，请重新登陆")
            this.$router.push('/');
          }
        } else {
          response.data.forEach(item => {
            if (item.type == "0" && this.ispushed=="0") {  //土壤传感器
              this.soilsensors.push({
                name: item.name,
                value: item.value,
                unit: item.unit,
                percent: item.percent,
                type: item.type,
                ccondition: item.ccondition,
                color: "background-color:"+item.color,
              })
            }else if(item.type == "1" && this.ispushed=="0"){
              this.ensensors.push({
                name: item.name,
                value: item.value,
                unit: item.unit,
                percent: item.percent,
                type: item.type,
                ccondition: item.ccondition,
                color: item.color,
              })
            }else if(this.ispushed=="1"){  //已经push过，直接更新值而不用管type，因为在updateitem里已有区分
              this.updateitem(item)
            }
          })
        }
        this.ispushed=1;
      } catch (error) {

      }
    },
    updateitem(target){
      if(target.type == '0'){
        this.soilsensors.forEach(item => {
          if(item.name == target.name){
            item.value = target.value;
            item.percent = target.percent;
            item.ccondition = target.ccondition;
            item.color = "background-color:"+target.color;
          }
        })
      }else if(target.type == '1'){
        this.ensensors.forEach(item => {
          if(item.name == target.name){
            item.value = target.value;
            item.percent = target.percent;
            item.ccondition = target.ccondition;
            item.color = target.color;
          }
        })
      }
    },
    async handleShot(index){
      const responseshot = await axios.post('http://localhost:8080/api/camera/shot', {
        ghid: this.ghid,
        token: localStorage.getItem('jwt'),
        quality: index,
      });
      if (responseshot.data == '') {
        if(this.isAlert==0){
          localStorage.removeItem('jwt');
          this.isAlert = 1;
          alert("出错了，请重新登陆")
          this.$router.push('/');
        }
      } else {
        window.open(responseshot.data, "_blank");
      }
    },
    handleShotover(){
      this.isVisible=true;
    },
    handleShotleave(){
      this.isVisible=false;
    }
  },
});
</script>

<style scoped>
toppart{
  top:0;
  left: 0;
  position: fixed;
  display: flex;
  min-height: 7vh;
  max-height: 7vh;
  min-width: 100vw;
  font-size: 2vw;
  justify-content: center;
  align-items: center;
}
toppart h3{
  width: 37.5vw;
  height: 5.5vh;
  top:1.2vh;
  display: flex;
  font-size: 1.8vw;
  font-weight: bold;
  background-color:  #fff;
  color: #000;
  border-radius: 1rem;
  justify-content: center;
  align-items: center;
  position: fixed;
  left: 36.5vw;
  box-shadow: 0 4px 10px rgba(0, 0, 0, 0.1);
}
toppart h4{
  width: 24.45vw;
  height: 5.5vh;
  top:1.2vh;
  display: flex;
  font-size: 1.8vw;
  background-color:  #fff;
  color: #000;
  border-radius: 1rem;
  justify-content: center;
  align-items: center;
  position: fixed;
  left: 75vw;
  box-shadow: 0 4px 10px rgba(0, 0, 0, 0.1);
}
bodypart{
  top:5vh;
  left: 0;
  position: fixed;
  display: flex;
  min-height: 95vh;
  max-height: 95vh;
  min-width: 100vw;
}
.container {
  display: flex;
  position: fixed;
  min-height: 100vh;
  min-width: 100vw;
  top: 0;
  left: 0;
  padding: 2vw;
  background-color: #f2f4f5;
}
.aside {
  width: 35vw;
  display: flex;
  flex-direction: column;
  left: 0.5vw;
  top:0.5vw;
  position: fixed;
  gap: 1vh;
}
.aside .card {
  background-color: #fff;
  border-radius: 1rem;
  display: flex;
  flex-direction: row;
  flex-wrap: wrap;
  row-gap: 1vh;
  column-gap: 1vw;
  box-shadow: 0 4px 10px rgba(0, 0, 0, 0.1);
  padding: 1.5vw;
  left: 0.5vw;
}
.ghitem{
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  background-color: dodgerblue;
  color: white;
  border: 2px solid grey;
  border-radius: 0.8rem;
  width: 8.3vw;
  height: 10vh;
}
.ghcontent{
  width: 30vw;
  height: 40vh;
  display: flex;
  justify-content: space-around;
  align-items: center;
  flex-direction: row;
  column-gap: 1vw;
  row-gap: 1vh;
  flex-wrap: wrap;
  padding: 1vw;
}
.ghitem .upper{
  width: 6vw;
  height: 3vh;
  display: flex;
  font-size: 1vw;
  justify-content: center;
  align-items: center;
}
.ghitem .lower{
  width: 6vw;
  height: 3vh;
  display: flex;
  font-size: 1vw;
  justify-content: center;
  align-items: center;
}
.ghitem .lowersa{
  width: 6vw;
  height: 3vh;
  display: flex;
  font-size: 1vw;
  justify-content: space-around;
  align-items: center;
}
.ghitem .lowersa .condition{
  width: 2vw;
  height: 3vh;
  display: flex;
  font-size: 1vw;
  justify-content: center;
  align-items: center;
  border-radius: 0.8rem;

}
.enitem{
  display: flex;
  flex-direction: row;
  justify-content: space-around;
  align-items: center;
  background-color: dodgerblue;
  color: white;
  border: 2px solid grey;
  border-radius: 0.8rem;
  width: 13.5vw;
  height: 12vh;
}
.encontent{
  width: 30vw;
  height: 24.5vh;
  max-height: 27vh;
  display: flex;
  justify-content: center;
  align-items: center;
  flex-direction: row;
  column-gap: 1vw;
  row-gap: 1vh;
  flex-wrap: wrap;
  padding: 1vw;
}
.encontent .enitem .left{
  width: 12vw;
  height: 4vh;
  display: flex;
  font-size: 0.8vw;
  justify-content: center;
  align-items: center;
}
.encontent .enitem .progress{
  width: 10vw;
  height: 3vh;
  display: flex;
  font-size: 1vw;
  justify-content: center;
  align-items: center;
}
.encontent .enitem .right{
  width: 8vw;
  height: 3vh;
  display: flex;
  font-size: 0.9vw;
  justify-content: center;
  align-items: center;
}
.video {
  width: 71.5vw;
  left: 36vw;
  position: fixed;
  top:6.5vh;
}
.video-card {
  min-height: 67vh;
  max-height: 67vh;
  min-width: 37.57vw;
  max-width: 37.57vw;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  background-color: #fff;
  border-radius: 1rem;
  box-shadow: 0 4px 10px rgba(0, 0, 0, 0.1);
}
.video-card h3{
  font-size: 1.4vw;
  text-align: center;
  min-height: 4vh;
  max-height: 4vh;
}
.video-frame {
  min-width: 37.5vw;
  min-height: 56vh;
  max-width: 37.5vw;
  max-height: 56vh;
  border-radius: 0.75rem;
  box-shadow: 1px 4px 12px rgba(0, 0, 0, 0.1);
}
.video-card .last{
  min-width: 37.5vw;
  min-height: 6vh;
  display: flex;
  justify-content: right;
  align-items: center;
}
.video-card .last .shot-button{
  margin-right: 1vw;
  position: fixed;
  left:68vw ;
  top:69vh;
  width: 5vw;
  height: 4vh;
  font-size: 1vw;
  border-radius: 0.75rem;
  display: flex;
  justify-content: center;
  align-items: center;

}
.batchinfo {
  width: 37.5vw;
  height: 24vh;
  left: 36.5vw;
  bottom: 1vh;
  padding: 1vw;
  background-color: #fff;
  position: fixed;
  border-radius: 0.8rem;
  box-shadow: 1px 4px 12px rgba(0, 0, 0, 0.1);
  overflow-y: scroll;
}
.weather{
  right: 0.5vw;
  width: 24.5vw;
  top:7.5vh;
  height: 91.5vh;
  position: fixed;
  background-color: #fff;
  border-radius: 0.8rem;
  box-shadow: 1px 4px 12px rgba(0, 0, 0, 0.1);
  display: flex;
  flex-direction: column;
  flex-wrap: wrap;
  row-gap: 1vh;
}
.weather h3{
  width: 24.5vw;
  height: 5vh;
  font-size: 1.4vw;
  display: flex;
  justify-content: center;
  align-items: center;
}
.weather h4{
  width: 24.5vw;
  height: 5vh;
  font-size: 1.4vw;
  display: flex;
  justify-content: center;
  align-items: center;
  background-color: #ccc;
  border-radius: 0.8rem;
  color: black;
}
.weather .wcontainer{
  width: 24.5vw;
  height: 48vh;
  display: flex;
  flex-direction: column;
  justify-content: flex-start;
  align-items: center;
  border-radius: 0.8rem;
  row-gap: 1vh;
}
.weather .wcontainer cityname{
  width: 23.5vw;
  margin-left: 1vw;
  height: 5vh;
  font-size: 1.4vw;
  display: flex;
  justify-content: normal;
  align-items: center;
}
.weather .wcontainer .imgbox{
  width: 23.5vw;
  height: 21vh;
  display: flex;
  justify-content: center;
  align-items: center;
}
.weather .wcontainer .imgbox img{
  max-width:6vw;
  max-height:6vw;
  position: fixed;
}
.weather .wcontainer .imgbox .progress{
  max-width:7vw;
  max-height:7vw;
  position: fixed;
}
.weather .wcontainer h5{
  width: 24.5vw;
  height: 5vh;
  font-size: 1.8vw;
  display: flex;
  justify-content: center;
  align-items: center;
}
.weather .wcontainer h6{
  width: 24.5vw;
  height: 8vh;
  font-size: 1.4vw;
  display: flex;
  justify-content: center;
  align-items: center;
}
.weather .wcontainer h7{
  width: 24.5vw;
  height: 8vh;
  font-size: 1vw;
  display: flex;
  justify-content: center;
  align-items: center;
}
.weather .wcontainer .wtablebox{
  width: 24.5vw;
  min-height: 33vh;
  display: flex;
  justify-content: center;
  align-items: center;
  margin-bottom: 3vh;
}
.weather .wcontainer .wtablebox .wtable{
  width: 24.5vw;
  min-height: 33vh;
  display: flex;
  justify-content: center;
  align-items: center;
}
.card h3 {
  font-size: 1.25vw;
  font-weight: bold;
  color: #333;
  margin-bottom: 1rem;
}
el-progress {
  width: 8vw;
  --el-progress-circle-size: 8vw;
}
el-tag {
  font-size: 0.875vw;
  padding: 0.5vw;
}
el-descriptions-item {
  font-size: 1vw;
  color: #666;
}
el-row {
  margin-bottom: 1vh;
}
el-row el-col {
  padding: 1vw;
}
.shotpanel{
  position: fixed;
  left:73vw;
  top: 61vh;
  width: 10vw;
  height: 20vh;
  flex-direction: column;
  background-color: #888;
  border-radius: 0.8rem;
  padding: 0.3vw;
  row-gap: 0.5vw;
  justify-content: center;
  align-items: center;
  display: flex;
  transition: opacity 0.5s ease-in-out;
}
.shotpanel .method{
  color: white;
  border-radius: 0.8rem;
  min-width: 10vw;
  min-height: 3vh;
  display:flex;
  justify-content: center;
  align-items: center;
}
.shotpanel .method:hover{
  background-color: #cccccc;
  color: black;
  cursor: pointer;
}
fade-enter-active, fade-leave-active {
  transition: opacity 0.5s ease-in-out, transform 0.5s ease-in-out;
}

fade-enter, fade-leave-to{
  opacity: 0;
  transform: translateY(-20px);
}
</style>
