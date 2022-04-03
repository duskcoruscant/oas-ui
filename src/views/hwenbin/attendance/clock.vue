<template>
  <div class="text-center">
    <FlipClock></FlipClock>
    <div class="current-date">{{ currentDate }}</div>
    <div class="clock-button">
      <el-button-group>
        <el-button :disabled="Boolean(attendance)" size="large" type="primary" @click="clockIn">
          签到
        </el-button>
        <el-button :disabled="Boolean(!attendance) || Boolean(attendance.clockOutTime)" size="large" type="primary"
          @click="clockOut">
          签退
        </el-button>
      </el-button-group>
    </div>
  </div>
</template>

<script>
import FlipClock from '@/components/FlipClock/FlipClock'
import { getAttListByMonthOrDate, clockIn, clockOut } from '@/api/attendance'
import { mapGetters } from 'vuex'

export default {
  name: 'Attendance-Clock',
  components: { FlipClock },
  data() {
    return {
      attendance: {},
      currentDate: ''
    }
  },
  mounted() {
    const nowDate = new Date()
    this.currentDate = `${nowDate.getFullYear()}年${nowDate.getMonth() + 1}月${nowDate.getDate()}日`
  },
  created() {
    this.getAttendances()
  },
  computed: {
    ...mapGetters(['accountId'])
  },
  methods: {
    getAttendances() {
      const date = new Date()
      const year = date.getFullYear()
      const month = date.getMonth() + 1
      const day = date.getDate()
      getAttListByMonthOrDate({ empId: this.accountId, year, month, day }).then(result => {
        this.attendance = result.data[0]
      })
    },
    clockIn() {
      clockIn(this.accountId).then(result => {
        this.attendance = result.data
        const minutes = this.attendance.comeLateMinutes
        if (minutes) {
          this.$modal.msgWarning('签到成功，迟到' + minutes + '分钟')
        } else {
          this.$modal.msgSuccess('签到成功')
        }
      })
    },
    clockOut() {
      clockOut(this.accountId).then(result => {
        this.attendance = result.data
        const minutes = this.attendance.leaveEarlyMinutes
        if (minutes) {
          this.$modal.msgWarning('签退成功，早退' + minutes + '分钟')
        } else {
          this.$modal.msgSuccess('签退成功')
        }
      })
    }
  }
}
</script>

<style scoped>
.text-center {
    text-align: center;
}
.current-time {
    margin-top: 40px;
    font-size: 50px;
}

.current-date {
    margin: 20px 0;
    font-size: 40px;
}

.clock-button {
    margin-top: 3%;
}
</style>