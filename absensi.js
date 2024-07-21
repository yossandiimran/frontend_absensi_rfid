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
            <td>${formatJam(e.jam_keluar) != "00:00" ? formatJam(e.jam_keluar) : "-"}</td>
        </tr>
    `;
        $tbody.append(row);
    });

});