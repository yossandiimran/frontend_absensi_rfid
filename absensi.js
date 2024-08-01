var dataKaryawan = [];

$(document).ready(async function () {
    var now = new Date();
    var firstDay = new Date(now.getFullYear(), now.getMonth(), 2);
    var firstDayStr = firstDay.toISOString().split('T')[0];
    var lastDay = new Date(now.getFullYear(), now.getMonth() + 1, 0);
    var lastDayStr = lastDay.toISOString().split('T')[0];

    $('#tgl_awal').val(firstDayStr);
    $('#tgl_akhir').val(lastDayStr);
    await getKaryawan()
    await appendToTableRekap(await getRekapHarian(firstDayStr, lastDayStr));
});

async function filterAbsensi() {
    var tglAwal = $('#tgl_awal').val();
    var tglAkhir = $('#tgl_akhir').val();

    await appendToTableRekap(await getRekapHarian(tglAwal, tglAkhir));
}

async function getRekapHarian(firstDay, lastDay) {
    const resultList = await pb.collection('rekap').getFullList({
        filter: 'created >=  "' + firstDay + '" && created <= "' + lastDay + '"'
    });
    return resultList;
}

async function getKaryawan() {
    const resultList = await pb.collection('users').getFullList({
        filter: 'level = "karyawan"'
    });
    dataKaryawan = resultList;
}

async function appendToTableRekap(data) {
    console.log(dataKaryawan);
    const groupedData = {};

    data.forEach(item => {
        if (!groupedData[item.uid]) {
            groupedData[item.uid] = {
                name: item.name,
                uid: item.uid,
                absensi: []
            };
        }
        groupedData[item.uid].absensi.push(item.jam_absen);
    });

    const newGroupData = Object.values(groupedData);

    console.log(newGroupData);

    const $tbody = $('#bodyViewRekapKaryawan');
    dataKaryawan.forEach(function (e) {
        const row = `
                <tr>
                    <td>
                        <div class="d-flex px-2">
                        <div class="my-auto">
                            <h6 class="mb-0 text-sm">${e.name}</h6>
                        </div>
                        </div>
                    </td>
                    <td>
                        <p class="text-sm font-weight-bold mb-0">${e.divisi}</p>
                    </td>
                    <td class="align-middle text-center">
                        <div class="d-flex align-items-center justify-content-center">
                        <span class="me-2 text-xs font-weight-bold">20%</span>
                        <div>
                            <div class="progress">
                            <div class="progress-bar bg-gradient-danger" role="progressbar" aria-valuenow="20" aria-valuemin="0" aria-valuemax="100" style="width: 20%;"></div>
                            </div>
                        </div>
                        </div>
                    </td>
                     <td>
                        <button type="button" class="btn btn-sm btn-primary"><span class="fa fa-eye"></span></button>               
                    </td>
                </tr>
       
        `;
        $tbody.append(row);
    });
}