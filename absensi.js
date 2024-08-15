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

// Download PDF
var specialElementHandlers = {
    '#editor': function (element, renderer) {
        return true;
    }
};


$('#submit_excel').click(function () {
    // Get the table element
    var table = document.querySelector('#content table');

    // Create a new workbook
    var wb = XLSX.utils.book_new();

    // Convert the HTML table to a worksheet
    var ws = XLSX.utils.table_to_sheet(table);

    // Append the worksheet to the workbook
    XLSX.utils.book_append_sheet(wb, ws, "Sheet1");

    // Generate an Excel file
    XLSX.writeFile(wb, 'Kehadiran.xlsx');

});

$('#submit_pdf').click(function () {
    const { jsPDF } = window.jspdf;
    const doc = new jsPDF('p', 'pt', 'a4');
    // Define table column titles and data
    const columns = ["Nama", "Divisi", "Kehadiran", "Persentase", "Tanggal Kehadiran"];
    const data = [];

    $('#bodyViewPdf tr').each(function () {
        const row = [];
        $(this).find('td').each(function () {
            row.push($(this).html().replace(/<br>/g, '\n'));
        });
        data.push(row);
    });

    doc.autoTable({
        head: [columns],
        body: data,
        startY: 20,
        theme: 'striped',
        margin: { top: 20 },
        styles: { fontSize: 10 },
        columnStyles: {
            4: { cellWidth: 'wrap' }
        },
    });

    // Save the PDF
    doc.save('Rekap_Absensi.pdf');

});

async function filterAbsensi() {
    dataKaryawan = []
    var tglAwal = $('#tgl_awal').val();
    var tglAkhir = $('#tgl_akhir').val();
    await getKaryawan()
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
    const groupedData = {};

    data.forEach(item => {
        if (!groupedData[item.uid]) {
            groupedData[item.uid] = {
                name: item.name,
                uid: item.uid,
                absensi: []
            };
        }
        // Extract hanya tanggal dari item.created
        const dateOnly = item.created.split(' ')[0];

        // Periksa apakah tanggal sudah ada di array absensi
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

    const tglAwal = new Date($('#tgl_awal').val());
    const tglAkhir = new Date($('#tgl_akhir').val());

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
    dataKaryawan.forEach(function (e) {
        var kpi = 0;
        var jmlAbsen = 0;
        if (e.absensi != undefined) {
            jmlAbsen = e.absensi.length
            kpi = ((jmlAbsen / diffDays) * 100).toFixed(2);;
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
                        <p class="text-sm font-weight-bold mb-0">${e.divisi}</p>
                    </td>
                    <td>
                        <p class="text-sm font-weight-bold mb-0">${jmlAbsen} dari ${diffDays} hari Kerja</p>
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

        let absensiDates = e.absensi.map(date => new Date(date).toLocaleDateString()).join('\n');
        const rowPdf = `
                <tr>
                    <td>${e.name}</td>
                    <td>${e.divisi}</td>
                    <td>${jmlAbsen} dari ${diffDays} hari Kerja</td>
                    <td class="align-middle text-center">${kpi}%</td>
                    <td>${absensiDates.replace(/\n/g, '<br>')}</td>
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
        const month = date.getMonth() + 1; // getMonth() mengembalikan bulan dari 0 (Januari) hingga 11 (Desember)
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