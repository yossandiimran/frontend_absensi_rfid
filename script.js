
$(document).ready(async function () {
  var get = await getData();
  var dataGet = JSON.parse(localStorage.getItem('Token'));

  var data1 = [];

  get.forEach(function (e) {

    if (e.tanggal_masuk) {
      var tgl = dateFunct(e.tanggal_masuk);
    }

    var item = {
      "name": `
                    <td>
                        <div class="d-flex px-2">
                          <div class="my-auto">
                            <h6 class="mb-0 text-sm">`+ e.name + `</h6>
                          </div>
                        </div>
                      </td>
                `,
      "uid": e.uid,
      "email": e.username,
      "divisi": e.divisi,
      "jabatan": e.jabatan,
      'tanggal_masuk': e.tgl_masuk,
      "fungsi": `
                      <td >
                        <div class="align-middle text-center" id"buton"">
                          <button id="btnDetail" class="btn btn-primary" data-bs-toggle="modal" data-bs-target="#modalDetail" onclick="getDetail('`+ e.id + `')">
                            <i class="fa-solid fa-circle-info"></i>
                          </button>
                          <button class="btn btn-success" data-bs-toggle="modal" data-bs-target="#modalEdit" onclick="editFunct('`+ e.id + `')">
                            <i class="fa-solid fa-pen-to-square"></i>
                          </button>
                          <button class="btn btn-danger" data-bs-toggle="modal" data-bs-target="#modalHapus" onclick="delFunct('`+ e.id + `')">
                            <i class="fa-solid fa-trash-can"></i>
                          </button>
                        </div>
                    </td>
                `
    };

    data1.push(item);
  });

  console.log(data1);

  new DataTable('#tblKaryawan', {
    data: data1,
    columns: [
      { data: 'name' },
      { data: 'uid' },
      { data: 'email' },
      { data: 'divisi' },
      { data: 'jabatan' },
      { data: 'tanggal_masuk' },
      { data: 'fungsi' }
    ],
    info: false,
    ordering: false,
    paging: false
  });

  // Get data dropdown UUID

  var drop = await dropFunct();
  var check = await checkDrop();
  var myParent = document.getElementById('card_id');
  //Create and append select list
  var selectList = document.createElement("select");
  selectList.id = "uid_card";
  selectList.name = "uid_card";
  selectList.className = "form-select";
  myParent.appendChild(selectList);

  drop.forEach(function (e) {
    let found = false; // Variabel untuk melacak apakah e.uid ditemukan dalam check

    check.forEach(function (b) {
      if (e.uid === b.uid) {
        found = true;
      }
    });

    // Tambahkan <option> hanya jika e.uid tidak ditemukan dalam check
    if (!found) {
      console.log(e.uid);
      var option = document.createElement("option");
      option.value = e.uid;
      option.text = e.uid;
      option.className = "p-2";
      selectList.appendChild(option);
    }
  });


  // console.log(drop);

  // Get data dropdown UUID

});

async function dropFunct() {
  const recordDrop = await pb.collection('master_card').getFullList({});

  return recordDrop;
}

async function checkDrop() {
  const checkUid = await pb.collection('users').getFullList({});

  return checkUid;
}

async function getData() {
  const resultList = await pb.collection('users').getFullList({});

  return resultList;
}

// Simpan Data
async function saveData() {

  var name = $('#name');
  var usernameAdd = $('#usernameAdd');
  var emailAdd = $('#emailAdd');
  var uid_card = $('#uid_card').val();
  var tanggal_masuk = $('#tanggal_masuk').val();
  var foto_profile = $('#foto_profile').val();

  // console.log(uid_card);

  if (foto_profile) {

    const formData = new FormData();

    const fileInput = document.getElementById('foto_profile');

    fileInput.addEventListener('change', function () {
      for (let file of fileInput.files) {
        formData.append('documents', file);
      }
    });

    // set some other regular text field value
    formData.append('title', 'Hello world!');

    // upload and create new record
    const createdRecord = await pb.collection('users').create(formData);
  }
  // console.log("Password Sama");

  // Create Data
  const data = {
    "username": usernameAdd.val(),
    "email": emailAdd.val(),
    "emailVisibility": true,
    "password": '12345678',
    "passwordConfirm": '12345678',
    "name": name.val(),
    "uid": uid_card,
    "divisi": "temp",
    "jabatan": "temp",
    "level": 3,
    "tanggal_masuk": "2022-01-01 10:00:00.123Z"
  };

  const record = await pb.collection('users').create(data);

  if (record) {
    alert('Data Berhasil tersimpan');

    $('#name').val('');
    $('#usernameAdd').val('');
    $('#emailAdd').val('');
    $('#passwordAdd').val('');
    $('#passwordConfirm').val('');

    window.location.reload();

  } else {
    alert('Data Gagal Tersimpan');
    $('#name').focus();
  }

  // Create Data

}

function addCard() {
  $('#uuid').toggleClass('d-none');
}

async function getDetail($id) {
  const record = await pb.collection('users').getOne($id, {});

  if (record) {
    console.log(record);
    $('#det_idKar').val(record.uid);
    $('#det_name').val(record.name);
    $('#det_divisi').val(record.divisi);
    $('#det_jabatan').val(record.jabatan);
    $('#det_tglmasuk').val(record.tanggal_masuk);
  } else {
    console.log('Data Tidak Ditemukan');
  }

}

function delFunct($id) {

  $('#modalHapus').modal('show');

  $('#btnHapus').click(async () => {
    console.log("Button Hapus di click");
    const record = await pb.collection('users').delete($id);

    if (record) {
      alert('Data Berhasil Terhapus');
      window.location.reload();
    } else {
      window.location.reload();
    }

  });
}

// Edit Function

async function editFunct($id) {
  const record = await pb.collection('users').getOne($id, {});

  if (record) {

    if (record.tanggal_masuk) {
      var tgl = dateFunct(record.tanggal_masuk);
    }

    $('#edt_kar').val(record.uid);
    $('#edt_name').val(record.name);
    $('#edt_username').val(record.username);
    $('#edt_email').val(record.email);
    $('#edt_divisi').val(record.divisi);
    $('#edt_jabatan').val(record.jabatan);
    $('#edt_tglmasuk').val(tgl);
  } else {
    alert('Data Tidak Ditemukan');
  }

  // button update

  $('#btnUpdate').click(async () => {
    var username = $('#edt_username').val();
    var name = $('#edt_name').val();
    var uid = $('#edt_kar').val();
    var divisi = $('#edt_divisi').val();
    var jabatan = $('#edt_jabatan').val();
    var tgl_masuk = $('#edt_tglmasuk').val();

    const datwa = {
      "username": username,
      "emailVisibility": true,
      "name": name,
      "uid": uid,
      "divisi": divisi,
      "jabatan": jabatan,
      "tanggal_masuk": tgl_masuk
    };

    const data = {
      "username": username,
      "emailVisibility": true,
      "name": name,
      "uid": uid,
      "divisi": divisi,
      "jabatan": jabatan
    };


    const response = await pb.collection('users').update($id, data);

    if (response) {
      alert('Data Berhasil Terupdate');
      window.location.reload();
    } else {
      alert('Data Gagal Terupdate');
      $('#edt_kar').focus();
    }
  });
  // button update

}

function dateFunct($date) {
  const date = new Date($date);

  const options = {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    timeZone: 'UTC',
    hour12: false
  };

  const formattedDate = new Intl.DateTimeFormat('en-GB', options).format(date).replace(',', '');

  return formattedDate; // Output: 01/01/2022 10:00:00.123

}

// Edit Function