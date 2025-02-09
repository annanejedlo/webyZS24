
class MojeDB {
  #db;
  #ver = 4;
  #dbName = 'webyZS25';
  #tbRes = "savedResults";
  #tbAns = "savedAnswers";
  #tbTheme = "setTheme";
  #dbRequest;

  constructor() {
      
      /// pristup k DB
      this.#dbRequest = indexedDB.open(this.#dbName, this.#ver);

      // vytvoreni database        
      this.#dbRequest.onsuccess = (event) => this.onsuccess(event);
      this.#dbRequest.onupgradeneeded = (ev) => this.onUpgradeNeeded(ev)
      this.#dbRequest.onerror = function(event) {
          console.log("Něco špatně: ", event.target);
      };
      //this.initDB();
      document.addEventListener("DOMContentLoaded", () => {
        const btn = document.getElementById("toggleTheme");
        if (btn) {
            btn.addEventListener("click", () => this.toggleTheme());
        } else {
            console.error("Tlačítko toggleTheme neexistuje!");
        }
    });
  }

  onUpgradeNeeded(ev) { //spusti se pouze jednou, pak už je DB vytvořena, nutno smazat storage
      console.log("zavolana fce onUpgradeNeeded");
      this.#db = ev.target.result; // nebo this.#dbRequest
      
      switch(ev.oldVersion) {
            
        case 0:
            const tbRes = this.#db.createObjectStore(this.#tbRes, {keyPath: "id", autoIncrement: true});
            tbRes.createIndex('jmenoInd', 'jmeno');
        case 1:
            const tbAns = this.#db.createObjectStore(this.#tbAns, {keyPath: "id", autoIncrement: true});
            tbAns.createIndex('IDResInd', 'IDRes');
        case 2:
            const tbTheme = this.#db.createObjectStore(this.#tbTheme, {keyPath: "id", autoIncrement: true});
            //tbTheme.createIndex()
    }
  }

  onsuccess(ev) {
      console.log("db otevrena");
      this.#db = ev.target.result; //this.#dbRequest.result;
      this.#db.onerror = function(ev) {
          console.log("db error: ", ev.target.errorCode);
      };    
      this.printRes();
      this.loadTheme()
      
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

  //vkládám informaci o barevném módu do tabulky tbTheme
  setTheme(truefalse) {
    const trans = this.#db.transaction(this.#tbTheme, 'readwrite');
    const tbTheme = trans.objectStore(this.#tbTheme);
    console.log(truefalse)

    trans.oncomplete = () => {
        console.log('Barevný mód uložen - světlá:', truefalse);
    };
    trans.onerror = (e) => {
        console.error('Chyba při ukládání motivu:', e.target.error);
    };

    // Ukládáme do IndexedDB (vždy přepisujeme existující hodnotu)
    tbTheme.put({ id: "lightTheme", theme: truefalse });
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
        btnShow.addEventListener("click", (event) => this.showSavedAns(event));
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
    console.log("Zmáčknuto, ID zmáčknutého tlačítka je " + id);
    let nadpis = document.getElementById("nadpis");
    const data = [];

    // 🛑 Pokud existuje staré tlačítko, vrátíme ho na "Ukaž"
    if (this.activeButton && this.activeButton !== button) {
        this.activeButton.value = "Ukaž";
    }

    if (button.value === "Ukaž") {
        button.value = "Schovej";
        this.activeButton = button;  // 🎯 Uložíme nové aktivní tlačítko
        console.log("Upraveno tlačítko s ID " + id + " z Ukaž na Schovej");

        const trans = this.#db.transaction(this.#tbAns, 'readonly');
        trans.oncomplete = () => {
            console.log('Fce printAns hotova');
            this.checkBoxes(data, id);
            console.log("Zaškrtané odpovídající boxy pro člověka s ID " + id);
        };
        trans.onerror = (e) => {
            console.log('Fce printAns error: ' + e.target.errorCode);
        };

        const tbAns = trans.objectStore(this.#tbAns);
        tbAns.openCursor().onsuccess = (ev) => {
            let curs = ev.target.result;
            if (curs) {
                data.push(curs.value);
                this.getNameFromRes(id).then(jmeno => {  
                    console.log("Jméno člověka se zvoleným ID: " + jmeno);
                    nadpis.innerHTML = jmeno 
                        ? `!!! ZOBRAZUJI ULOŽENÉ VÝSLEDKY PEKELNÍKA ${jmeno} !!!` 
                        : "!!! ZOBRAZUJI ULOŽENÉ VÝSLEDKY PEKELNÍKA !!!";
                });
                curs.continue();
            } 
            document.getElementById('resultsForm').style.visibility = "hidden";
        };

        // 🛑 Nejdřív odstraníme předchozí listener
        document.removeEventListener("click", this.handleOutsideClick);

        // 🎯 Nastavíme nový listener
        this.handleOutsideClick = (event) => {
            if (event.target !== button) { 
                this.uncheckAllBoxes();
                nadpis.innerHTML = "Zaškrtni checkboxy u zločinů, které jsi provedl, pekelníku.";
                button.value = "Ukaž";
                document.getElementById('resultsForm').style.visibility = "visible";

                console.log("Změna HTML na základě kliknutí mimo, ID: " + id);

                document.removeEventListener("click", this.handleOutsideClick);
            }
        };

        document.addEventListener("click", this.handleOutsideClick);
        
    } else if (button.value === "Schovej") {
        console.log("Zavoláno showSavedAns, když value tlačítka je Schovej");
        this.uncheckAllBoxes();
        nadpis.innerHTML = "Zaškrtni checkboxy u zločinů, které jsi provedl, pekelníku.";
        button.value = "Ukaž";
        document.getElementById('resultsForm').style.visibility = "visible";

        document.removeEventListener("click", this.handleOutsideClick);
    } else {
        console.log("Chyba, prosím o refresh");
    }
}




// Funkce pro získání jména z tbRes
async getNameFromRes(id) {
    return new Promise((resolve, reject) => {
        const trans = this.#db.transaction(this.#tbRes, 'readonly');
        const tbRes = trans.objectStore(this.#tbRes);
        const request = tbRes.get(id);

        request.onsuccess = (event) => {
            if (request.result) {
                resolve(request.result.name);
                nadpis.innerHTML = "!!! ZOBRAZUJI ULOŽENÉ VÝSLEDKY PEKELNÍKA " + request.result.name + " !!!"
            } else {
                resolve("Neznámý pekelník");
            }
        };

        request.onerror = () => {
            reject("Chyba při získávání jména");
        };
    });
    }




  /*getNameFromRes(id) {
    const trans = this.#db.transaction(this.#tbRes, 'readonly');
    const tbRes = trans.objectStore(this.#tbRes);
    const request = tbRes.get(id);
    console.log("v getnamefromres je id: " + id)

    request.onsuccess = (event) => {
        const result = event.target.result;
        console.log(result)
        if (result.id == id) {
            
        } else {
            console.log(`Pro ID ${id} nebyl nalezen záznam v tbRes`);
            nadpis.innerHTML = "!!! ZOBRAZUJI ULOŽENÉ VÝSLEDKY PEKELNÍKA !!!"
        }
    };

    request.onerror = (event) => {
        console.error("Chyba při hledání v tbRes:", event.target.error);
    };
    }*/



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

  loadTheme() {
    const trans = this.#db.transaction(this.#tbTheme, 'readonly');
    const tbTheme = trans.objectStore(this.#tbTheme);
    const request = tbTheme.get("lightTheme");
    console.log("zavolana fce loadTheme")

    request.onsuccess = (event) => {
        const data = event.target.result;
        console.log("succes fce loadTheme"+data.theme)
        if (data) {
            console.log("Načtený mód - světlý:", data.theme);
            if (data.theme == true) {
                document.body.classList.add("light-mode");
            } else {
                document.body.classList.remove("light-mode");
            }
        }
    };

    request.onerror = (event) => {
        console.error("Chyba při čtení motivu:", event.target.error);
    };
    }

  toggleTheme() {
        document.body.classList.toggle("light-mode");
        const isLightMode = document.body.classList.contains("light-mode");
        console.log("isLightMode")
        this.setTheme(isLightMode);
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