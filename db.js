
class MojeDB {
  #db;
  #ver = 3;
  #dbName = 'webyZS25';
  #tbRes = "savedResults";
  #tbAns = "savedAnswers";
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
      
      switch(ev.oldVersion) {
            
        case 0:
            ///neexistovala
            const tbRes = this.#db.createObjectStore(this.#tbRes, {keyPath: "id", autoIncrement: true});
            tbRes.createIndex('jmenoInd', 'jmeno');
        case 1:
            const tbAns = this.#db.createObjectStore(this.#tbAns, {keyPath: "id", autoIncrement: true});
            tbAns.createIndex('IDResInd', 'IDRes');
    }
  }

  onsuccess(ev) {
      console.log("db otevrena");
      this.#db = ev.target.result; //this.#dbRequest.result;
      this.#db.onerror = function(ev) {
          console.log("db error: ", ev.target.errorCode);
      };    
      this.printRes();
      
  }



  //konec tvorby db, zacatek prace s ni------------------------------------------------------------------------


  //vkládám řádek s výsledky do DB
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

  //mažu řádek s výsledky v DB
  deleteResults(event) {
      let button = event.target;
      let id = Number(button.getAttribute("btnDel-id"));
      console.log(id)
  
      const trans = this.#db.transaction(this.#tbRes, 'readwrite');
      trans.oncomplete = () => {
          console.log('Mazání dokončeno');
          refreshPage();
      };
      trans.onerror = (e) => {
          console.log('Chyba při mazání: ' + e.target.errorCode);
      };
  
      const tbRes = trans.objectStore(this.#tbRes);
      tbRes.delete(id);
      this.deleteAnswers(id)
  }

  //vkládám řádek s odpověďmi do DB
  insertAnswers(a) {
      const trans = this.#db.transaction(this.#tbAns, 'readwrite');
      trans.oncomplete = (e) => {
          console.log('fce insAns hotova');
      };
      trans.onerror = (e) => {
          console.log('fce insAns error: ' + e.target.errorCode)
      };

      const tbAns = trans.objectStore(this.#tbAns);
      tbAns.add({q1: a[0].checked, q2: a[1].checked, q3: a[2].checked, q4: a[3].checked, q5: a[4].checked, 
        q6: a[5].checked, q7: a[6].checked, q8: a[7].checked, q9: a[8].checked})
  }

  //mažu řádek s odpověďmi v DB
  deleteAnswers(id) {
      const trans = this.#db.transaction(this.#tbAns, 'readwrite');
      trans.oncomplete = () => {
        refreshPage();
        console.log('fce delAns hotova');
          
      };
      trans.onerror = (e) => {
          console.log('chyba při fci delAns: ' + e.target.errorCode);
      };
  
      const tbAns = trans.objectStore(this.#tbAns);
      tbAns.delete(id);
  }

  //tahám data z tbRes - jak pro vypsání v indexu tak v konzoli
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
            console.log('výpis tbRes hotov');
        }
      }
  }

  //vypisuju tabulku na index
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

        td = document.createElement('td');
        let btnShow = document.createElement("input");
        btnShow.type = "button";
        btnShow.value = "Ukaž";
        btnShow.setAttribute("btnShow-id", a.id);
        btnShow.addEventListener("mousedown", (event) => this.showSavedAns(event));
        btnShow.addEventListener("mouseup", (event) => this.uncheckAllBoxes(event));
        td.appendChild(btnShow);
        tr.appendChild(td);

        td = document.createElement('td');
        let btnDel = document.createElement("input");
        btnDel.type = "button";
        btnDel.value = "Smaž";
        btnDel.setAttribute("btnDel-id", a.id);
        btnDel.addEventListener("click", (event) => this.deleteResults(event));
        td.appendChild(btnDel);
        tr.appendChild(td);

        tbody.appendChild(tr);

    }
  }

  showSavedAns(event) {
    let button = event.target;
    let id = Number(button.getAttribute("btnShow-id"));
    const data = [];
    
    const trans = this.#db.transaction(this.#tbAns, 'readonly');
    trans.oncomplete = (e) => {
        console.log('fce printAns hotova');
        this.checkBoxes(data, id)
        
    };
    trans.onerror = (e) => {
        console.log('fce printSnd error: ' + e.target.errorCode)
    };

    const tbAns = trans.objectStore(this.#tbAns);
    tbAns.openCursor().onsuccess = (ev) => {
        let curs = ev.target.result;
        if(curs) {
            console.log(curs.value, curs.key);
            data.push(curs.value);
            //jdu na dalši zaznam
            curs.continue();
        } else {
            console.log('výpis tbAns hotov');
        }
      }

  }

  assignBoxes() {
    const q1 = document.getElementById('q1')
    const q2 = document.getElementById('q2')
    const q3 = document.getElementById('q3')
    const q4 = document.getElementById('q4')
    const q5 = document.getElementById('q5')
    const q6 = document.getElementById('q6')
    const q7 = document.getElementById('q7')
    const q8 = document.getElementById('q8')
    const q9 = document.getElementById('q9')

    const q = [q1, q2, q3, q4, q5, q6, q7, q8, q9]
    return q;
  }

  checkBoxes(data, idecko) {
    const q = this.assignBoxes()
    for (let i of data) {
      console.log(i)
      if (i.id == idecko) {
        q[0].checked = i.q1
        q[1].checked = i.q2
        q[2].checked = i.q3
        q[3].checked = i.q4
        q[4].checked = i.q5
        q[5].checked = i.q6
        q[6].checked = i.q7
        q[7].checked = i.q8
        q[8].checked = i.q9
      }
    }
  }

  uncheckAllBoxes(event) {
    const q = this.assignBoxes();
    for (let i of q) {
      i.checked = false
    }
  }
}

const DB = new MojeDB();

function saveResultsFormUI() {
    saveAnswersFormUI()
    const name = document.getElementById('name').value;
    const score = document.getElementById('AnswersResult').innerHTML;
    DB.insertResults(name,score);
    refreshPage();
}

function saveAnswersFormUI() {
  q = DB.assignBoxes()
  DB.insertAnswers(q);
}

function refreshPage() {
    window.location.reload();
}