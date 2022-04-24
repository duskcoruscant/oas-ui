<template>
  <el-card class="box-card">
    <div class="resRoomWrap">    

      <div class="main">
        <room-res-plug></room-res-plug>
      </div>

    </div>
  </el-card>
</template>

<script>
import RoomResPlug from '@/components/ConferenceRoomReservation/roomReservation'
export default {
  name: 'homePage',
  components: {
    RoomResPlug
  },
  data() {
    return {

    }
  }
}
</script>

<style scoped>
.box-card {
    margin: 20px;
    background-color: rgba(255, 255, 255, 0.5);
}
.resRoomWrap{
  height:100%;
  display: flex;
  flex-direction: column;
}
.main{
  flex: 1;
  overflow: auto;
}
</style>
