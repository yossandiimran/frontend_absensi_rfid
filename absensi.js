var dataKaryawan = [];
var table;

$(document).ready(async function () {
    var now = new Date();
    var year = now.getFullYear();
    var month = (now.getMonth() + 1).toString().padStart(2, '0');
    $('#bulan').val(month);
    $('#tahun').val(year);
    await filterAbsensi('init');

    table = await $('#rekapKaryawanTable').DataTable({
        "paging": true,
        "searching": true,
        "ordering": true,
        "info": true
    });

    $('#divisi').on('change', function () {
        var selectedDivisi = $(this).val().toLowerCase(); // Ambil nilai divisi yang dipilih

        if (selectedDivisi) {
            // Jika divisi dipilih, filter berdasarkan nilai divisi
            table.column(2).search(selectedDivisi).draw();
        } else {
            // Jika "Semua" dipilih, reset filter
            table.column(2).search('').draw();
        }

        // Loop melalui setiap baris di tabel
        $('#bodyViewPdf tr').each(function () {
            var rowDivisi = $(this).find('td:eq(2)').text().toLowerCase(); // Ambil nilai Divisi di kolom ke-3
            // Jika divisi dipilih atau opsi "Semua" dipilih
            if (selectedDivisi === "" || rowDivisi === selectedDivisi) {
                $(this).show(); // Tampilkan baris yang sesuai
            } else {
                $(this).hide(); // Sembunyikan baris yang tidak sesuai
            }
        });
    });
});

var specialElementHandlers = {
    '#editor': function (element, renderer) {
        return true;
    }
};

function reloadTable() {
    var updatedData = [];
    $('#bodyViewRekapKaryawan tr').each(function () {
        var row = [];
        $(this).find('td').each(function () {
            row.push($(this).html());
        });
        updatedData.push(row);
    });

    table.clear();
    table.rows.add(updatedData);
    table.draw();
}


$('#submit_excel').click(function () {
    var table = document.querySelector('#content table');

    var wb = XLSX.utils.book_new();

    var ws = XLSX.utils.table_to_sheet(table, { origin: 'A3' });

    // const tglAwal = $('#tgl_awal').val();
    const tglAwal = $('#tahun').val() + '-' + $('#bulan').val();
    if (tglAwal) {
        const date = new Date(tglAwal + '-01');
        const options = { year: 'numeric', month: 'long' };
        const formattedDate = date.toLocaleString('id-ID', options);

        ws['A1'] = { t: 's', v: `Rekapitulasi Absensi Periode: ${formattedDate}` };
        ws['A2'] = { t: 's', v: `Divisi: ${$("#divisi").val()}` };
        ws['!merges'] = [
            { s: { r: 0, c: 0 }, e: { r: 0, c: 6 } },
            { s: { r: 1, c: 0 }, e: { r: 1, c: 6 } },
        ];

        XLSX.utils.sheet_add_aoa(ws, [[]], { origin: -1 });
    }

    XLSX.utils.book_append_sheet(wb, ws, "Sheet1");

    XLSX.writeFile(wb, `Rekap-Absen-Periode-${formattedDate}.xlsx`);

});

$('#submit_pdf').click(function () {
    const { jsPDF } = window.jspdf;
    const doc = new jsPDF('p', 'pt', 'a4');
    // const tglAwal = $('#tgl_awal').val();
    const tglAwal = $('#tahun').val() + '-' + $('#bulan').val();
    if (tglAwal) {
        const date = new Date(tglAwal + '-01');

        const options = { year: 'numeric', month: 'long' };
        const formattedDate = date.toLocaleString('id-ID', options);

        doc.setFontSize(12);
        doc.text("Rekapitulasi Absensi", 40, 40);
        doc.text(`Periode: ${formattedDate}`, 40, 60);
        doc.text(`Divisi: ${$('#divisi').val()}`, 40, 80);
    }

    const columns = ["Nama", "UID", "Divisi", "Kehadiran", "Persentase", "Tanggal Kehadiran"];
    const data = [];

    $('#bodyViewPdf tr').each(function () {
        // Cek apakah baris sedang terlihat
        if ($(this).is(':visible')) {
            const row = [];
            $(this).find('td').each(function () {
                row.push($(this).html().replace(/<br>/g, '\n')); // Ambil nilai kolom dan ganti <br> dengan newline (\n)
            });
            data.push(row); // Tambahkan baris ke array data jika baris terlihat
        }
    });

    doc.autoTable({
        head: [columns],
        body: data,
        startY: 100,
        theme: 'striped',
        margin: { top: 20 },
        styles: { fontSize: 10 },
        columnStyles: {
            4: { cellWidth: 'wrap' }
        },
    });

    doc.save('Rekap_Absensi.pdf');

});

