$(document).ready(async function () {

    var get = await getRekapHarian();
    var getJumlahToday = await getJumlahAbsenHariIni();

    $('#jumKar').text(get.length);
    $('#jumAbsen').text(getJumlahToday.totalItems);
    $('#jumTakAbsen').text(get.length - getJumlahToday.totalItems);

    const $tbody = $('#bodyViewRekapKaryawan');
    get.forEach(function (e) {
        const row = `
        <tr>
            <td>${e.name}</td>
            <td>${getStatus(e.status)}</td>
            <td>${e.divisi}</td>
            <td>${formatJam(e.jam_masuk) != "00:00" ? formatJam(e.jam_masuk) : "-"}</td>
            <td>${formatJam(e.jam_keluar) != "00:00" && e.jam_keluar != e.jam_masuk ? formatJam(e.jam_keluar) : "-"}</td>
        </tr>
    `;
        $tbody.append(row);
    });

});

function getStatus(status) {
    if (status == 'TERLAMBAT') return '<div class="bg-warning btn btn-warning btn-sm">Terlambat</div>';
    if (status == 'HADIR') return '<div class="bg-success btn btn-success btn-sm">Hadir</div>';
    if (status == null) return '<div class="bg-danger btn btn-danger btn-sm">Tidak Hadir</div>'
}

async function getRekapHarian() {
    const resultList = await pb.collection('get_rekap_harian').getFullList({
        sort: 'name',
    });
    return resultList;
}

async function getJumlahAbsenHariIni() {
    const resultList = await pb.collection('get_jumlah_karyawan_absen_today').getList(1, 999999999, {});
    return resultList;
}



