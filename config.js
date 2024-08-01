// Global Variable
const now = new Date();
const year = now.getFullYear();
const month = now.getMonth() + 1;
const day = now.getDate();
const hours = now.getHours();
const minutes = now.getMinutes();
const seconds = now.getSeconds();
const option = {
    weekday: 'long',
    day: '2-digit',
    month: 'long',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    hour12: false
};
const formatter = new Intl.DateTimeFormat('id-ID', option);
const formattedDate = formatter.format(now);

// Koneksi Pocketbase
const pb = new PocketBase('http://203.175.10.169:8090'); // Koneksi Ke Pocketbase

// Check Sessions
const session = localStorage.getItem('userData');
const userData = session ? JSON.parse(session) : null;

// Validate Session
if (userData == null) {
    window.location.href = 'login.html';
} else {
    $("#sessionName").html(userData.record.name)
    $("#timesNowShow").html(`${formattedDate}`)
}



function getMonth(bln) {
    if (bln == 1) return "Januari";
    if (bln == 2) return "Februari";
    if (bln == 3) return "Maret";
    if (bln == 4) return "April";
    if (bln == 5) return "Mei";
    if (bln == 6) return "Juni";
    if (bln == 7) return "Juli";
    if (bln == 8) return "Agustus";
    if (bln == 9) return "September";
    if (bln == 10) return "Oktober";
    if (bln == 11) return "November";
    if (bln == 12) return "Desember";
}

// Fungsi Logout dan Hapus Session
function logout() {
    localStorage.removeItem('userData');
    window.location.href = 'login.html';
}

function formatJam(jam) {
    if (jam != null) {
        const date = new Date(jam);
        // Tambahkan 7 jam untuk mengonversi ke WIB (UTC+7)
        date.setHours(date.getUTCHours() + 7);
        // Format jam dan menit dengan padStart agar memiliki 2 digit
        const hours = date.getHours().toString().padStart(2, '0');
        const minutes = date.getMinutes().toString().padStart(2, '0');

        const timeStr = `${hours}:${minutes}`;
        return timeStr;
    }else{
        return "-";
    }   

}
