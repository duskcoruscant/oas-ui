<template>
    <el-calendar v-model="currentDate">
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
                    <span style="color: #F56C6C">{{ date.getMonth() == currentMonth && date.getDate() == currentDay ? '今日未考勤' : '缺勤' }}</span>
                </template>
              </div>
              <div v-else-if="isNoneEntry(date)">
                <span class="noneEntry">未入职</span>
              </div>
              <div v-else-if="isWeekend(date)">
                <span class="rest">休</span>
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
      // 日历显示月份
      showMonth: new Date().getMonth(),
      currentDay: new Date().getDate(),
      currentDateTailTime: new Date().setHours(23),
      entryDate: undefined,
      attendances: []
    }
  },
  watch: {
    currentDate(currentDate) {
      if (currentDate.getMonth() !== this.showMonth) {
        this.showMonth = currentDate.getMonth()
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
        this.entryDate = result.data && result.data[0] && result.data[0].entryDate || this.entryDate
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
      return date.getMonth() === this.showMonth && date < this.currentDateTailTime &&
        // 入职日期开始
        date >= (this.entryDate || 0) &&
        // 且为工作日
        date.getDay() !== 6 && date.getDay() !== 0
    },
    // 非工作日
    isWeekend(date) {
      // 周六日为非工作日
      return date.getMonth() === this.showMonth && (date.getDay() === 6 || date.getDay() === 0)
    },
    // 是否未入职
    isNoneEntry(date) {
      return date.getMonth() === this.showMonth && date < this.entryDate
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
.rest {
  color: #fff;
  border-radius: 50%;
  background: rgb(250, 124, 77);
  width: 20px;
  height: 20px;
  line-height: 20px;
  display: inline-block;
  font-size: 12px;
  margin-left: 10px;
  text-align: center;
}
.noneEntry {
  color: #fff;
  border-radius: 50%;
  background: rgba(168, 158, 158, 0.767);
  width: 50px;
  height: 20px;
  line-height: 20px;
  display: inline-block;
  font-size: 12px;
  margin-left: 10px;
  text-align: center;
}
</style>