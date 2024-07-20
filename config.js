// Global Variable
const now = new Date();
const year = now.getFullYear();
const month = now.getMonth() + 1;
const day = now.getDate();
const hours = now.getHours();
const minutes = now.getMinutes();
const seconds = now.getSeconds();

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
    $("#timesNowShow").html(`${day},&nbsp;${getMonth(month)}&nbsp;${year}\n${hours}:${minutes}`)
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