async function filterAbsensi(init) {
    dataKaryawan = []
    // var selectedMonth = $('#tgl_awal').val();
    var selectedMonth = $('#tahun').val() + '-' + $('#bulan').val();
    var firstDayStr = selectedMonth + '-01';
    var tglAwals = new Date(firstDayStr);
    var tglAkhirs = new Date(tglAwals.getFullYear(), tglAwals.getMonth() + 1, 0);
    var tglAwalFormatted = tglAwals.toISOString().split('T')[0];
    var tglAkhirFormatted = tglAkhirs.toISOString().split('T')[0];
    await getKaryawan()
    await appendToTableRekap(await getRekapHarian(tglAwalFormatted, tglAkhirFormatted));
    if (init != 'init') {
        reloadTable();
    }
    $('#divisi').trigger('change');
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
    const groupedData = {};

    data.forEach(item => {
        if (!groupedData[item.uid]) {
            groupedData[item.uid] = {
                name: item.name,
                uid: item.uid,
                absensi: []
            };
        }

        const dateOnly = item.created.split(' ')[0];

        if (!groupedData[item.uid].absensi.some(date => date.startsWith(dateOnly))) {
            groupedData[item.uid].absensi.push(item.created);
        }
    });

    const newGroupData = Object.values(groupedData);

    dataKaryawan.forEach(items => {
        newGroupData.forEach(item => {
            if (items.uid == item.uid) {
                items.absensi = item.absensi
            }
        });
    });


    // var selectedMonth = $('#tgl_awal').val();
    var selectedMonth = $('#tahun').val() + '-' + $('#bulan').val();
    var firstDayStr = selectedMonth + '-01';
    var tglAwals = new Date(firstDayStr);

    var tglAkhirs = new Date(tglAwals.getFullYear(), tglAwals.getMonth() + 1, 0);

    var tglAwalFormatted = tglAwals.toISOString().split('T')[0];
    var tglAkhirFormatted = tglAkhirs.toISOString().split('T')[0];

    const tglAwal = new Date(tglAwalFormatted);
    const tglAkhir = new Date(tglAkhirFormatted);

    console.log(tglAwal)
    console.log(tglAkhir)


    const getWeekdaysCount = (startDate, endDate) => {
        let count = 0;
        let currentDate = new Date(startDate);

        while (currentDate <= endDate) {
            const dayOfWeek = currentDate.getDay();
            if (dayOfWeek !== 0 && dayOfWeek !== 6) {
                count++;
            }
            currentDate.setDate(currentDate.getDate() + 1);
        }

        return count;
    };

    const diffDays = getWeekdaysCount(tglAwal, tglAkhir);

    const $tbody = $('#bodyViewRekapKaryawan');
    const $tbodyPdf = $('#bodyViewPdf');
    $tbody.html('');
    $tbodyPdf.html('');
    dataKaryawan.forEach(function (e) {
        var kpi = 0;
        var jmlAbsen = 0;
        if (e.absensi != undefined) {
            jmlAbsen = e.absensi.length
            kpi = ((jmlAbsen / diffDays) * 100).toFixed(2);
        }
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
                        <div class="d-flex px-2">
                        <div class="my-auto">
                            <h6 class="mb-0 text-sm">${e.uid}</h6>
                        </div>
                        </div>
                    </td>
                    <td>
                        <p class="text-sm font-weight-bold mb-0">${e.divisi}</p>
                    </td>
                    <td>
                        <p class="text-sm font-weight-bold mb-0">${jmlAbsen} dari ${diffDays + 1} hari Kerja</p>
                    </td>
                    <td class="align-middle text-center">
                        <div class="d-flex align-items-center justify-content-center">
                        <span class="me-2 text-xs font-weight-bold">${kpi}%</span>
                        <div>
                            <div class="progress">
                            <div class="progress-bar bg-gradient-danger" role="progressbar" aria-valuenow="100" aria-valuemin="0" aria-valuemax="100" style="width: ${kpi}%;"></div>
                            </div>
                        </div>
                        </div>
                    </td>
                     <td>
                        <button type="button" onclick=openModalDetail("${btoa(JSON.stringify(e))}") class="btn btn-sm btn-primary"><span class="fa fa-eye"></span></button>           
                    </td>
                </tr>
       
        `;

        var absensiDates = "\n ";
        if (e.absensi != undefined) {
            absensiDates = e.absensi.map(date => new Date(date).toLocaleDateString()).join('\n •');
        }
        const rowPdf = `
                <tr>
                    <td>${e.name}</td>
                    <td>${e.uid}</td>
                    <td>${e.divisi}</td>
                    <td>${jmlAbsen}</td>
                    <td class="align-middle text-center">${kpi}%</td>
                    <td> •${absensiDates.replace(/\n/g, '<br>')}</td>
                </tr>
        `;
        $tbody.append(row);
        $tbodyPdf.append(rowPdf);
    });
}

function getAbsensiDetail(data) {
    return '<adsasdsad>';
}

async function openModalDetail(data) {
    const karyawan = JSON.parse(atob(data));


    function getDateParts(dateString) {
        const date = new Date(dateString);
        const year = date.getFullYear();
        const month = date.getMonth() + 1;
        const day = date.getDate();
        return { year, month, day };
    }

    const dateParts = getDateParts(karyawan.absensi);
    console.log(karyawan.absensi);

    const events = karyawan.absensi.map(karyawan => {
        const { year, month, day } = getDateParts(karyawan);
        const dateStr = `${year}-${String(month).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
        var titl = "Hadir";

        var jam = formatJam(karyawan);

        if (jam > "08:00") {
            col = "red";
            titl = "Terlambat";
        } else {
            col = "green";
        }

        return {
            title: ` (${jam}) - ${titl}`,
            start: dateStr,
            color: col
        };
    });

    var calendarEl = document.getElementById('calendar');
    var calendar = new FullCalendar.Calendar(calendarEl, {
        initialView: 'dayGridMonth',
        events: events
    });

    $('#modalDetail').modal('show');
    calendar.render();
}