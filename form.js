class Form {
  constructor() {
    
  }
  

  evaluateAnswers() {
    console.log("zavolana fce class Form evaluateAnswers")
    var currCircle = 0;
    

    const q1 = document.getElementById('q1')
    const q2 = document.getElementById('q2')
    const q3 = document.getElementById('q3') 
    const q4 = document.getElementById('q4')
    const q5 = document.getElementById('q5')

    checkForBiggValue(q1);
    checkForBiggValue(q2);
    checkForBiggValue(q3);
    checkForBiggValue(q4);
    checkForBiggValue(q5);

    function checkForBiggValue(a) {
      console.log("zavolana fce ckeckForBiggValue pro: " + a)
      console.log("a value: " + a.value)
      if (a.checked) {
        if (a.value > currCircle) {
          currCircle = a.value;
          
        }
      }
    }

    console.log("current circle: " + currCircle)

    this.showResult(currCircle)

    

  }

  showResult(a) {
    const result = document.getElementById('AnswersResult')
    const ansForm = document.getElementById('AnswersForm')
    console.log("result text ig? : " + result.id)
    result.innerHTML = a

    const saveForm = document.getElementById('saveResultsForm')
    saveForm.style.visibility = "visible";
    
  }

  SaveEvaluation() {

  }
}
const form = new Form();
function evalAnswers() {
  console.log("zavolana verejna fce evalAnswers")
  form.evaluateAnswers();
}