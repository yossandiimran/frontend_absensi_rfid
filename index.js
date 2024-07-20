$(document).ready(async function () {

    var get = await getJumlahKaryawan();
    var getJumlahToday = await getJumlahAbsenHariIni();

    $('#jumKar').text(get.length);
    $('#jumAbsen').text(getJumlahToday.length);
    $('#jumTakAbsen').text(get.length - getJumlahToday.length);

});

async function getJumlahKaryawan() {
    const resultList = await pb.collection('users').getFullList({
        filter: 'level = "karyawan"'
    });
    return resultList;
}

async function getJumlahAbsenHariIni() {
    const resultList = await pb.collection('get_jumlah_karyawan_absen_today').getFullList({});
    console.log(resultList);
    return resultList;
}



