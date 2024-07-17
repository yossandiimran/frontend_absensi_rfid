const pb = new PocketBase('http://127.0.0.1:8090');

$( document ).ready(async function() {
    var get = await getData();

    var data1 = [];

    get.forEach(function (e,i) {
        var item = { 
            "no": i+1,
            "uid": e.uid,
            "fungsi": `
                  <td >
                    <div class="align-middle text-center" id"buton"">
                      
                      <button class="btn btn-success" data-bs-toggle="modal" data-bs-target="#modalEdit" onclick="editFunct('`+e.id+`')">
                        <i class="fa-solid fa-pen-to-square"></i>
                      </button>
                      <button class="btn btn-danger" data-bs-toggle="modal" data-bs-target="#modalHapus" onclick="delFunct('`+e.id+`')">
                        <i class="fa-solid fa-trash-can"></i>
                      </button>
                    </div>
                </td>
            `
        };

        data1.push(item);
    });

    console.log(data1);
    new DataTable('#tblRfid', {
        data: data1,
        columns: [
            { data: 'no'},
            { data: 'uid'},
            { data: 'fungsi'} 
        ],
        info: false,
        ordering: false,
        paging: false
    });

});

async function getData(){
    // const resultList = await pb.collection('master_card').getFullList({});
    const resultList = await pb.collection('master_card').getFullList({});
    

    return resultList;
}

async function saveData(){

    var uuid = $('#uuid').val();
    const data = {
        "uid": uuid
    };
    const record = await pb.collection('master_card').create(data);

        if(record){
          alert('Data Berhasil tersimpan');

          $('#uuid').val('');
          
          window.location.reload();

        }else{
          alert('Data Gagal Tersimpan');
          $('#uui').focus();
        }

}

function delFunct($id){

    $('#modalHapus').modal('show');

    $('#btnHapus').click( async () => {
      console.log("Button Hapus di click");
      const record = await pb.collection('master_card').delete($id);

      if(record){
        alert('Data Berhasil Terhapus');
        window.location.reload();
      }else{
        window.location.reload();
      }

    });
  }

  // Edit Function

  async function editFunct($id){
    const record = await pb.collection('master_card').getOne($id, {});
    
    if(record){
      console.log(record);
      $('#uuid_edit').val(record.uid);
    }else{
      alert('Data Tidak Ditemukan');
    }

    // button update

    $('#btnUpdate').click( async () => {
      var uuid = $('#uuid_edit').val();
      const data = {
        "uid": uuid
    };
      const response = await pb.collection('master_card').update($id, data);
    
      if(response){
        alert('Data Berhasil Terupdate');
        window.location.reload();
      }else{
        alert('Data Gagal Terupdate');
        $('#edt_kar').focus();
      }
    });
    // button update
    
  }

  // Edit Function