class MojeDB {
  #db;
  #ver = 3;
  #dbName = 'webyZS25';
  #tbRes = "savedResults";
  #dbRequest;

  constructor() {
      
      /// pristup k DB ///
      this.#dbRequest = indexedDB.open(this.#dbName, this.#ver);

      // vytvoreni database        
      this.#dbRequest.onsuccess = (event) => this.onsuccess(event);
      this.#dbRequest.onupgradeneeded = (ev) => this.onUpgradeNeeded(ev)
      this.#dbRequest.onerror = function(event) {
          console.log("Něco špatně: ", event.target);
      };
  }

  onUpgradeNeeded(ev) { //spusti se pouze jednou, pak už je DB vytvořena, nutno smazat storage
      console.log("zavolana fce onUpgradeNeeded");
      this.#db = ev.target.result; // nebo this.#dbRequest
      
      if(ev.oldVersion == 0) {
              const tbRes = this.#db.createObjectStore(this.#tbRes, {keyPath: "id", autoIncrement: true});
              tbRes.createIndex('jmenoInd', 'jmeno');
      }

      
  }

  onsuccess(ev) {
      console.log("db otevrena");
      this.#db = ev.target.result; //this.#dbRequest.result;
      this.#db.onerror = function(ev) {
          console.log("db error: ", ev.target.errorCode);
      };  
      //this.insertResult('F', 'R');     
      this.printRes();
  }

  insertResults(name, score) {
      const trans = this.#db.transaction(this.#tbRes, 'readwrite');
      trans.oncomplete = (e) => {
          console.log('fce insRes hotova');
      };
      trans.onerror = (e) => {
          console.log('fce insRes error: ' + e.target.errorCode)
      };

      const tbRes = trans.objectStore(this.#tbRes);
      tbRes.add({name: name, score: score})
  }

  printRes() {
    const data = [];
    const trans = this.#db.transaction(this.#tbRes, 'readonly');
    trans.oncomplete = (e) => {
        console.log('fce printRes hotova');
        this.printHtmlRes(data);
    };
    trans.onerror = (e) => {
        console.log('fce printRes error: ' + e.target.errorCode)
    };

    const tbRes = trans.objectStore(this.#tbRes);
    tbRes.openCursor().onsuccess = (ev) => {
        let curs = ev.target.result;
        if(curs) {
            console.log(curs.value, curs.key);
            data.push(curs.value);
            //jdu na dalši zaznam
            curs.continue();
        } else {
            console.log('výpis db hotov');
        }
      }
  }

  printHtmlRes(data) {
    const tbody = document.getElementById('savedResults');
        for(let a of data) {
            console.log(a);
            let tr = document.createElement('tr');
            
            let td = document.createElement('td');
            td.innerHTML = a.id;
            tr.appendChild(td);
            
            td = document.createElement('td');
            td.innerHTML = a.name;
            tr.appendChild(td);

            td = document.createElement('td');
            td.innerHTML = a.score;
            tr.appendChild(td);

            tbody.appendChild(tr);

        }
  }
}

const DB = new MojeDB();

function saveResultsFormUI() {
    const name = document.getElementById('name').value;
    const score = document.getElementById('AnswersResult').innerHTML;
    console.log(name, score);
    DB.insertResults(name,score);
    refreshPage();
}


function refreshPage() {
    window.location.reload();

}