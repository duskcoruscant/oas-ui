<template>
    <el-calendar v-model="currentDate">
        <!-- <template #dateCell="{data}"> -->
        <template slot="dateCell" slot-scope="{date, data}">
            {{ data.day.slice(8) }}
            <div v-if="verifyDateRange(date)" class="clock-description">
                <template v-if="hasAttendance(data)">
                    <el-popover placement="top" trigger="hover">
                        <div class="clock-time">
                            签到时间：{{ data.attendance.clockInTime ? parseTime(data.attendance.clockInTime).slice(10) : '未签到' }}
                        </div>
                        <div class="clock-time">
                            签退时间：{{ data.attendance.clockOutTime ?  parseTime(data.attendance.clockOutTime).slice(10) : '未签退' }}
                        </div>
                        <template slot="reference">
                            <div v-if="isAbnormalAttendance(data)">
                                <el-icon color="#E6A23C">
                                    <warning-filled/>
                                </el-icon>
                                <span style="color: #E6A23C">
                                {{ getAbnormalDescription(data.attendance) }}
                                </span>
                            </div>
                            <div v-else>
                                <el-icon color="#67C23A">
                                    <success-filled/>
                                </el-icon>
                                <span style="color: #67C23A">正常</span>
                            </div>
                        </template>
                    </el-popover>
                </template>
                <template v-else>
                    <el-icon color="#F56C6C">
                        <circle-close-filled/>
                    </el-icon>
                    <span style="color: #F56C6C">{{ date.getMonth != currentMonth || date.getDate() != currentDay ? '缺勤' : '今日未考勤' }}</span>
                </template>
            </div>
        </template>
    </el-calendar>
</template>

<script>
import { getAttListByMonthOrDate } from '@/api/attendance'
import { mapGetters } from 'vuex'

export default {
  name: 'Attendance-Record-View',
  data() {
    return {
      currentDate: new Date(),
      currentMonth: new Date().getMonth(),
      currentDay: new Date().getDate(),
      currentDateTailTime: new Date().setHours(23),
      attendances: []
    }
  },
  watch: {
    currentDate(currentDate) {
      if (currentDate.getMonth() !== this.currentMonth) {
        this.currentMonth = currentDate.getMonth()
        this.getAttendances(currentDate)
      }
    }
  },
  computed: {
    ...mapGetters(['accountId'])
  },
  created() {
    this.getAttendances(this.currentDate)
  },
  methods: {
    getAttendances(currentMonth) {
      const year = currentMonth.getFullYear()
      const month = currentMonth.getMonth() + 1
      getAttListByMonthOrDate({ empId: this.accountId, year, month }).then(result => {
        this.attendances = result.data
      })
    },
    hasAttendance(data) {
      for (let i = 0; i < this.attendances.length; i++) {
        if (this.parseTime(this.attendances[i].clockDate).slice(0, 10) === data.day) {
          data.attendance = this.attendances[i]
          return true
        }
      }
      return false
    },
    verifyDateRange(date) {
      return date.getMonth() === this.currentMonth && date < this.currentDateTailTime
    },
    isAbnormalAttendance(data) {
      return !data.attendance.clockOutTime ||
                data.attendance.comeLateMinutes ||
                data.attendance.leaveEarlyMinutes
    },
    getAbnormalDescription(attendance) {
      let description = ''
      if (attendance.comeLateMinutes) { description += ' 迟到' }
      if (attendance.leaveEarlyMinutes) { description += ' 早退' }
      if (!attendance.clockOutTime) { description += ' 未签退' }
      return description
    }
  }
}
</script>

<style scoped>
.clock-time {
    margin: 10px 10px;
}

.clock-description {
    font-size: 14px;
    margin-top: 20px;
}
</style>